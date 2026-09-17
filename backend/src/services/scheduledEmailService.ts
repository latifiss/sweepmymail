import gmailService from "./gmailService";
import {
  claimDueScheduledEmails,
  createScheduledEmail,
  listScheduledEmailsForUser,
  markScheduledEmailFailed,
  markScheduledEmailSent,
  updateScheduledEmailForUser,
  cancelScheduledEmailForUser,
  getScheduledEmailForUser,
} from "../repositories/scheduledEmailRepository";

function normalizeTimezone(value: string | undefined) {
  const timezone = (value || "UTC").trim();
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return timezone;
  } catch {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

function parseSendAt(value: string) {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) throw new Error("sendAt must be a valid ISO date/time");
  if (timestamp.getTime() <= Date.now()) throw new Error("sendAt must be in the future");
  return timestamp.toISOString();
}

export async function scheduleEmail(payload: {
  userId: string;
  conversationId?: string | null;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sendAt: string;
  timezone?: string;
}) {
  return createScheduledEmail({
    user_id: payload.userId,
    conversation_id: payload.conversationId,
    to_addresses: payload.to,
    cc_addresses: payload.cc,
    bcc_addresses: payload.bcc,
    subject: payload.subject,
    body: payload.body,
    send_at: parseSendAt(payload.sendAt),
    timezone: normalizeTimezone(payload.timezone),
  });
}

export async function listUserScheduledEmails(userId: string) {
  return listScheduledEmailsForUser(userId);
}

export async function updateScheduledEmail(payload: {
  userId: string;
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  sendAt: string;
  timezone?: string;
}) {
  return updateScheduledEmailForUser(payload.userId, payload.id, {
    to_addresses: payload.to,
    cc_addresses: payload.cc || [],
    bcc_addresses: payload.bcc || [],
    subject: payload.subject,
    body: payload.body,
    send_at: parseSendAt(payload.sendAt),
    timezone: normalizeTimezone(payload.timezone),
  });
}

export async function cancelScheduledEmail(userId: string, id: string) {
  return cancelScheduledEmailForUser(userId, id);
}

export async function sendDueScheduledEmails() {
  const claimed = await claimDueScheduledEmails(new Date().toISOString(), 20);
  let sent = 0;
  let failed = 0;

  for (const item of claimed) {
    try {
      const result = await gmailService.sendMessageForUser(item.user_id, {
        to: item.to_addresses,
        cc: item.cc_addresses,
        bcc: item.bcc_addresses,
        subject: item.subject,
        body: item.body,
      });
      await markScheduledEmailSent(item.id, {
        messageId: result.messageId || null,
        threadId: result.threadId || null,
      });
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Scheduled send failed";
      await markScheduledEmailFailed(item.id, message);
      failed += 1;
      console.error(`Scheduled email ${item.id} failed:`, message);
    }
  }

  return { claimed: claimed.length, sent, failed };
}

export async function startScheduledEmailScheduler() {
  const tick = async () => {
    try {
      const result = await sendDueScheduledEmails();
      if (result.claimed) console.log(`Scheduled email tick: ${JSON.stringify(result)}`);
    } catch (error) {
      console.error("Scheduled email scheduler tick failed:", error);
    }
  };

  await tick();
  return setInterval(tick, 30 * 1000);
}

export { getScheduledEmailForUser };
