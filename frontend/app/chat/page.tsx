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

type ChatMessage = { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock };

const DEFAULT_STAGES = ["Thinking", "Reading your inbox", "Preparing response"];

function textFromMessage(message: AgentUIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => String(part.text || "")).join(""); }

function dedupeChatMessages(items: ChatMessage[]) {
  const hasStructuredEmailList = items.some(
    (item) => item.role === "agent" && item.response?.kind === "email-list"
  );
  const hasStructuredDraft = items.some(
    (item) => item.role === "agent" && item.response?.kind === "draft"
  );
  const hasStructuredSchedule = items.some(
    (item) => item.role === "agent" && item.response?.kind === "schedule"
  );
  const hasStructuredAction = items.some(
    (item) =>
      item.role === "agent" &&
      item.response?.kind === "text" &&
      Boolean(item.response.citations?.length) &&
      /\b(marked|archived)\b/i.test(item.response.content)
  );

  const seen = new Set<string>();

  return items.filter((item) => {
    if (item.role !== "agent" || !item.response) return true;

    // When Gmail returned structured email data, the cards are the complete
    // response. Never render the model's duplicate prose alongside them.
    if (hasStructuredEmailList) {
      if (item.response.kind === "email-list") {
        const emails = item.response.emails || [];
        const fingerprint =
          "email-list:" +
          emails.map((email) => `${email.id}|${email.senderEmail}|${email.subject}|${email.receivedAt}`).join(";");
        if (seen.has(fingerprint)) return false;
        seen.add(fingerprint);
        return true;
      }
      return false;
    }

    if (item.response.kind === "text") {
      const content = String(item.response.content || "").trim();

      if (hasStructuredAction && !item.response.citations?.length && /\b(marked|archived)\b/i.test(content)) {
        return false;
      }

      if (hasStructuredDraft || hasStructuredSchedule) {
        const repeatsAction =
          /^(done[.!]?|i'?ve created|i created|created|draft .* (created|saved)|the draft .* (saved|created)|would you like me to (send|review|edit)|here'?s your draft)/i.test(content);
        if (repeatsAction) return false;
      }

      const actionKey = content
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      if (actionKey && seen.has("text:" + actionKey)) return false;
      if (actionKey) seen.add("text:" + actionKey);
    }

    return true;
  });
}function groupAgentResponses(items: ChatMessage[]) {
  const result: ChatMessage[] = [];

  for (const item of items) {
    const previous = result[result.length - 1];

    if (
      previous?.role === "agent" &&
      previous.response?.kind === "text" &&
      item.role === "agent" &&
      item.response?.kind === "text"
    ) {
      const previousResponse = previous.response;
      const currentResponse = item.response;
      const citations = [
        ...(previousResponse.citations || []),
        ...(currentResponse.citations || []),
      ];
      const seen = new Set<string>();

      previous.response = {
        ...previousResponse,
        content: [previousResponse.content, currentResponse.content]
          .filter(Boolean)
          .join("\n\n"),
        citations: citations.filter((citation) => {
          if (seen.has(citation.id)) return false;
          seen.add(citation.id);
          return true;
        }),
      };
      continue;
    }

    result.push({ ...item });
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
    if (action.type === "open-email") { window.open("https://mail.google.com/mail/u/0/#all/" + encodeURIComponent(action.emailId), "_blank", "noopener,noreferrer"); return; }
    if (action.type === "confirm-send" || action.type === "schedule-accept" || action.type === "confirm") { void handleApproval(action.type === "confirm" ? action.choice === "yes" : true); return; }
    if (action.type === "schedule-cancel") { void handleApproval(false); return; }
    if (action.type === "continue-draft") return;
  }, [handleApproval]);

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
            <div className="chat-page__thread">
              <div className="chat-page__thread-inner">
                {messages.map((message, index) => {
  if (message.role === "user") {
    return <UserMessage key={message.id} content={message.content || ""} />;
  }

  const previous = messages[index - 1];
  const startsAssistantGroup = !previous || previous.role === "user";
  if (!startsAssistantGroup) return null;

  const group = [];
  for (let i = index; i < messages.length && messages[i].role === "agent"; i++) {
    group.push(messages[i]);
  }

  return (
    <div key={message.id} className="chat-page__assistant-response">
      {group.map((item) => (
        <ChatResponse
          key={item.id}
          response={item.response!}
          onAction={handleAction}
        />
      ))}
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

