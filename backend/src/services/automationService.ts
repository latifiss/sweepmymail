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
  return automation.trigger_type === "new_email" && textMatches(email, automation.trigger_config) && senderMatches(email, automation.trigger_config);
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
  const automations = (await listActiveAutomations()).filter((item) => !userId || item.user_id === userId);
  let evaluated = 0;
  let executed = 0;
  const errors: string[] = [];

  for (const automation of automations) {
    try {
      const emails = await gmailService.fetchGmailMessagesAndSave(automation.user_id, true, 100);
      for (const email of emails) {
        evaluated += 1;
        if (!matches(email, automation)) continue;
        const run = await claimAutomationRun(automation.id, email.message_id);
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
    } catch (error) {
      errors.push(`${automation.name}: ${error instanceof Error ? error.message : "automation failed"}`);
    }
  }
  return { automations: automations.length, evaluated, executed, errors };
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
