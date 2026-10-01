import { env } from "../config/env";

export class AgentRuntimeError extends Error {
  constructor(public code: string, message: string, public status: number, public retryAfter?: number) {
    super(message);
    this.name = "AgentRuntimeError";
  }
}

export function validateAgentInput(messages: unknown) {
  if (!Array.isArray(messages) || messages.length === 0) throw new AgentRuntimeError("INVALID_MESSAGES", "messages array is required", 400);
  if (messages.length > env.AGENT_MAX_MESSAGES) throw new AgentRuntimeError("MESSAGE_LIMIT_EXCEEDED", "Too many messages in this request", 413);
  if (Buffer.byteLength(JSON.stringify(messages), "utf8") > env.AGENT_MAX_MESSAGE_BYTES) throw new AgentRuntimeError("PAYLOAD_TOO_LARGE", "Chat payload is too large", 413);
}
