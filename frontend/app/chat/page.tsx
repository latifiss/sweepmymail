"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AltHeader from "@/components/headers/altHeader";
import Sidebar from "@/components/sidebar";
import Cupboard from "@/components/cupboard";
import PromptInput from "@/components/promptInput";
import UserMessage from "@/components/chat/userMessage";
import ChatResponse from "@/components/chat/chatResponse";
import ThinkingIndicator from "@/components/chat/thinkingIndicator";
import type { ResponseAction, ResponseBlock } from "@/components/chat/chat-response-types";
import { getBetterAuthSession } from "@/lib/auth-session";
import { getAgentContext, getAgentConversation, listAgentConversations, createAgentConversation, deleteAgentConversation, updateAgentConversation, streamAgentMessage, storedMessagesToUI, uiMessageToChatMessage, type AgentConversation, type AgentUIMessage, type ApprovalRequest } from "@/lib/agent-api";

type ChatMessage = { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock; responses?: ResponseBlock[] };

const DEFAULT_STAGES = ["Thinking", "Reading your inbox", "Preparing response"];

function textFromMessage(message: AgentUIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => String(part.text || "")).join(""); }

function responseKey(response: ResponseBlock): string {
  switch (response.kind) {
    case "email-list":
      return "email-list:" + response.emails.map((email) => email.id).join(",");
    case "draft":
      return "draft:" + response.draft.id;
    case "schedule":
      return "schedule:" + response.event.id;
    case "summary":
      return "summary:" + (response.title || "") + ":" + response.content;
    case "confirm":
      return "confirm:" + response.promptId;
    case "group":
      return "group:" + response.blocks.map(responseKey).join("|");
    case "text":
      return "text:" + response.content;
  }
}

