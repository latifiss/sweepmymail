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

export interface DbDailySummary {
  id: string;
  user_id: string;
  summary_text: string;
  citations: Array<{
    id: number;
    emailId: string;
    subject: string;
    sender: string;
    preview: string;
    link: string;
  }>;
  emails_received: number;
  priority_items: number;
  generated_at: string;
}

export interface DbCategory {
  id: string;
  user_id: string;
  label: string;
  description: string;
  keywords: string[];
  email_count: number;
  created_at: string;
}

export interface DbPriorityKeyword {
  id: string;
  user_id: string;
  word: string;
  email_count: number;
  created_at: string;
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

export async function getEmailsForUserInRange(
  userId: string,
  sinceIso: string,
  untilIso: string
): Promise<DbEmail[]> {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .gte("date", sinceIso)
    .lt("date", untilIso)
    .order("date", { ascending: false })
    .limit(5000);
  throwIfError(error, "Failed to fetch emails for date range");
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

export async function listUsers(): Promise<DbUser[]> {
  const { data, error } = await supabase.from("users").select("*");
  throwIfError(error, "Failed to list users");
  return data || [];
}

export async function getLatestDailySummary(userId: string): Promise<DbDailySummary | null> {
  const { data, error } = await supabase
    .from("daily_summaries")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfError(error, "Failed to fetch latest daily summary");
  return data;
}

export async function replaceDailySummaryForUser(payload: {
  user_id: string;
  summary_text: string;
  citations: DbDailySummary["citations"];
  emails_received: number;
  priority_items: number;
  generated_at: string;
}): Promise<void> {
  const { error: deleteError } = await supabase.from("daily_summaries").delete().eq("user_id", payload.user_id);
  throwIfError(deleteError, "Failed to delete previous daily summary");

  const { error: insertError } = await supabase.from("daily_summaries").insert(payload);
  throwIfError(insertError, "Failed to insert daily summary");
}

export async function listCategoriesForUser(userId: string): Promise<DbCategory[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwIfError(error, "Failed to list categories");
  return data || [];
}

export async function createCategory(payload: {
  user_id: string;
  label: string;
  description: string;
  keywords: string[];
  email_count?: number;
}): Promise<DbCategory> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      ...payload,
      email_count: payload.email_count || 0,
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to create category");
  return data;
}

export async function deleteCategoryForUser(userId: string, categoryId: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("user_id", userId).eq("id", categoryId);
  throwIfError(error, "Failed to delete category");
}

export async function updateCategoryEmailCount(
  userId: string,
  categoryId: string,
  emailCount: number
): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .update({ email_count: emailCount })
    .eq("user_id", userId)
    .eq("id", categoryId);
  throwIfError(error, "Failed to update category email count");
}

export async function listPriorityKeywordsForUser(userId: string): Promise<DbPriorityKeyword[]> {
  const { data, error } = await supabase
    .from("priority_keywords")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwIfError(error, "Failed to list priority keywords");
  return data || [];
}

export async function createPriorityKeyword(payload: {
  user_id: string;
  word: string;
  email_count?: number;
}): Promise<DbPriorityKeyword> {
  const { data, error } = await supabase
    .from("priority_keywords")
    .insert({
      ...payload,
      email_count: payload.email_count || 0,
    })
    .select("*")
    .single();
  throwIfError(error, "Failed to create priority keyword");
  return data;
}

export async function deletePriorityKeywordForUser(userId: string, keywordId: string): Promise<void> {
  const { error } = await supabase
    .from("priority_keywords")
    .delete()
    .eq("user_id", userId)
    .eq("id", keywordId);
  throwIfError(error, "Failed to delete priority keyword");
}

export async function updatePriorityKeywordEmailCount(
  userId: string,
  keywordId: string,
  emailCount: number
): Promise<void> {
  const { error } = await supabase
    .from("priority_keywords")
    .update({ email_count: emailCount })
    .eq("user_id", userId)
    .eq("id", keywordId);
  throwIfError(error, "Failed to update priority keyword email count");
}

