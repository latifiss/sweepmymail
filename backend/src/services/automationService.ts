import gmailService from "./gmailService";
import { Automation, listActiveAutomations } from "../repositories/automationRepository";
import { claimAutomationRun, markAutomationRunFailed, markAutomationRunSucceeded } from "../repositories/automationRunRepository";

function textMatches(email: any, config: Record<string, unknown>) {
  const haystack = `${email.sender || ""} ${email.subject || ""} ${email.snippet || ""}`.toLowerCase();
  const query = String(config.query || config.keyword || "").trim().toLowerCase();
  return query ? haystack.includes(query) : true;
}

function senderMatches(email: any, config: Record<string, unknown>) {
  const sender = String(config.sender || config.from || "").trim().toLowerCase();
  return sender ? String(email.sender || "").toLowerCase().includes(sender) : true;
}

function matches(email: any, automation: Automation) {
  if (automation.trigger_type !== "new_email") return false;
  const emailTime = new Date(email.date || 0).getTime();
  const automationTime = new Date(automation.created_at).getTime();
  if (!Number.isFinite(emailTime) || emailTime < automationTime) return false;
  return textMatches(email, automation.trigger_config) && senderMatches(email, automation.trigger_config);
}

async function executeAction(automation: Automation, email: any) {
  const config = automation.action_config || {};
  if (automation.action_type === "archive") return gmailService.modifyMessagesForUser(automation.user_id, [email.message_id], [], ["INBOX"]);
  if (automation.action_type === "mark_important") return gmailService.modifyMessagesForUser(automation.user_id, [email.message_id], ["IMPORTANT"], []);
  if (automation.action_type === "categorize") {
    const label = String(config.label || "").trim();
    if (!label) throw new Error("Automation category label is required");
    const { labelId } = await gmailService.ensureLabelForUser(automation.user_id, label);
    return gmailService.modifyMessagesForUser(automation.user_id, [email.message_id], [labelId], []);
  }
  if (automation.action_type === "forward") {
    const to = Array.isArray(config.to) ? config.to.map(String).filter(Boolean) : [];
    if (!to.length) throw new Error("Automation forwarding recipients are required");
    const original = await gmailService.getFullMessageForUser(automation.user_id, email.message_id);
    return gmailService.sendMessageForUser(automation.user_id, {
      to,
      subject: original.subject.toLowerCase().startsWith("fwd:") ? original.subject : `Fwd: ${original.subject}`,
      body: `---------- Forwarded message ----------\nFrom: ${original.from}\nDate: ${original.date}\nSubject: ${original.subject}\nTo: ${original.to}\n\n${original.body}`,
    });
  }
  throw new Error(`Unsupported automation action: ${automation.action_type}`);
}

export async function runInboxAutomations(userId?: string) {
  const activeAutomations = await listActiveAutomations();
  const automationsByUser = new Map<string, Automation[]>();

  for (const automation of activeAutomations) {
    if (userId && automation.user_id !== userId) continue;
    const existing = automationsByUser.get(automation.user_id) || [];
    existing.push(automation);
    automationsByUser.set(automation.user_id, existing);
  }

  let evaluated = 0;
  let executed = 0;
  const errors: string[] = [];

  for (const [automationUserId, automations] of automationsByUser) {
    let emails: Array<Record<string, unknown>>;
    try {
      // Refresh each user's inbox once per scheduler tick, then evaluate all of
      // that user's automations against the same snapshot. This avoids making
      // one full Gmail refresh per automation and greatly reduces API quota use.
      emails = await gmailService.fetchGmailMessagesAndSave(automationUserId, true, 25);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gmail inbox refresh failed";
      for (const automation of automations) errors.push(`${automation.name}: ${message}`);
      continue;
    }

    for (const automation of automations) {
      for (const email of emails) {
        evaluated += 1;
        if (!matches(email, automation)) continue;

        const messageId = String(email.message_id || "");
        if (!messageId) continue;

        const run = await claimAutomationRun(automation.id, messageId);
        if (!run) continue;

        try {
          await executeAction(automation, email);
          await markAutomationRunSucceeded(run.id);
          executed += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : "automation action failed";
          await markAutomationRunFailed(run.id, message);
          errors.push(`${automation.name}: ${message}`);
        }
      }
    }
  }

  return { automations: activeAutomations.filter((item) => !userId || item.user_id === userId).length, evaluated, executed, errors };
}

export async function startAutomationScheduler() {
  const tick = async () => {
    try {
      const result = await runInboxAutomations();
      if (result.executed || result.errors.length) console.log(`Automation tick: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error("Automation scheduler tick failed:", error);
    }
  };

  await tick();
  return setInterval(tick, 60 * 1000);
}
