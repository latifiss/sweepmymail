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
import { getAgentContext, getAgentConversation, listAgentConversations, createAgentConversation, deleteAgentConversation, updateAgentConversation, streamAgentMessage, storedMessagesToUI, uiMessageToChatMessage, type AgentConversation, type AgentUIMessage, type ApprovalRequest } from "@/lib/agent-api";

type ChatMessage = { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock };

const DEFAULT_STAGES = ["Thinking", "Reading your inbox", "Preparing response"];

function textFromMessage(message: AgentUIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => String(part.text || "")).join(""); }

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
      setMessages(ui.map(uiMessageToChatMessage).filter(Boolean) as ChatMessage[]);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to load conversation"); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [items, ctx] = await Promise.all([listAgentConversations(), getAgentContext()]);
        if (cancelled) return;
        setConversations(items); setContext(ctx);
        const newest = items.find((item) => item.status === "active");
        if (newest) await loadConversation(newest.id);
      } catch {}
    })();
    return () => { cancelled = true; abortRef.current?.abort(); };
  }, [loadConversation]);

  const runAgent = useCallback(async (nextMessages: AgentUIMessage[], path = "/agent/chat") => {
    abortRef.current?.abort();
    const controller = new AbortController(); abortRef.current = controller;
    setThinking(true); setError(null); setApproval(null);
    try {
      const result = await streamAgentMessage(nextMessages, conversationId, path, controller.signal);
      if (result.conversationId && result.conversationId !== conversationId) setConversationId(result.conversationId);
      setUiMessages(result.messages);
      setMessages(result.messages.map(uiMessageToChatMessage).filter(Boolean) as ChatMessage[]);
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
    await runAgent(next);
  }, [conversationId, thinking, uiMessages, runAgent]);

  const handleApproval = useCallback(async (approved: boolean) => {
    if (!approval || !conversationId || thinking) return;
    const approvalMessage: AgentUIMessage = {
      id: "approval-" + Date.now(),
      role: "tool",
      parts: [{ type: "tool-approval-response", approvalId: approval.approvalId, toolCallId: approval.toolCallId, approved }],
    };
    const next = [...uiMessages, approvalMessage];
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
  const chats = useMemo(() => conversations.filter((item) => item.status === "active").map((item) => ({ id: item.id, label: item.title })), [conversations]);

  return (
    <div className="chat-page">
      <div className="chat-page__body">
        <div className="chat-page__rail">
          <Sidebar chats={chats} plan="free" onNewChat={handleNewChat} onCupboard={() => setCupboardOpen(true)} onSelectChat={(id) => void loadConversation(id)} onRenameChat={(id) => void handleRename(id)} onDeleteChat={(id) => void handleDelete(id)} onUpgrade={() => window.location.assign("/pricing")} />
          <div className={"chat-page__cupboard" + (cupboardOpen ? " chat-page__cupboard--open" : "")}>
            <Cupboard email={email} mailsCount={context?.inbox?.syncedEmails} categoriesCount={context?.categories?.length} priorityCount={context?.inbox?.important} categories={(context?.categories || []).map((c: any) => c.label)} onClose={() => setCupboardOpen(false)} />
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
                {messages.map((message) => message.role === "user" ? <UserMessage key={message.id} content={message.content || ""} /> : <ChatResponse key={message.id} response={message.response!} onAction={handleAction} />)}
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

void handleRename;
void handleDelete;