import { pool } from "../auth/auth";
import { env } from "../config/env";
import crypto from "node:crypto";

export const createRequestId = () => crypto.randomUUID();

import { AgentRuntimeError, validateAgentInput } from "./agent.validation";
export { AgentRuntimeError, validateAgentInput } from "./agent.validation";

export async function consumeAgentQuota(userId: string) {
  const now = new Date();
  const minuteStart = new Date(Math.floor(now.getTime() / 60000) * 60000);
  const result = await pool.query<{ minute_count: number; day_count: number; day_tokens: number }>(
    "with minute as (insert into agent_rate_limit_windows (user_id,window_start,request_count) values ($1,$2,1) on conflict (user_id,window_start) do update set request_count=agent_rate_limit_windows.request_count+1 returning request_count), daily as (insert into agent_usage_daily (user_id,usage_date,request_count) values ($1,current_date,1) on conflict (user_id,usage_date) do update set request_count=agent_usage_daily.request_count+1,updated_at=now() returning request_count,total_tokens) select minute.request_count minute_count,daily.request_count day_count,daily.total_tokens day_tokens from minute cross join daily",
    [userId, minuteStart.toISOString()]
  );
  const row = result.rows[0];
  if (row.minute_count > env.AGENT_REQUESTS_PER_MINUTE) throw new AgentRuntimeError("RATE_LIMITED", "Too many agent requests. Please try again shortly.", 429, 60);
  if (row.day_count > env.AGENT_REQUESTS_PER_DAY) throw new AgentRuntimeError("DAILY_REQUEST_LIMIT", "Daily agent request limit reached.", 429, 86400);
  if (Number(row.day_tokens || 0) >= env.AGENT_DAILY_TOKEN_LIMIT) throw new AgentRuntimeError("DAILY_TOKEN_LIMIT", "Daily agent usage limit reached.", 429, 86400);
}

export async function startRequest(userId: string, conversationId: string, requestId: string, model: string) {
  await pool.query("insert into agent_request_events (user_id,conversation_id,status,request_id,model) values ($1,$2,'started',$3,$4)", [userId, conversationId, requestId, model]);
}

export async function finishRequest(requestId: string, status: "completed"|"failed"|"aborted"|"rejected", usage?: { inputTokens?: number; outputTokens?: number }, errorCode?: string|null) {
  const input = Math.max(0, Math.floor(usage?.inputTokens || 0));
  const output = Math.max(0, Math.floor(usage?.outputTokens || 0));
  const total = input + output;
  await pool.query("update agent_request_events set status=$2,input_tokens=case when $3 > 0 then $3 else input_tokens end,output_tokens=case when $4 > 0 then $4 else output_tokens end,total_tokens=case when $5 > 0 then $5 else total_tokens end,error_code=$6,completed_at=now() where request_id=$1", [requestId,status,input,output,total,errorCode||null]);
  if (total) await pool.query("update agent_usage_daily set input_tokens=input_tokens+$2,output_tokens=output_tokens+$3,total_tokens=total_tokens+$4,updated_at=now() where user_id=(select user_id from agent_request_events where request_id=$1) and usage_date=current_date", [requestId,input,output,total]);
}

export async function getAgentUsage(userId: string) {
  const result = await pool.query("select request_count,input_tokens,output_tokens,total_tokens,updated_at from agent_usage_daily where user_id=$1 and usage_date=current_date", [userId]);
  return result.rows[0] || { request_count:0,input_tokens:0,output_tokens:0,total_tokens:0,updated_at:null };
}
