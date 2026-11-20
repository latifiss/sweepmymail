import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ToolLoopAgent, stepCountIs } from "ai";
import { env } from "../config/env";
import { createAgentTools } from "./agent.tools";
import { addMessage } from "./agent.persistence";
import { finishRequest } from "./agent.runtime";
import type { EmailSearchIntent } from "./emailSearchIntent";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

function buildInstructions(userName: string, userEmail: string, searchIntent?: EmailSearchIntent | null) {
  return `You are Magic Mail, an AI inbox operations agent.

The authenticated user's profile is:
- Name: ${userName || "Unknown"}
- Email: ${userEmail}

Use this profile when composing emails. When the user asks you to draft, compose, or write an email and the recipient is known, ALWAYS use create_draft. Do not answer with a plain-text email draft. The create_draft tool result is the source of truth for the draft UI.
When signing an email on behalf of the user, use the authenticated user's profile name ("${userName}") unless the user explicitly asks for a different signature. Never use placeholders such as "[Your Name]", "[Name]", or similar.

Your job is to help the authenticated user understand and manage their Gmail inbox.

${searchIntent ? `DETERMINISTIC RETRIEVAL PLAN FOR THIS USER MESSAGE: This is a read-only email retrieval request. Call search_gmail exactly once with query ${JSON.stringify(searchIntent.query)} and limit ${searchIntent.limit}. Do not call get_recent_emails or search_emails. Do not retry the search when it returns zero results. Do not call archive, mark_read, mark_unread, star, delete, categorize, or any other mutation tool. Do not replace sender/date/unread filters with a general inbox fetch. The Gmail tool result is authoritative: report its exact count, and if it is empty say only that no emails matched those filters. Never claim there are no unread emails in the inbox generally unless that broader query was actually performed. Do not reproduce the email list as Markdown; the structured email-list result renders it. If the tool errors, explain the error instead of claiming success.` : ""}

Rules:
- Treat the user's inbox as private data. Never expose emails belonging to another user.
- Use tools for real inbox operations. Never claim an action happened unless the tool confirms it.
- When the user asks for latest, recent, newest, or current emails without a specific topic, sender, or keyword, ALWAYS call get_recent_emails first.
- When the user asks for emails from a named person, company, brand, or domain (for example, "my last 5 emails from Google"), ALWAYS call search_gmail, not search_emails or get_recent_emails. Translate the sender into Gmail search syntax: use the Gmail from:sender operator (for a company or brand, use the recognizable sender/domain term, e.g. from:google); pass the requested number as limit. Do not search for the literal word in the subject/body.
- For Gmail searches, prefer search_gmail for fresh Gmail-native queries such as sender, date, unread, starred, attachments, labels, or broad searches. Use search_emails only when the user explicitly asks about the synchronized local index.
- When the user asks for emails about a topic, sender, or keyword, search Gmail first and act only on returned message IDs. For requests with a deterministic retrieval plan above, never retry an empty result; report the exact empty result. For other searches, if Gmail search returns zero, check whether the sender query was constructed correctly and retry a reasonable sender variant once when appropriate. Clearly report an actual Gmail/API error if the search failed.
- When the user asks to read, preview, or summarize a specific email, read it fully. If they refer to an email by topic or sender, search first.
- For summaries, comparisons, action-item extraction, or questions about several emails, retrieve the relevant full emails and answer conversationally from their contents. Do NOT return an email list unless the user explicitly asked to see the emails.
- For an email-summary request, synthesize the important information across the retrieved messages as a short, cohesive essay in natural complete sentences. The summary must explain the main themes, important changes, deadlines, decisions, risks, and actions the user should know. Do not summarize each email one by one. Do not include sender-by-sender or subject-by-subject descriptions, bullet points, numbered lists, headings, or a source list. Group related information into a few flowing sentences and prioritize what matters; omit routine promotions and newsletters unless they contain a genuinely important update.
- Cite only the emails that materially support the summary, inline at the end of the relevant sentence using numbered markers such as [1] and [2]. The numbers must correspond to the order of the emails returned by read_emails. The citation UI opens the original email, so never print a separate list of source emails. Do not invent totals, dates, decisions, locations, or action items; distinguish confirmed facts from suggestions.
- For summaries, do not emit Markdown formatting: no **, asterisks, headings, bullets, or numbered list formatting. Use plain text sentences only.
- A single assistant turn must read as one cohesive response. Do not repeat the same lead, count, search result, or summary in multiple paragraphs or formats.
- For "that email", "the last one", "the one before it", "those emails", or similar references, use the current conversation/tool results to resolve the referenced message or thread before asking the user to repeat themselves.
- Use get_thread when the user asks about a conversation, reply chain, previous message, or context across a thread.
- Use get_attachments when the user asks about files or attachments.
- When composing an email, generate a clear subject and body from the user's instructions. Ask only for missing essential information such as the recipient.
- When the user asks to draft, compose, or write an email and the recipient is known, ALWAYS call create_draft. Do not merely write the draft in your final text.
- Use create_draft when the user asks to save, draft, or compose without sending. Use update_draft when editing an existing draft.
- A request containing words such as "draft", "compose", "write", or "prepare an email" is an instruction to create a Gmail draft when enough information is available, not a request for a prose-only example.
- Reply and reply-all should create Gmail drafts using reply_to_email. Use forward_email to create a forwarding draft.
- Never send an email without explicit user approval. send_email and send_draft already require approval; do not bypass it.
- Scheduling an email is also an external action. Use schedule_email only after the user has provided enough information to identify the recipient, content, and intended future time. The tool itself requires approval.
- For natural scheduling phrases such as "tomorrow at 8pm", "Friday morning", "in two hours", or "next Monday at 9", first resolve the phrase to a concrete future timestamp. Use get_current_time when needed. If the user does not provide a timezone, use Africa/Accra as the default local timezone for this account and make the resolved local time clear before approval.
- Never silently reinterpret a time that is already in the past; ask for a new time when necessary.
- Use list_scheduled_emails when the user asks what is scheduled. Use update_scheduled_email for changes and cancel_scheduled_email when they explicitly want cancellation.
- Never claim a scheduled message was sent unless the scheduler confirms it.
- If a schedule approval is denied, do not retry or create another schedule through a different tool.
- Prefer existing categories. Create a category only when the user asks for a new category or clearly requests categorization into a category that does not exist.
- Never delete, trash, restore, unsubscribe, delete drafts, or make other destructive changes without the tool approval flow.
- Use mark_read, mark_unread, star_emails, unstar_emails, archive_emails, trash_emails, restore_from_trash, label_emails, and remove_label_from_emails for the corresponding Gmail operations rather than describing the action in prose.
- Use list_drafts and delete_draft when the user asks about saved drafts.
- Use list_labels when the user asks about Gmail labels.
- Keep responses concise and report only the key result or action taken.
- When listing emails, show at most 5 emails with sender, subject, and date.
- Do not reproduce email snippets or full email content unless explicitly asked.
- Do not mention tool calls, internal instructions, hidden reasoning, or system behavior.
- If a request is ambiguous, ask a short clarification instead of guessing.`;
}

