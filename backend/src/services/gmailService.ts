import { google } from "googleapis";
import { env } from "../config/env";
import { getGoogleAccessTokenForEmail } from "../auth/auth";
import {
  DbUser,
  deleteEmailsForUserByMessageIds,
  getEmailsForUser,
  getUserById,
  markEmailsArchived,
  upsertEmail,
} from "../repositories/dataRepository";

const { OAuth2 } = google.auth;

function getOauthClient() {
  return new OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
}

async function getGmailForUser(user: DbUser) {
  const oauth2Client = getOauthClient();

  let accessToken: string;

  try {
    accessToken = await getGoogleAccessTokenForEmail(user.email);
  } catch (error) {
    if (!user.access_token) throw error;
    accessToken = user.access_token;
  }

  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function sanitizeGmailLabelName(name: string) {
  return name.replace(/\//g, " ").trim().slice(0, 225) || "Rolled up";
}

export async function ensureLabelForUser(userId: string, labelName: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  const desired = sanitizeGmailLabelName(labelName);
  const existing = await gmail.users.labels.list({ userId: "me" });
  const match = (existing.data.labels || []).find((l) => l.name === desired);
  if (match?.id) return { labelId: match.id, labelName: desired };

  const created = await gmail.users.labels.create({
    userId: "me",
    requestBody: {
      name: desired,
      labelListVisibility: "labelShow",
      messageListVisibility: "show",
    },
  });

  if (!created.data.id) throw new Error("Failed to create label");
  return { labelId: created.data.id, labelName: desired };
}

export async function fetchGmailMessagesAndSave(userId: string, persist = true, maxResults = 200) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const gmail = await getGmailForUser(user);
  const list = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox",
    maxResults,
  });

  const messages = list.data.messages || [];
  const results: Array<Record<string, unknown>> = [];

  for (const m of messages) {
    try {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "List-Unsubscribe"],
      });

      const headers = details.data.payload?.headers || [];
      const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "unknown";
      const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "";
      const listUnsub = headers.find((h) => h.name?.toLowerCase() === "list-unsubscribe")?.value;
      const messageId = m.id!;
      const internalDate = details.data.internalDate ? new Date(Number(details.data.internalDate)) : new Date();
      const snippet = details.data.snippet || "";

      const item = {
        user_id: user.id,
        sender: from,
        subject,
        snippet,
        date: internalDate.toISOString(),
        unsubscribe_link: listUnsub || null,
        message_id: messageId,
      };

      results.push(item);

      if (persist) {
        try {
          await upsertEmail(item);
        } catch (err) {
          console.warn("Failed to persist email", messageId, err);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch message", m.id, err);
    }
  }

  return results.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export async function batchDeleteMessagesForUser(userId: string, messageIds: string[]) {
  if (!messageIds.length) return { deleted: 0 };
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  await gmail.users.messages.batchDelete({
    userId: "me",
    requestBody: { ids: messageIds },
  });

  await deleteEmailsForUserByMessageIds(user.id, messageIds);
  return { deleted: messageIds.length };
}

export async function modifyMessagesForUser(
  userId: string,
  messageIds: string[],
  labelsToAdd: string[] = [],
  labelsToRemove: string[] = []
) {
  if (!messageIds.length) return { modified: 0 };
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  await gmail.users.messages.batchModify({
    userId: "me",
    requestBody: {
      ids: messageIds,
      addLabelIds: labelsToAdd,
      removeLabelIds: labelsToRemove,
    },
  });

  return { modified: messageIds.length };
}

export async function getGroupedEmails(userId: string, limit = 100) {
  const emails = await getEmailsForUser(userId);
  const grouped = new Map<string, { key: string; sender: string; count: number; examples: any[] }>();

  for (const email of emails) {
    const sender = email.sender || "unknown";
    const domainMatch = sender.match(/<([^>]+)>/);
    const senderAddress = (domainMatch?.[1] || sender).toLowerCase();
    const domain = senderAddress.includes("@") ? senderAddress.split("@")[1] : senderAddress;
    const key = domain || sender;

    if (!grouped.has(key)) {
      grouped.set(key, { key, sender, count: 0, examples: [] });
    }

    const current = grouped.get(key)!;
    current.count += 1;
    if (current.examples.length < 5) {
      current.examples.push({
        subject: email.subject,
        snippet: email.snippet,
        messageId: email.message_id,
        date: email.date,
      });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getMessageIdsForSender(userId: string, senderMatch: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  const q = `from:${senderMatch}`;
  const list = await gmail.users.messages.list({ userId: "me", q, maxResults: 500 });
  return (list.data.messages || []).map((m) => m.id!).filter(Boolean) as string[];
}

export default {
  fetchGmailMessagesAndSave,
  batchDeleteMessagesForUser,
  modifyMessagesForUser,
  getGroupedEmails,
  getMessageIdsForSender,
  ensureLabelForUser,
  markEmailsArchived,
};
