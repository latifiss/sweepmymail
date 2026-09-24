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
  return normalizeParts(message?.parts).find((part: any) => {
    const type = String(part?.type || "");
    return type.startsWith("tool-") || type === "dynamic-tool";
  });
}

function toolOutputOf(tool: any) {
  if (!tool) return undefined;
  if (tool.output !== undefined) return tool.output;
  if (tool.result !== undefined) return tool.result;
  if (tool.state === "output-available" && tool.value !== undefined) return tool.value;
  return undefined;
}
function decodeHtmlEntities(value: string) {
  if (!value.includes("&")) return value;
  const textarea = typeof document !== "undefined" ? document.createElement("textarea") : null;
  if (!textarea) return value.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  textarea.innerHTML = value;
  return textarea.value;
}

function cleanEmailText(value: unknown) {
  return decodeHtmlEntities(String(value ?? ""))
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD\u034F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEmailListFromText(text: string): { title?: string; lead?: string; emails: EmailRef[] } | null {
  const normalized = text
    .replace(/\\\\/g, "\\")
    .replace(/\\-/g, "-")
    .replace(/\\([@])/g, "$1")
    .replace(/<\\s*(?:mailto:)?([^>]+)>/g, "$1")
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD\u034F]/g, "")
    .replace(/[\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\\r/g, "")
    .trim();

  const lines = normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const emails: EmailRef[] = [];
  const nonRowLines: string[] = [];

  for (const line of lines) {
    const markdownRow = line.match(
      /^\d+\.\s*(?:\*\*)?([^*\n]+?)(?:\*\*)?\s*-\s*"([^"]+)"(?:\s*\(([^)]+)\))?\s*$/,
    );

    const angleRow = line.match(
      /^(?:\*\*)?([^*<>\n]+?)\s*<([^>\s]+)>\s*(?:\*\*)?(?:[-|:]\s*)?(?:Subject:\s*)?(.+?)(?:\s*[-|]\s*(?:Date|Received|Time):\s*(.+))?\s*(?:\*\*)?$/i,
    );

    if (markdownRow) {
      const sender = cleanEmailText(markdownRow[1]);
      const subject = cleanEmailText(markdownRow[2]);
      const dateRaw = cleanEmailText(markdownRow[3] || "");
      if (sender && subject) {
        const parsedDate = new Date(dateRaw);
        emails.push({
          id: "parsed-email-" + emails.length + "-" + sender + "-" + subject,
          sender,
          senderEmail: "",
          subject,
          preview: "",
          receivedAt: dateRaw && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toISOString()
            : new Date().toISOString(),
        });
        continue;
      }
    }

    if (angleRow && line.includes("<") && line.includes(">") && line.includes("@")) {
      const sender = cleanEmailText(angleRow[1]);
      const senderEmail = cleanEmailText(angleRow[2]);
      const subject = cleanEmailText(angleRow[3]).replace(/^["“]|["”]$/g, "");
      const dateRaw = cleanEmailText(angleRow[4] || "");
      if (sender && senderEmail.includes("@") && subject) {
        const parsedDate = new Date(dateRaw);
        emails.push({
          id: "parsed-email-" + emails.length + "-" + senderEmail + "-" + subject,
          sender,
          senderEmail,
          subject,
          preview: "",
          receivedAt: dateRaw && !Number.isNaN(parsedDate.getTime())
            ? parsedDate.toISOString()
            : new Date().toISOString(),
        });
        continue;
      }
    }

    nonRowLines.push(line);
  }

  if (!emails.length) return null;

  const cleanLead = (value: string) =>
    value.replace(/^\*\*(.*?)\*\*$/, "$1").replace(/^#+\s*/, "").replace(/^[-•]\s*/, "").trim();

  const prose = nonRowLines.map(cleanLead).filter(Boolean);
  const lead = prose.find((line) => /^done[.!]?$/i.test(line)) || "";
  const title = prose.find((line) => /^(?:here are|i found|showing|these are)\b/i.test(line));

  return { lead: lead || title || "", title: lead ? title : undefined, emails };
}
function refFrom(value: any): EmailRef | null {
  const e = value?.email || value;
  const id = e?.messageId || e?.message_id;
  if (!id) return null;
  return {
    id: String(id),
    sender: cleanEmailText(e.sender || e.from || "Unknown sender"),
    senderEmail: cleanEmailText(e.senderEmail || e.fromEmail || ""),
    subject: cleanEmailText(e.subject || "(no subject)"),
    preview: cleanEmailText(e.snippet || e.preview || "").slice(0, 180),
    receivedAt: String(e.date || e.receivedAt || new Date().toISOString()),
  };
}

