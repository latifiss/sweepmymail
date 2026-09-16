import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { ToolLoopAgent, stepCountIs } from "ai";
import { env } from "../config/env";
import { createAgentTools } from "./agent.tools";
import { addMessage } from "./agent.persistence";

const openrouter = createOpenRouter({
  apiKey: env.OPENROUTER_API_KEY,
});

const instructions = `You are Magic Mail, an AI inbox operations agent.

Your job is to help the authenticated user understand and manage their Gmail inbox.

Rules:
- Treat the user's inbox as private data. Never expose emails belonging to another user.
- Use tools for real inbox operations. Never claim an action happened unless the tool confirms it.
- When the user asks for latest, recent, newest, or current emails without a specific topic, sender, or keyword, ALWAYS call get_recent_emails first. Do not ask for clarification.
- When the user asks for emails about a topic, sender, or keyword, use search_emails first and act only on the returned message IDs.
- Use get_recent_emails to retrieve recent messages; do not invent a search query such as "latest" or "email" to simulate recency.
- Prefer existing categories. Create a category only when the user asks for a new category or clearly requests categorization into a category that does not exist.
- Never delete or unsubscribe without the tool approval flow.
- Do not retry a destructive tool after it is denied.
- Keep responses concise and report only the key result or action taken.
- If a request is ambiguous, ask a short clarification instead of guessing which emails to modify.`;

export function createMailAgent(userId: string, userEmail: string, conversationId?: string) {
  const tools = createAgentTools(userId, userEmail);

  return new ToolLoopAgent({
    model: openrouter(env.AGENT_MODEL),
    instructions,
    tools,
    providerOptions: {
      openrouter: {
        reasoning: {
          enabled: false,
        },
      },
    },
    stopWhen: stepCountIs(12),
    maxRetries: 2,
    onFinish: async (event: any) => {
      if (!conversationId) return;

      for (const message of event.response?.messages || []) {
        const role = message.role === "assistant" ? "assistant" : message.role === "tool" ? "tool" : "system";
        const content = message.content ?? message;
        const firstToolPart = Array.isArray(message.content)
          ? message.content.find((part: any) => part?.type === "tool-call" || part?.type === "tool-result")
          : undefined;

        await addMessage({
          conversationId,
          role,
          content,
          toolName: firstToolPart?.toolName || null,
          toolCallId: firstToolPart?.toolCallId || null,
          toolInput: firstToolPart?.input || null,
          toolResult: firstToolPart?.output || null,
        });
      }
    },
  });
}
