import { supabase } from "../config/supabase";

export interface DbUser {
  id: string;
  email: string;
  name: string;
  provider: "google" | "microsoft";
  access_token: string;
  refresh_token: string | null;
  picture: string | null;
  created_at: string;
}

export interface DbEmail {
  id: string;
  user_id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unsubscribe_link: string | null;
  message_id: string;
  archived: boolean;
}

function throwIfError(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  throwIfError(error, "Failed to fetch user by email");
  return data;
}

export async function getUserById(id: string): Promise<DbUser | null> {
  const { data, error } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  throwIfError(error, "Failed to fetch user by id");
  return data;
}

export async function createUser(payload: {
  email: string;
  name: string;
  provider: "google" | "microsoft";
  access_token: string;
  refresh_token: string | null;
  picture: string | null;
}): Promise<DbUser> {
  const { data, error } = await supabase.from("users").insert(payload).select("*").single();
  throwIfError(error, "Failed to create user");
  return data;
}

export async function updateUserTokens(
  id: string,
  payload: { access_token?: string; refresh_token?: string | null }
): Promise<void> {
  const updatePayload: Record<string, string | null> = {};
  if (payload.access_token !== undefined) updatePayload.access_token = payload.access_token;
  if (payload.refresh_token !== undefined) updatePayload.refresh_token = payload.refresh_token;

  if (!Object.keys(updatePayload).length) return;

  const { error } = await supabase.from("users").update(updatePayload).eq("id", id);
  throwIfError(error, "Failed to update user tokens");
}

export async function upsertEmail(payload: {
  user_id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  unsubscribe_link: string | null;
  message_id: string;
  archived?: boolean;
}): Promise<void> {
  const { error } = await supabase.from("emails").upsert(payload, { onConflict: "message_id" });
  throwIfError(error, "Failed to upsert email");
}

export async function deleteEmailsForUserByMessageIds(userId: string, messageIds: string[]): Promise<void> {
  const { error } = await supabase.from("emails").delete().eq("user_id", userId).in("message_id", messageIds);
  throwIfError(error, "Failed to delete emails");
}

export async function markEmailsArchived(userId: string, messageIds: string[]): Promise<void> {
  const { error } = await supabase
    .from("emails")
    .update({ archived: true })
    .eq("user_id", userId)
    .in("message_id", messageIds);
  throwIfError(error, "Failed to archive emails");
}

export async function getEmailByMessageId(userId: string, messageId: string): Promise<DbEmail | null> {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .eq("message_id", messageId)
    .maybeSingle();
  throwIfError(error, "Failed to fetch email by message id");
  return data;
}

export async function getEmailsBySenderLike(userId: string, sender: string, limit = 200): Promise<DbEmail[]> {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .ilike("sender", `%${sender}%`)
    .order("date", { ascending: false })
    .limit(limit);
  throwIfError(error, "Failed to fetch emails by sender");
  return data || [];
}

export async function getEmailsForUser(userId: string): Promise<DbEmail[]> {
  const { data, error } = await supabase.from("emails").select("*").eq("user_id", userId).limit(5000);
  throwIfError(error, "Failed to fetch emails for grouping");
  return data || [];
}

export async function getEmailCountForUser(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("emails")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  throwIfError(error, "Failed to fetch email count for user");
  return count || 0;
}

export async function upsertSubscription(payload: {
  user_id: string;
  sender: string;
  unsubscribed?: boolean;
  unsubscribed_at?: string | null;
  rolled_up?: boolean;
  rolled_up_at?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("subscriptions").upsert(payload, { onConflict: "user_id,sender" });
  throwIfError(error, "Failed to upsert subscription");
}

