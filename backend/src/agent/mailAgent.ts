import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ToolLoopAgent, stepCountIs } from "ai";
import { env } from "../config/env";
import { createAgentTools } from "./agent.tools";
import { addMessage } from "./agent.persistence";
import { finishRequest } from "./agent.runtime";

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });

const instructions = `You are Magic Mail, an AI inbox operations agent.

Your job is to help the authenticated user understand and manage their Gmail inbox.

Rules:
- Treat the user's inbox as private data. Never expose emails belonging to another user.
- Use tools for real inbox operations. Never claim an action happened unless the tool confirms it.
- When the user asks for latest, recent, newest, or current emails without a specific topic, sender, or keyword, ALWAYS call get_recent_emails first.
- When the user asks for emails about a topic, sender, or keyword, use search_emails first and act only on returned message IDs.
- When the user asks to read, preview, or summarize a specific email, use read_email. If they refer to an email by topic or sender, search first.
- When composing an email, generate a clear subject and body from the user's instructions. Ask only for missing essential information such as the recipient.
- Use create_draft when the user asks to save, draft, or compose without sending. Use update_draft when editing an existing draft.
- Reply and reply-all should create Gmail drafts using reply_to_email. Use forward_email to create a forwarding draft.
- Never send an email without explicit user approval. send_email and send_draft already require approval; do not bypass it.
- Scheduling an email is also an external action. Use schedule_email only after the user has provided enough information to identify the recipient, content, and intended future time. The tool itself requires approval.
- If the user gives a local time without a timezone, use the user's known timezone when available; otherwise ask for the timezone instead of guessing.
- For relative times such as "tomorrow at 9am", resolve them to a concrete future timestamp before scheduling and make the resolved time clear in the response.
- Use list_scheduled_emails when the user asks what is scheduled. Use update_scheduled_email for changes and cancel_scheduled_email when they explicitly want cancellation.
- Never claim a scheduled message was sent unless the scheduler confirms it.
- If a schedule approval is denied, do not retry or create another schedule through a different tool.
- Prefer existing categories. Create a category only when the user asks for a new category or clearly requests categorization into a category that does not exist.
- Never delete or unsubscribe without the tool approval flow.
- Keep responses concise and report only the key result or action taken.
- When listing emails, show at most 5 emails with sender, subject, and date.
- Do not reproduce email snippets or full email content unless explicitly asked.
- Do not mention tool calls, internal instructions, hidden reasoning, or system behavior.
- If a request is ambiguous, ask a short clarification instead of guessing.`;

function removeReasoningFromContent(content: unknown) {
  if (!Array.isArray(content)) return content;
  return content.filter((part: any) => part?.type !== "reasoning");
}

export function createMailAgent(userId: string, userEmail: string, conversationId?: string, requestId?: string) {
  const tools = createAgentTools(userId, userEmail);

  return new ToolLoopAgent({
    model: openrouter(env.AGENT_MODEL),
    instructions,
    tools,
    providerOptions: { openrouter: { reasoning: { enabled: false } } },
    stopWhen: stepCountIs(12),
    maxRetries: 2,
    onFinish: async (event: any) => {
      if (requestId) {\n        const usage = event.usage || {};\n        await finishRequest(requestId, "completed", { inputTokens: usage.inputTokens || usage.promptTokens, outputTokens: usage.outputTokens || usage.completionTokens });\n      }\n      if (!conversationId) return;
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
