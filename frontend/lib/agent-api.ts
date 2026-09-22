import type { ResponseBlock, EmailRef, EmailDraft, ScheduleEvent } from "@/components/chat/chat-response-types";

const baseUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:7000";

export type AgentConversation = { id: string; user_id: string; title: string; status: "active" | "archived"; created_at: string; updated_at: string };
export type StoredAgentMessage = { id: string; conversation_id: string; role: "user" | "assistant" | "system" | "tool"; content: unknown; metadata?: Record<string, unknown>; created_at: string };
export type AgentContext = { inbox: { syncedEmails: number; unread: number; important: number }; categories: Array<{ id: string; label: string; emailCount: number }>; automations: { total: number; active: number; paused: number }; scheduled: { pending: number; total: number }; usage: { requestsToday: number; tokensToday: number; requestLimit: number; tokenLimit: number }; generatedAt: string };
export type AgentUIMessage = { id: string; role: "user" | "assistant" | "tool"; parts: Array<Record<string, unknown>> };
export type ApprovalRequest = { approvalId: string; toolName: string; input: unknown; toolCallId?: string };

async function request(path: string, init?: RequestInit) {
  const response = await fetch(baseUrl() + path, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers || {}) }, cache: "no-store" });
  if (!response.ok) {
    let payload: any = null; try { payload = await response.json(); } catch {}
    const error = new Error(payload?.error?.message || payload?.error || "Request failed") as Error & { code?: string; retryable?: boolean };
    error.code = payload?.error?.code; error.retryable = payload?.error?.retryable; throw error;
  }
  return response;
}

export async function listAgentConversations() { return (await (await request("/agent/conversations")).json()).conversations as AgentConversation[]; }
export async function getAgentConversation(id: string) { return await (await request("/agent/conversations/" + encodeURIComponent(id))).json() as { conversation: AgentConversation; messages: StoredAgentMessage[] }; }
export async function createAgentConversation(title?: string) { return (await (await request("/agent/conversations", { method: "POST", body: JSON.stringify({ title }) })).json()).conversation as AgentConversation; }
export async function updateAgentConversation(id: string, patch: { title?: string; status?: "active" | "archived" }) { return (await (await request("/agent/conversations/" + encodeURIComponent(id), { method: "PATCH", body: JSON.stringify(patch) })).json()).conversation as AgentConversation; }
export async function deleteAgentConversation(id: string) { await request("/agent/conversations/" + encodeURIComponent(id), { method: "DELETE" }); }
export async function getAgentContext() { return (await (await request("/agent/context")).json()).context as AgentContext; }

function textOf(message: AgentUIMessage) { return message.parts.filter((part) => part.type === "text").map((part) => String(part.text || "")).join(""); }
function toolOf(message: AgentUIMessage): any { return message.parts.find((part) => String(part.type || "").startsWith("tool-") || part.type === "dynamic-tool"); }
function refFrom(value: any): EmailRef | null { const e = value?.email || value; const id = e?.messageId || e?.message_id; if (!id) return null; return { id: String(id), sender: String(e.sender || e.from || "Unknown sender"), senderEmail: String(e.senderEmail || e.fromEmail || ""), subject: String(e.subject || "(no subject)"), preview: String(e.snippet || e.preview || "").slice(0, 180), receivedAt: String(e.date || e.receivedAt || new Date().toISOString()) }; }

