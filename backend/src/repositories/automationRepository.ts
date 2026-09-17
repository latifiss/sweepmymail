import { supabase } from "../config/supabase";

export type AutomationStatus = "active" | "paused";
export type Automation = {
  id: string;
  user_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  status: AutomationStatus;
  created_at: string;
  updated_at: string;
};

function fail(error: { message: string } | null, fallback: string) {
  if (error) throw new Error(error.message || fallback);
}

export async function createAutomation(payload: Omit<Automation, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("agent_automations").insert(payload).select("*").single();
  fail(error, "Failed to create automation");
  return data as Automation;
}

export async function listAutomationsForUser(userId: string) {
  const { data, error } = await supabase.from("agent_automations").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  fail(error, "Failed to list automations");
  return (data || []) as Automation[];
}

export async function getAutomationForUser(userId: string, id: string) {
  const { data, error } = await supabase.from("agent_automations").select("*").eq("user_id", userId).eq("id", id).maybeSingle();
  fail(error, "Failed to fetch automation");
  return (data || null) as Automation | null;
}

export async function updateAutomationForUser(userId: string, id: string, payload: Partial<Pick<Automation, "name" | "trigger_type" | "trigger_config" | "action_type" | "action_config" | "status">>) {
  const { data, error } = await supabase.from("agent_automations").update({ ...payload, updated_at: new Date().toISOString() }).eq("user_id", userId).eq("id", id).select("*").maybeSingle();
  fail(error, "Failed to update automation");
  if (!data) throw new Error("Automation not found");
  return data as Automation;
}

export async function deleteAutomationForUser(userId: string, id: string) {
  const { data, error } = await supabase.from("agent_automations").delete().eq("user_id", userId).eq("id", id).select("*").maybeSingle();
  fail(error, "Failed to delete automation");
  if (!data) throw new Error("Automation not found");
  return data as Automation;
}

export async function listActiveAutomations() {
  const { data, error } = await supabase.from("agent_automations").select("*").eq("status", "active");
  fail(error, "Failed to load active automations");
  return (data || []) as Automation[];
}
