import { supabase } from "../config/supabase";

export async function claimAutomationRun(automationId: string, messageId: string) {
  const { data, error } = await supabase
    .from("agent_automation_runs")
    .insert({ automation_id: automationId, message_id: messageId, status: "running" })
    .select("*")
    .maybeSingle();
  if (error && !String(error.message).toLowerCase().includes("duplicate")) throw new Error(error.message);
  return data || null;
}

export async function markAutomationRunSucceeded(id: string) {
  const { error } = await supabase.from("agent_automation_runs").update({ status: "succeeded", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function markAutomationRunFailed(id: string, message: string) {
  const { error } = await supabase.from("agent_automation_runs").update({ status: "failed", error_message: message.slice(0, 2000), updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}