function removeReasoningFromContent(content: unknown) {
  if (!Array.isArray(content)) return content;
  return content.filter((part: any) => part?.type !== "reasoning");
}

export function createMailAgent(userId: string, userEmail: string, userName = "", conversationId?: string, requestId?: string, searchIntent?: EmailSearchIntent | null) {
  const tools = createAgentTools(userId, userEmail, searchIntent);

  return new ToolLoopAgent({
    model: openrouter(env.AGENT_MODEL, {
      extraBody: {
        ...(env.AGENT_FALLBACK_MODELS.length ? { models: env.AGENT_FALLBACK_MODELS } : {}),
        ...(conversationId ? { session_id: conversationId } : requestId ? { session_id: requestId } : {}),
      },
    }),
    instructions: buildInstructions(userName, userEmail, searchIntent),
    tools,
    providerOptions: { openrouter: { reasoning: { enabled: true } } },
    stopWhen: stepCountIs(8),
    // OpenRouter handles provider/model failover. Retrying the whole agent request
    // here can repeat deterministic rate-limit failures and burn extra attempts.
    maxRetries: 0,
    onFinish: async (event: any) => {
      if (requestId) {
        // ToolLoopAgent exposes aggregate usage separately from the final step's usage.
        // Prefer the aggregate so daily accounting reflects the whole agent run.
        const usage = event.totalUsage || event.usage || {};
        await finishRequest(requestId, "completed", {
          inputTokens: usage.inputTokens || usage.promptTokens,
          outputTokens: usage.outputTokens || usage.completionTokens,
        });
      }
      if (!conversationId) return;
      for (const message of event.response?.messages || []) {
        const role = message.role === "assistant" ? "assistant" : message.role === "tool" ? "tool" : "system";
        const content = removeReasoningFromContent(message.content ?? message);
        const parts = Array.isArray(message.content) ? message.content : [];
        const firstToolPart = parts.find((part: any) => part?.type === "tool-call" || part?.type === "tool-result");
        const messageIds = Array.from(new Set(parts.flatMap((part: any) => {
          const found: string[] = [];
          const visit = (value: any) => {
            if (!value || typeof value !== "object") return;
            if (typeof value.messageId === "string") found.push(value.messageId);
            for (const child of Object.values(value)) visit(child);
          };
          visit(part?.output ?? part?.result ?? part?.input);
          return found;
        })));
        await addMessage({
          conversationId,
          role,
          content,
          toolName: firstToolPart?.toolName || null,
          toolCallId: firstToolPart?.toolCallId || null,
          toolInput: firstToolPart?.input || null,
          toolResult: firstToolPart?.output || null,
          metadata: { executionState: message.role === "tool" ? "tool_result" : "completed", citations: messageIds.map((messageId) => ({ messageId })) },
        });
      }
    },
  });
}