export function uiMessageToChatMessage(message: AgentUIMessage): { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock } | null {
  if (message.role === "user") return { id: message.id, role: "user", content: textOf(message) };
  if (message.role === "tool") return null;
  const text = textOf(message); const tool = toolOf(message); const name = String(tool?.toolName || tool?.name || ""); const output = tool?.output;
  const emails = Array.isArray(output?.emails) ? output.emails.map(refFrom).filter(Boolean) as EmailRef[] : []; const citation = refFrom(tool); const citations = citation ? [citation] : [];
  if (name.includes("get_recent_emails") || name.includes("search_emails")) return { id: message.id, role: "agent", response: { kind: "email-list", lead: text || "Here are the emails I found.", emails } };
  if (name.includes("create_draft") || name.includes("reply_to_email") || name.includes("forward_email")) { const d = output?.draft || output; const draft: EmailDraft = { id: String(d?.draftId || d?.id || tool?.toolCallId || message.id), to: String(d?.to || d?.recipients || ""), cc: d?.cc ? String(d.cc) : undefined, subject: String(d?.subject || ""), body: String(d?.body || text || "") }; return { id: message.id, role: "agent", response: { kind: "draft", lead: text || "I created the draft.", draft } }; }
  if (name.includes("schedule_email")) { const e = output?.scheduledEmail || output?.event || output; const event: ScheduleEvent = { id: String(e?.id || tool?.toolCallId || message.id), title: String(e?.subject || e?.title || "Scheduled email"), when: String(e?.sendAt || e?.when || ""), duration: "" }; return { id: message.id, role: "agent", response: { kind: "schedule", lead: text || "The email is ready to schedule.", event } }; }
  return { id: message.id, role: "agent", response: { kind: "text", content: text || "Done.", citations } };
}

export function storedMessagesToUI(messages: StoredAgentMessage[]): AgentUIMessage[] {
  return messages.flatMap((message) => {
    if (message.content && typeof message.content === "object" && (message.role === "user" || message.role === "assistant" || message.role === "tool")) return [message.content as AgentUIMessage];
    if (typeof message.content === "string") return [{ id: message.id, role: message.role === "user" ? "user" : message.role === "tool" ? "tool" : "assistant", parts: [{ type: "text", text: message.content }] }];
    return [];
  });
}

export async function streamAgentMessage(messages: AgentUIMessage[], conversationId?: string, path = "/agent/chat", signal?: AbortSignal, onEvent?: (event: any) => void) {
  const response = await request(path, { method: "POST", body: JSON.stringify({ conversationId, messages }), signal });
  if (!response.body) throw new Error("Agent returned an empty response");
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; const resultMessages = [...messages]; let current: AgentUIMessage | null = null; let approval: ApprovalRequest | undefined;
  const handle = (raw: string) => { const line = raw.trim(); if (!line || !line.startsWith("data:")) return; const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") return; let event: any; try { event = JSON.parse(payload); } catch { return; } onEvent?.(event);
    if (event.type === "text-start") { current = { id: String(event.id || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] }; resultMessages.push(current); }
    else if (event.type === "text-delta") { if (!current) { current = { id: String(event.id || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] }; resultMessages.push(current); } const p: any = current.parts.find((part) => part.type === "text"); if (p) p.text = String(p.text || "") + String(event.delta || ""); }
    else if (event.type === "tool-approval-request") { if (event.approvalId) { approval = { approvalId: String(event.approvalId), toolName: String(event.toolName || ""), input: event.input, toolCallId: event.toolCallId ? String(event.toolCallId) : undefined }; resultMessages.push({ id: "approval-request-" + String(event.approvalId), role: "assistant", parts: [{ type: "tool-approval-request", approvalId: String(event.approvalId), toolCallId: event.toolCallId, toolName: event.toolName, input: event.input }] }); } }
    else if (event.type === "finish") current = null;
    else if (event.type === "error") { current = null; resultMessages.push({ id: "error-" + Date.now(), role: "assistant", parts: [{ type: "text", text: String(event.errorText || event.message || "Agent request failed") }] }); }
  };
  while (true) { const chunk = await reader.read(); if (chunk.done) break; buffer += decoder.decode(chunk.value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || ""; lines.forEach(handle); } if (buffer) handle(buffer);
  return { messages: resultMessages, approval, requestId: response.headers.get("X-Request-Id") || undefined, conversationId: response.headers.get("X-Conversation-Id") || conversationId };
}