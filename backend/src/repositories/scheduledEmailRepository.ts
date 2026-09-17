import { supabase } from "../config/supabase";

export type ScheduledEmailStatus = "scheduled" | "sending" | "sent" | "failed" | "cancelled";

export type ScheduledEmail = {
  id: string;
  user_id: string;
  conversation_id: string | null;
  to_addresses: string[];
  cc_addresses: string[];
  bcc_addresses: string[];
  subject: string;
  body: string;
  send_at: string;
  timezone: string;
  status: ScheduledEmailStatus;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export async function createScheduledEmail(payload: {
  user_id: string;
  conversation_id?: string | null;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  subject: string;
  body: string;
  send_at: string;
  timezone: string;
}) {
  const { data, error } = await supabase
    .from("agent_scheduled_emails")
    .insert({
      ...payload,
      conversation_id: payload.conversation_id || null,
      cc_addresses: payload.cc_addresses || [],
      bcc_addresses: payload.bcc_addresses || [],
      status: "scheduled",
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to schedule email");
  return data as ScheduledEmail;
}

export async function listScheduledEmailsForUser(userId: string, status?: ScheduledEmailStatus) {
  let query = supabase
    .from("agent_scheduled_emails")
    .select("*")
    .eq("user_id", userId)
    .order("send_at", { ascending: true });

  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  throwIfError(error, "Failed to list scheduled emails");
  return (data || []) as ScheduledEmail[];
}

export async function getScheduledEmailForUser(userId: string, id: string) {
  const { data, error } = await supabase
    .from("agent_scheduled_emails")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  throwIfError(error, "Failed to fetch scheduled email");
  return (data || null) as ScheduledEmail | null;
}

export async function updateScheduledEmailForUser(
  userId: string,
  id: string,
  payload: Partial<Pick<ScheduledEmail, "to_addresses" | "cc_addresses" | "bcc_addresses" | "subject" | "body" | "send_at" | "timezone">>
) {
  const { data, error } = await supabase
    .from("agent_scheduled_emails")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id)
    .eq("status", "scheduled")
    .select("*")
    .maybeSingle();
  throwIfError(error, "Failed to update scheduled email");
  if (!data) throw new Error("Scheduled email cannot be edited in its current state");
  return data as ScheduledEmail;
}

export async function cancelScheduledEmailForUser(userId: string, id: string) {
  const { data, error } = await supabase
    .from("agent_scheduled_emails")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", id)
    .eq("status", "scheduled")
    .select("*")
    .maybeSingle();
  throwIfError(error, "Failed to cancel scheduled email");
  if (!data) throw new Error("Scheduled email cannot be cancelled in its current state");
  return data as ScheduledEmail;
}

export async function claimDueScheduledEmails(nowIso: string, limit = 20) {
  const { data: due, error } = await supabase
    .from("agent_scheduled_emails")
    .select("*")
    .eq("status", "scheduled")
    .lte("send_at", nowIso)
    .order("send_at", { ascending: true })
    .limit(limit);
  throwIfError(error, "Failed to fetch due scheduled emails");

  const claimed: ScheduledEmail[] = [];
  for (const row of due || []) {
    const { data, error: updateError } = await supabase
      .from("agent_scheduled_emails")
      .update({ status: "sending", updated_at: new Date().toISOString() })
      .eq("id", row.id)
      .eq("status", "scheduled")
      .select("*")
      .maybeSingle();
    throwIfError(updateError, "Failed to claim scheduled email");
    if (data) claimed.push(data as ScheduledEmail);
  }
  return claimed;
}

export async function markScheduledEmailSent(id: string, result: { messageId: string | null; threadId: string | null }) {
  const { error } = await supabase
    .from("agent_scheduled_emails")
    .update({
      status: "sent",
      gmail_message_id: result.messageId,
      gmail_thread_id: result.threadId,
      error_message: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "sending");
  throwIfError(error, "Failed to mark scheduled email as sent");
}

export async function markScheduledEmailFailed(id: string, errorMessage: string) {
  const { error } = await supabase
    .from("agent_scheduled_emails")
    .update({
      status: "failed",
      error_message: errorMessage.slice(0, 2000),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "sending");
  throwIfError(error, "Failed to mark scheduled email as failed");
}