export function uiMessageToChatMessage(message: AgentUIMessage): { id: string; role: "user" | "agent"; content?: string; response?: ResponseBlock } | null {
  if (message.role === "user") return { id: message.id, role: "user", content: textOf(message) };
  if (message.role === "tool") return null;

  const text = textOf(message);
  const tool = toolOf(message);
  const name = String(tool?.toolName || tool?.name || "");
  const output = toolOutputOf(tool);
  const emails = Array.isArray(output?.emails)
    ? output.emails.map(refFrom).filter(Boolean) as EmailRef[]
    : [];
  const citation = refFrom(tool);
  const citations = citation ? [citation] : [];

  if (emails.length > 0 && (
    name.includes("get_recent_emails") ||
    name.includes("search_emails") ||
    name.includes("list_recent_emails") ||
    name.includes("list_emails") ||
    name.includes("find_emails")
  )) {
    return { id: message.id, role: "agent", response: { kind: "email-list", lead: "", emails } };
  }

  // Some agent tool names vary between implementations. A structured emails array
  // is authoritative and should always win over the model's raw text.
  if (emails.length > 0) {
    return { id: message.id, role: "agent", response: { kind: "email-list", lead: "", emails } };
  }

  if (name.includes("create_draft") || name.includes("reply_to_email") || name.includes("forward_email")) {
    const d = output?.draft || output;
    const draft: EmailDraft = {
      id: String(d?.draftId || d?.id || tool?.toolCallId || message.id),
      to: Array.isArray(d?.to) ? d.to.join(", ") : String(d?.to || d?.recipients || ""),
      cc: Array.isArray(d?.cc) ? d.cc.join(", ") : d?.cc ? String(d.cc) : undefined,
      subject: String(d?.subject || ""),
      body: String(d?.body || ""),
    };
    if (!draft.to && !draft.subject && !draft.body) return null;
    return { id: message.id, role: "agent", response: { kind: "draft", lead: "", draft } };
  }

  if (name.includes("schedule_email")) {
    const e = output?.scheduledEmail || output?.event || output;
    const event: ScheduleEvent = {
      id: String(e?.id || tool?.toolCallId || message.id),
      title: String(e?.subject || e?.title || "Scheduled email"),
      when: String(e?.sendAt || e?.when || ""),
      duration: "",
    };
    return { id: message.id, role: "agent", response: { kind: "schedule", lead: "", event } };
  }

  if (name.includes("mark_important")) {
    const actionEmails = Array.isArray(output?.emails) ? output.emails.map(refFrom).filter(Boolean) as EmailRef[] : [];
    return {
      id: message.id,
      role: "agent",
      response: {
        kind: "email-list",
        lead: actionEmails.length === 1 ? "Done. Marked the email as important." : "Done. Marked the emails as important.",
        emails: actionEmails,
      },
    };
  }

  if (name.includes("archive_emails")) {
    const actionEmails = Array.isArray(output?.emails) ? output.emails.map(refFrom).filter(Boolean) as EmailRef[] : [];
    return {
      id: message.id,
      role: "agent",
      response: {
        kind: "email-list",
        lead: actionEmails.length === 1 ? "Done. Archived the email." : "Done. Archived the emails.",
        emails: actionEmails,
      },
    };
  }

  const parsedEmails = parseEmailListFromText(text);
  if (parsedEmails) {
    return {
      id: message.id,
      role: "agent",
      response: { kind: "email-list", lead: parsedEmails.lead || "", title: parsedEmails.title, emails: parsedEmails.emails },
    };
  }

  return { id: message.id, role: "agent", response: { kind: "text", content: text || "Done.", citations } };
}
export function storedMessagesToUI(messages: StoredAgentMessage[]): AgentUIMessage[] {
  const seen = new Map<string, number>();

  return messages.flatMap((message) => {
    const content: any = message.content;
    const baseId = String(message.id || content?.id || `message-${Date.now()}`);
    const count = seen.get(baseId) || 0;
    seen.set(baseId, count + 1);
    const id = count === 0 ? baseId : `${baseId}-${count}`;

    if (message.role === "user") {
      if (typeof content === "string") {
        return [{ id, role: "user", parts: [{ type: "text", text: content }] }];
      }

      const parts = normalizeParts(content);
      return parts.length ? [{ id, role: "user", parts }] : [];
    }

    if (message.role === "tool") {
      const toolName = String(message.tool_name || "");
      const toolCallId = String(message.tool_call_id || id);
      const output = message.tool_result ?? content;

      return [{
        id,
        role: "assistant",
        parts: [{
          type: "tool-" + toolName,
          state: "output-available",
          toolCallId,
          toolName,
          input: message.tool_input ?? {},
          output,
        }],
      }];
    }

    if (typeof content === "string") {
      return [{ id, role: "assistant", parts: [{ type: "text", text: content }] }];
    }

    const parts = normalizeParts(content);
    if (parts.length) {
      return [{ id, role: "assistant", parts }];
    }

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
      const rawOutput = event.output ?? event.result ?? event.value;
      let output = rawOutput;
      if (typeof output === "string") {
        try { output = JSON.parse(output); } catch {}
      }

      const existingPart: any = current?.parts.find((item: any) => item.toolCallId === toolCallId);
      const toolName = String(
        event.toolName ||
        existingPart?.toolName ||
        (existingPart?.type ? String(existingPart.type).replace(/^tool-/, "") : "")
      );

      if (existingPart) {
        existingPart.state = "output-available";
        existingPart.output = output;
        existingPart.toolName = toolName;
      }

      // Keep tool output in its own assistant message. This prevents the model's
      // prose and the structured UI result from being merged into one broken block.
      const toolMessageId = "tool-result-" + (toolCallId || Date.now());
      const alreadyAdded = resultMessages.some((message) => message.id === toolMessageId);
      if (!alreadyAdded) {
        resultMessages.push({
          id: toolMessageId,
          role: "assistant",
          parts: [{
            type: "tool-" + toolName,
            state: "output-available",
            toolCallId,
            toolName,
            input: existingPart?.input ?? {},
            output,
          }],
        });
      }
    }
    else if (event.type === "tool-approval-request") {
      if (event.approvalId) {
        const approvalId = String(event.approvalId);
        const toolName = String(event.toolName || "");
        const toolCallId = event.toolCallId ? String(event.toolCallId) : "";
        approval = { approvalId, toolName, input: event.input, toolCallId: toolCallId || undefined };

        if (!current) {
          current = { id: String(event.messageId || "assistant-" + Date.now()), role: "assistant", parts: [{ type: "text", text: "" }] };
          resultMessages.push(current);
        }

        const existing = current.parts.find((part: any) => part.toolCallId === toolCallId);
        if (existing) {
          Object.assign(existing, {
            state: "approval-requested",
            approval: { id: approvalId },
            toolName,
            input: event.input ?? existing.input ?? {},
          });
        } else {
          current.parts.push({
            type: "tool-" + toolName,
            state: "approval-requested",
            toolCallId,
            toolName,
            input: event.input ?? {},
            approval: { id: approvalId },
          });
        }
      }
    }
    else if (event.type === "finish") current = null;
    else if (event.type === "error") { current = null; resultMessages.push({ id: "error-" + Date.now(), role: "assistant", parts: [{ type: "text", text: String(event.errorText || event.message || "Agent request failed") }] }); }
  };
  while (true) { const chunk = await reader.read(); if (chunk.done) break; buffer += decoder.decode(chunk.value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() || ""; lines.forEach(handle); } if (buffer) handle(buffer);
  return { messages: resultMessages, approval, requestId: response.headers.get("X-Request-Id") || undefined, conversationId: response.headers.get("X-Conversation-Id") || conversationId };
}