function dedupeChatMessages(items: ChatMessage[]) {
  return items.map((item) => {
    if (item.role !== "agent") return item;
    const responses = item.responses || (item.response ? [item.response] : []);
    const seen = new Set<string>();
    const unique = responses.filter((response) => {
      const key = responseKey(response);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return {
      ...item,
      response: unique.length === 1 ? unique[0] : undefined,
      responses: unique.length > 1 ? unique : undefined,
    };
  }).filter((item) => item.role !== "agent" || Boolean(item.response || item.responses?.length));
}

function explicitlyRequestsEmailList(message: string) {
  return /\b(show|list|display|give me|fetch|pull up|bring up)\b/i.test(message)
    && /\b(emails?|messages?|inbox)\b/i.test(message);
}

function groupAgentResponses(items: ChatMessage[]) {
  const result: ChatMessage[] = [];
  let latestUserMessage = "";

  for (let index = 0; index < items.length;) {
    const item = items[index];
    if (item.role === "user") {
      latestUserMessage = item.content || "";
      result.push(item);
      index += 1;
      continue;
    }

    const turn: ResponseBlock[] = [];
    while (index < items.length && items[index].role === "agent") {
      const current = items[index];
      turn.push(...(current.responses || (current.response ? [current.response] : [])));
      index += 1;
    }

    const flattened = turn.flatMap((response) =>
      response.kind === "group" ? response.blocks : [response],
    );
    const citationContext = flattened.filter(
      (response) => response.kind === "summary" && !response.content.trim() && response.citations.length,
    );
    const prose = flattened.filter(
      (response) => response.kind === "text" && Boolean(response.content.trim()),
    );
    const listResponses = flattened.filter((response) => response.kind === "email-list");

    // A read_emails tool result is citation context, not a second email-list card.
    // Attach those source references to the assistant's actual natural-language summary.
    let blocks = flattened.filter(
      (response) => !(response.kind === "summary" && !response.content.trim() && response.citations.length),
    );
    if (citationContext.length && prose.length) {
      const citations = citationContext.flatMap((response) =>
        response.kind === "summary" ? response.citations : [],
      );
      const uniqueCitations = Array.from(
        new Map(citations.map((citation) => [citation.id, citation])).values(),
      );
      const summaryText = prose.map((response) => response.content).join("\\n\\n");
      const summaryLead = prose.map((response) => response.lead).find(Boolean) || "";
      blocks = blocks.filter((response) => response.kind !== "text" && response.kind !== "email-list");
      blocks.push({
        kind: "summary",
        lead: summaryLead,
        title: undefined,
        content: summaryText,
        citations: uniqueCitations,
      });
    } else if (listResponses.length && !explicitlyRequestsEmailList(latestUserMessage)) {
      // Search results are evidence by default, not a command to render a list.
      // Keep the model's conversational answer unless the user explicitly asked
      // to see the matching emails.
      blocks = blocks.filter((response) => response.kind !== "email-list");
      if (!blocks.length) {
        const total = listResponses.reduce(
          (count, response) => count + (response.kind === "email-list" ? response.emails.length : 0),
          0,
        );
        blocks.push({
          kind: "text",
          content: total
            ? `I found ${total} matching email${total === 1 ? "" : "s"} in your inbox.`
            : "I couldn't find any matching emails in your inbox.",
        });
      }
    } else if (listResponses.length) {
      // The user explicitly asked to see emails; render the structured list
      // instead of duplicating the same rows in assistant prose.
      blocks = blocks.filter((response) => response.kind !== "text");
    }

    const seen = new Set<string>();
    blocks = blocks.filter((response) => {
      const key = responseKey(response);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (blocks.length === 1) {
      result.push({ id: item.id, role: "agent", response: blocks[0] });
    } else if (blocks.length > 1) {
      result.push({ id: item.id, role: "agent", response: { kind: "group", blocks } });
    }
  }

  return result;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [uiMessages, setUiMessages] = useState<AgentUIMessage[]>([]);
  const [conversations, setConversations] = useState<AgentConversation[]>([]);
  const [conversationId, setConversationId] = useState<string>();
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [cupboardOpen, setCupboardOpen] = useState(false);
  const [context, setContext] = useState<any>(null);
  const [email, setEmail] = useState("Gmail");
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);

  const refreshConversations = useCallback(async () => {
    try { setConversations(await listAgentConversations()); } catch {}
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setError(null); setThinking(false); setApproval(null);
    try {
      const data = await getAgentConversation(id);
      const ui = storedMessagesToUI(data.messages);
      setConversationId(data.conversation.id); setUiMessages(ui);
      setMessages(dedupeChatMessages(ui.map(uiMessageToChatMessage).filter(Boolean) as ChatMessage[]));
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load conversation"); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, ctx, session] = await Promise.all([listAgentConversations(), getAgentContext(), getBetterAuthSession()]);
        if (session?.user?.email) setEmail(session.user.email);
        if (cancelled) return;
        setConversations(items); setContext(ctx);
        const newest = items.find((item) => item.status === "active");
        if (newest) await loadConversation(newest.id);
      } catch {}
    })();
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, [loadConversation]);

  const runAgent = useCallback(async (nextMessages: AgentUIMessage[], path = "/agent/chat", activeConversationId?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setThinking(true); setError(null); setApproval(null);
    try {
      const result = await streamAgentMessage(nextMessages, activeConversationId ?? conversationId, path, controller.signal);
      if (result.conversationId && result.conversationId !== conversationId) setConversationId(result.conversationId);
      setUiMessages(result.messages);
      setMessages(dedupeChatMessages(result.messages.map(uiMessageToChatMessage).filter(Boolean) as ChatMessage[]));
      setApproval(result.approval || null);
      await refreshConversations();
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(e instanceof Error ? e.message : "Agent request failed");
    } finally { setThinking(false); }
  }, [conversationId, refreshConversations]);

  const handleSubmit = useCallback(async (content: string) => {
    if (!content.trim() || thinking) return;
    let id = conversationId;
    if (!id) {
      const conversation = await createAgentConversation(); id = conversation.id; setConversationId(id);
    }
    const message: AgentUIMessage = { id: "user-" + Date.now(), role: "user", parts: [{ type: "text", text: content }] };
    const next = [...uiMessages, message];
    setUiMessages(next); setMessages(next.map(uiMessageToChatMessage).filter(Boolean) as ChatMessage[]);
    await runAgent(next, "/agent/chat", id);
  }, [conversationId, thinking, uiMessages, runAgent]);

  const handleApproval = useCallback(async (approved: boolean) => {
    if (!approval || !conversationId || thinking) return;

    const next = uiMessages.map((message) => ({
      ...message,
      parts: message.parts.map((part: any) => {
        if (
          part.toolCallId === approval.toolCallId ||
          (part.approval && part.approval.id === approval.approvalId)
        ) {
          return {
            ...part,
            state: "approval-responded",
            approval: {
              ...(part.approval || {}),
              id: approval.approvalId,
              approved,
            },
          };
        }
        return part;
      }),
    }));

    setUiMessages(next);
    setApproval(null);
    await runAgent(next, "/agent/chat/continue");
  }, [approval, conversationId, thinking, uiMessages, runAgent]);

  const handleAction = useCallback((action: ResponseAction) => {
    if (action.type === "open-email") {
      window.open(
        "https://mail.google.com/mail/u/0/#all/" +
          encodeURIComponent(action.emailId),
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    // Structured response buttons are shortcuts for normal chat follow-ups.
    // Keep the action in the conversation so the agent receives the same
    // context as if the user had typed the follow-up themselves.
    if (action.type === "confirm-send") {
      void handleSubmit("Confirm and send draft");
      return;
    }

    if (action.type === "continue-draft") {
      void handleSubmit(`Continue with draft ${action.draftId}`);
      return;
    }

    if (action.type === "schedule-accept") {
      if (approval) {
        void handleApproval(true);
      } else {
        void handleSubmit(`Confirm and schedule event ${action.eventId}`);
      }
      return;
    }

    if (action.type === "schedule-cancel") {
      if (approval) {
        void handleApproval(false);
      } else {
        void handleSubmit(`Cancel the scheduled event ${action.eventId}`);
      }
      return;
    }

    if (action.type === "confirm") {
      if (approval) {
        void handleApproval(action.choice === "yes");
      } else {
        void handleSubmit(
          action.choice === "yes"
            ? `Confirm prompt ${action.promptId}`
            : `Cancel prompt ${action.promptId}`,
        );
      }
    }
  }, [approval, handleApproval, handleSubmit]);

  const handleNewChat = useCallback(async () => {
    abortRef.current?.abort();
    const conversation = await createAgentConversation();
    setConversationId(conversation.id); setUiMessages([]); setMessages([]); setApproval(null); setError(null);
    await refreshConversations();
  }, [refreshConversations]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteAgentConversation(id);
    if (id === conversationId) { setConversationId(undefined); setUiMessages([]); setMessages([]); setApproval(null); }
    await refreshConversations();
  }, [conversationId, refreshConversations]);

  const handleRename = useCallback(async (id: string) => {
    const current = conversations.find((item) => item.id === id);
    const title = window.prompt("Rename conversation", current?.title || "Conversation");
    if (!title?.trim()) return;
    await updateAgentConversation(id, { title: title.trim() }); await refreshConversations();
  }, [conversations, refreshConversations]);

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking, approval, error]);

  const isEmpty = messages.length === 0 && !thinking && !error;
  const chats = useMemo(() => conversations
    .filter((item) => item.status === "active")
    .map((item) => ({ id: item.id, label: item.title?.trim() || "New conversation" })),
    [conversations]);

  return (
    <div className="chat-page">
      <div className="chat-page__body">
        <div className="chat-page__rail">
          <Sidebar chats={chats} plan="free" onNewChat={handleNewChat} onCupboard={() => setCupboardOpen(true)} onSelectChat={(id) => void loadConversation(id)} onUpgrade={() => window.location.assign("/pricing")} />
          <div className={"chat-page__cupboard" + (cupboardOpen ? " chat-page__cupboard--open" : "")}>
            <Cupboard email={email} mailsCount={context?.inbox?.syncedEmails} categoriesCount={context?.categories?.length} priorityCount={context?.inbox?.important} categories={(context?.categories || []).map((c: any) => c.label)} automationsCount={context?.automations?.total} scheduledCount={context?.scheduled?.pending} requestsToday={context?.usage?.requestsToday} requestLimit={context?.usage?.requestLimit} tokensToday={context?.usage?.tokensToday} tokenLimit={context?.usage?.tokenLimit} onClose={() => setCupboardOpen(false)} />
          </div>
        </div>
        <div className="chat-page__main">
          <div className="chat-page__header"><AltHeader /></div>
          {error && <div className="chat-page__error" role="alert">{error}</div>}
          {isEmpty ? (
            <div className="chat-page__empty"><div className="chat-page__empty-greeting"><span className="chat-page__empty-hi">HI!</span><span className="chat-page__empty-title">I&apos;m your inbox agent.</span><p className="chat-page__empty-description">Ask me to summarize your inbox, draft a reply, archive a category, or schedule a follow-up. I&apos;ll show you what I find.</p></div></div>
          ) : (
            <div ref={threadRef} className="chat-page__thread">
              <div className="chat-page__thread-inner">
                {groupAgentResponses(messages).map((message) => {
  if (message.role === "user") {
    return <UserMessage key={message.id} content={message.content || ""} />;
  }

  return (
    <div key={message.id} className="chat-page__assistant-response">
      {message.response && (
        <ChatResponse response={message.response} onAction={handleAction} />
      )}
    </div>
  );
})}
                {approval && <ChatResponse response={{ kind: "confirm", lead: "This action needs your approval.", promptId: approval.approvalId, question: "Allow " + approval.toolName.replaceAll("_", " ") + " to run?" }} onAction={handleAction} /> }
                {thinking && <ThinkingIndicator stages={DEFAULT_STAGES} stageDuration={900} onComplete={() => undefined} />}
              </div>
            </div>
          )}
          <div className="chat-page__composer"><div className="chat-page__composer-inner"><PromptInput email={email} onSubmit={handleSubmit} /></div></div>
        </div>
      </div>
    </div>
  );
}

