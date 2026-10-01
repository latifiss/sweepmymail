import { Request, Response } from "express";
import { AgentRuntimeError } from "./agent.runtime";

export function getRequestId(req: Request) {
  const value = req.header("x-request-id");
  return value && value.length <= 100 ? value : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`;
}

export function agentErrorResponse(res: Response, error: unknown, requestId?: string) {
  const runtime = error instanceof AgentRuntimeError ? error : undefined;
  const status = runtime?.status || 500;
  if (runtime?.retryAfter) res.setHeader("Retry-After", String(runtime.retryAfter));
  return res.status(status).json({ error: { code: runtime?.code || "AGENT_INTERNAL_ERROR", message: runtime?.message || "Magic Mail could not complete that request.", requestId: requestId || null, retryable: status === 429 || status >= 500 } });
}
