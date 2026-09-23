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

function normalizeParts(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value.filter((part): part is Record<string, unknown> => !!part && typeof part === "object");
  if (value && typeof value === "object" && Array.isArray((value as any).parts)) return normalizeParts((value as any).parts);
  return [];
}

function textOf(message: AgentUIMessage) {
  return normalizeParts(message?.parts).filter((part) => part.type === "text").map((part) => String(part.text || "")).join("");
}
function toolOf(message: AgentUIMessage): any {
  return normalizeParts(message?.parts).find((part) => String(part.type || "").startsWith("tool-") || part.type === "dynamic-tool");
}
function decodeHtmlEntities(value: string) {
  if (!value.includes("&")) return value;
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (!textarea) return value.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  textarea.innerHTML = value;
  return textarea.value;
}

function parseEmailListFromText(text: string): { title?: string; lead?: string; emails: EmailRef[] } | null {
  const normalized = decodeHtmlEntities(text)
    .replace(/\\\*/g, "*")
    .replace(/\\-/g, "-")
    .replace(/\\([@])/g, "$1")
    .replace(/<\\s*(?:mailto:)?([^>]+)>/g, "$1")
    .trim();

  const emails: EmailRef[] = [];
  const numbered = /(?:^|\\n)\\s*\\d+\\.\\s*\\*\\*([^*]+?)\\*\\*\\s*-\\s*["“](.+?)["”]\\s*\\(([^)]+)\\)/g;
  let match: RegExpExecArray | null;
  while ((match = numbered.exec(normalized))) {
    const sender = match[1].trim();
    const subject = match[2].trim();
    const receivedAtRaw = match[3].trim();
    const parsedDate = new Date(receivedAtRaw);
    emails.push({
      id: `parsed-email-${emails.length}-${sender}-${subject}`,
      sender,
      senderEmail: "",
      subject,
      preview: "",
      receivedAt: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
    });
  }

  if (!emails.length) {
    const emailPattern = /(?:^|\\n)\\*\\*([^*<]+?)\\s*<([^>]+)>\\*\\*\\s*[-•]?\\s*Subject:\s*["“]?(.+?)["”]?\\s*[-•]?\\s*Date:\s*(.+?)(?=\\n|$)/g;
    while ((match = emailPattern.exec(normalized))) {
      const sender = match[1].trim();
      const senderEmail = match[2].trim();
      const subject = match[3].trim().replace(/^["“]|["”]$/g, "");
      const receivedAtRaw = match[4].trim();
      const parsedDate = new Date(receivedAtRaw);
      emails.push({
        id: `parsed-email-${emails.length}-${senderEmail}-${subject}`,
        sender,
        senderEmail,
        subject,
        preview: "",
        receivedAt: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
      });
    }
  }

  if (!emails.length) return null;

  const firstLine = normalized.split(/\\n+/).map((line) => line.trim()).find(Boolean) || "";
  const lead = /here are (your )?(recent|latest)? ?emails/i.test(firstLine)
    ? firstLine.replace(/^\\*\\*|\\*\\*$/g, "").replace(/:$/, "").trim()
    : "Here are the emails I found.";

  return { lead, emails };
}

function refFrom(value: any): EmailRef | null {
  const e = value?.email || value;
  const id = e?.messageId || e?.message_id;
  if (!id) return null;
  return {
    id: String(id),
    sender: decodeHtmlEntities(String(e.sender || e.from || "Unknown sender")),
    senderEmail: decodeHtmlEntities(String(e.senderEmail || e.fromEmail || "")),
    subject: decodeHtmlEntities(String(e.subject || "(no subject)")),
    preview: decodeHtmlEntities(String(e.snippet || e.preview || "")).replace(/\s+/g, " ").trim().slice(0, 180),
    receivedAt: String(e.date || e.receivedAt || new Date().toISOString()),
  };
}

export function storedMessagesToUI(messages: StoredAgentMessage[]): AgentUIMessage[] {
  const seen = new Map<string, number>();

  return messages.flatMap((message) => {
    const role = message.role === "user" ? "user" : message.role === "tool" ? "tool" : "assistant";
    const content: any = message.content;
    const baseId = String(message.id || content?.id || `message-${Date.now()}`);
    const count = seen.get(baseId) || 0;
    seen.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count}`;

    if (typeof content === "string") {
      return [{ id, role, parts: [{ type: "text", text: content }] }];
    }

    const parts = normalizeParts(content);
    if (parts.length) {
      return [{ id, role, parts }];
    }

    return [];
  });
}

export function uiMessageToChatMessage(message: AgentUIMessage): { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock } | null {
  const text = textOf(message).trim();
  if (message.role === "user") return { id: message.id, role: "user", content: text };

  const part = toolOf(message);
  if (part) {
    const toolName = String(part.toolName || String(part.type || "").replace(/^tool-/, ""));
    let output: any = part.output;
    if (typeof output === "string") {
      try { output = JSON.parse(output); } catch {}
    }

    if (toolName.includes("get_recent_emails") || toolName.includes("search_emails") || toolName.includes("list_emails")) {
      const raw = Array.isArray(output?.emails) ? output.emails : Array.isArray(output) ? output : [];
      const emails = raw.map(refFrom).filter(Boolean) as EmailRef[];
      if (emails.length) return { id: message.id, role: "agent", response: { kind: "email-list", lead: "Here are the emails I found.", emails } };
    }

    if (toolName.includes("create_draft") || toolName.includes("draft_email")) {
      const draft = output?.draft || output;
      if (draft?.id) return { id: message.id, role: "agent", response: { kind: "draft", lead: "Here's the draft.", draft: { id: String(draft.id), to: String(draft.to || ""), cc: draft.cc ? String(draft.cc) : undefined, subject: String(draft.subject || ""), body: String(draft.body || "") } } };
    }

    if (toolName.includes("schedule")) {
      const event = output?.event || output;
      if (event?.id) return { id: message.id, role: "agent", response: { kind: "schedule", lead: "Here's the scheduled email.", event: { id: String(event.id), title: String(event.title || "Scheduled email"), when: String(event.when || event.scheduledAt || ""), duration: String(event.duration || "") } } };
    }
  }

  if (text) {
    const parsedEmails = parseEmailListFromText(text);
    if (parsedEmails) return { id: message.id, role: "agent", response: { kind: "email-list", lead: parsedEmails.lead || "Here are the emails I found.", title: parsedEmails.title, emails: parsedEmails.emails } };
    return { id: message.id, role: "agent", response: { kind: "text", content: text } };
  }
  return null;
}

export async function streamAgentMessage(messages: AgentUIMessage[], conversationId?: string, path = "/agent/chat", signal?: AbortSignal, onEvent?: (event: any) => void) {
  const response = await request(path, { method: "POST", body: JSON.stringify({ conversationId, messages }), signal });
  if (!response.body) throw new Error("Agent returned an empty response");
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; const resultMessages = [...messages]; let current: AgentUIMessage | null = null; let approval: ApprovalRequest | undefined;
  const handle = (raw: string) => { const line = raw.trim(); if (!line || !line.startsWith("data:")) return; const payload = line.slice(5).trim(); if (!payload || payload === "[DONE]") return; let event: any; try { event = JSON.parse(payload); } catch { return; } onEvent?.(event);
    if (event.type === "text-start") { current = { id: String(event.id || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] }; resultMessages.push(current); }
    else if (event.type === "text-delta") { if (!current) { current = { id: String(event.id || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] }; resultMessages.push(current); } const p: any = current.parts.find((part) => part.type === "text"); if (p) p.text = String(p.text || "") + String(event.delta || ""); }
    else if (event.type === "tool-input-available" || event.type === "tool-call") {
      if (!current) {
        current = { id: String(event.messageId || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] };
        resultMessages.push(current);
      }
      const toolName = String(event.toolName || "");
      const toolCallId = String(event.toolCallId || event.id || "");
      if (toolCallId) {
        current.parts.push({
          type: "tool-" + toolName,
          state: "input-available",
          toolCallId,
          toolName,
          input: event.input ?? event.args ?? {},
        });
      }
    }
    else if (event.type === "tool-output-available" || event.type === "tool-result") {
      const toolCallId = String(event.toolCallId || "");
      const rawOutput = event.output ?? event.result;
      let output = rawOutput;
      if (typeof output === "string") {
        try { output = JSON.parse(output); } catch {}
      }
      const part: any = current?.parts.find((item: any) => item.toolCallId === toolCallId);
      if (part) {
        part.state = "output-available";
        part.output = output;
      } else if (current) {
        current.parts.push({
          type: "tool-" + String(event.toolName || ""),
          state: "output-available",
          toolCallId,
          toolName: String(event.toolName || ""),
          input: {},
          output,
        });
      }
    }
    else if (event.type === "tool-approval-request") { if (event.approvalId) { approval = { approvalId: String(event.approvalId), toolName: String(event.toolName || ""), input: event.input, toolCallId: event.toolCallId ? String(event.toolCallId) : undefined }; resultMessages.push({ id: "approval-request-" + String(event.approvalId), role: "assistant", parts: [{ type: "tool-approval-request", approvalId: String(event.approvalId), toolCallId: event.toolCallId, toolName: event.toolName, input: event.input }] }); } }
    else if (event.type === "finish") current = null;
    else if (event.type === "error") { current = null; resultMessages.push({ id: "error-" + Date.now(), role: "assistant", parts: [{ type: "text", text: String(event.errorText || event.message || "Agent request failed") }] }); }
  };
  while (true) { const chunk = await reader.read(); if (chunk.done) break; buffer += decoder.decode(chunk.value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || ""; lines.forEach(handle); } if (buffer) handle(buffer);
  return { messages: resultMessages, approval, requestId: response.headers.get("X-Request-Id") || undefined, conversationId: response.headers.get("X-Conversation-Id") || conversationId };
}