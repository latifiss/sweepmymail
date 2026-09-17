import { google } from "googleapis";
import { env } from "../config/env";
import { getGoogleAccessTokenForEmail, refreshGoogleAccessTokenForEmail } from "../auth/auth";
import {
  DbUser,
  deleteEmailsForUserByMessageIds,
  getEmailsForUser,
  getUserById,
  markEmailsArchived,
  upsertEmail,
} from "../repositories/dataRepository";

const { OAuth2 } = google.auth;

function getOauthClient(accessToken: string) {
  const oauth2Client = new OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
}

async function getGmailForUser(user: DbUser) {
  try {
    const accessToken = await getGoogleAccessTokenForEmail(user.email);
    return google.gmail({ version: "v1", auth: getOauthClient(accessToken) });
  } catch (error) {
    if (!user.access_token) throw error;
    return google.gmail({ version: "v1", auth: getOauthClient(user.access_token) });
  }
}

async function getGmailWithRefresh(user: DbUser, action: (gmail: ReturnType<typeof google.gmail>) => Promise<any>) {
  let gmail = await getGmailForUser(user);
  try {
    return await action(gmail);
  } catch (error) {
    if (!isGmailUnauthorized(error)) throw error;
    const accessToken = await refreshGoogleAccessTokenForEmail(user.email);
    gmail = google.gmail({ version: "v1", auth: getOauthClient(accessToken) });
    return action(gmail);
  }
}

function getGmailErrorMessage(error: unknown, operation: string) {
  const err = error as any;
  const status = err?.response?.status ?? err?.code;
  const message = err?.response?.data?.error?.message || err?.message || "Unknown Gmail error";
  const reason = err?.response?.data?.error?.errors?.[0]?.reason;
  const details = [status ? `status ${status}` : null, reason ? `reason ${reason}` : null]
    .filter(Boolean)
    .join(", ");
  return `${operation} failed${details ? ` (${details})` : ""}: ${message}`;
}

function isGmailUnauthorized(error: unknown) {
  const err = error as any;
  return err?.response?.status === 401 || err?.code === 401;
}

function sanitizeGmailLabelName(name: string) {
  return name.replace(/\//g, " ").trim().slice(0, 225) || "Rolled up";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function escapeHeaderValue(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function buildRawMessage(input: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  inReplyTo?: string;
  references?: string;
}) {
  const lines = [
    `To: ${input.to.map(escapeHeaderValue).join(", ")}`,
    ...(input.cc?.length ? [`Cc: ${input.cc.map(escapeHeaderValue).join(", ")}`] : []),
    ...(input.bcc?.length ? [`Bcc: ${input.bcc.map(escapeHeaderValue).join(", ")}`] : []),
    `Subject: ${escapeHeaderValue(input.subject)}`,
    ...(input.inReplyTo ? [`In-Reply-To: ${escapeHeaderValue(input.inReplyTo)}`] : []),
    ...(input.references ? [`References: ${escapeHeaderValue(input.references)}`] : []),
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    input.body,
  ];

  return encodeBase64Url(lines.join("\r\n"));
}

function getHeader(headers: any[] | undefined, name: string) {
  return headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function collectBodyParts(part: any, plain: string[], html: string[]) {
  if (!part) return;
  const mimeType = part.mimeType || "";
  if (part.body?.data) {
    const decoded = decodeBase64Url(part.body.data);
    if (mimeType === "text/plain") plain.push(decoded);
    else if (mimeType === "text/html") html.push(decoded);
  }
  for (const child of part.parts || []) collectBodyParts(child, plain, html);
}

function stripHtml(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

export async function ensureLabelForUser(userId: string, labelName: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const desired = sanitizeGmailLabelName(labelName);
  return getGmailWithRefresh(user, async (gmail) => {
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
  });
}

export async function fetchGmailMessagesAndSave(userId: string, persist = true, maxResults = 200) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  let gmail = await getGmailForUser(user);
  let refreshed = false;

  try {
    const results: Array<Record<string, unknown>> = [];
    let pageToken: string | undefined;
    let remaining = Math.min(Math.max(maxResults, 1), 500);

    while (remaining > 0) {
      let list;
      try {
        list = await gmail.users.messages.list({
          userId: "me",
          q: "in:inbox",
          maxResults: Math.min(remaining, 100),
          pageToken,
          includeSpamTrash: false,
        });
      } catch (error) {
        if (!isGmailUnauthorized(error) || refreshed) throw error;

        const accessToken = await refreshGoogleAccessTokenForEmail(user.email);
        gmail = google.gmail({ version: "v1", auth: getOauthClient(accessToken) });
        refreshed = true;
        pageToken = undefined;
        remaining = Math.min(Math.max(maxResults, 1), 500);
        results.length = 0;
        continue;
      }

      const messages = list.data.messages || [];
      if (!messages.length) break;

      const batch = await Promise.all(
        messages.map(async (m) => {
          if (!m.id) return null;

          try {
            const details = await gmail.users.messages.get({
              userId: "me",
              id: m.id,
              format: "metadata",
              metadataHeaders: ["From", "Subject", "List-Unsubscribe"],
            });

            const headers = details.data.payload?.headers || [];
            const from = getHeader(headers, "From") || "unknown";
            const subject = getHeader(headers, "Subject");
            const listUnsub = getHeader(headers, "List-Unsubscribe");
            const internalDate = details.data.internalDate
              ? new Date(Number(details.data.internalDate))
              : new Date();

            return {
              user_id: user.id,
              sender: from,
              subject,
              snippet: details.data.snippet || "",
              date: internalDate.toISOString(),
              unsubscribe_link: listUnsub || null,
              message_id: m.id,
            };
          } catch (error) {
            console.warn(getGmailErrorMessage(error, `Gmail message metadata ${m.id}`));
            return null;
          }
        })
      );

      for (const item of batch) {
        if (!item) continue;
        results.push(item);

        if (persist) {
          try {
            await upsertEmail(item);
          } catch (error) {
            console.warn("Failed to persist email", item.message_id, error);
          }
        }
      }

      remaining -= messages.length;
      pageToken = list.data.nextPageToken || undefined;
      if (!pageToken) break;
    }

    return results.sort((a, b) => {
      const aTime = new Date(String(a.date)).getTime();
      const bTime = new Date(String(b.date)).getTime();
      return bTime - aTime;
    });
  } catch (error) {
    throw new Error(getGmailErrorMessage(error, "Gmail inbox refresh"));
  }
}

export async function getFullMessageForUser(userId: string, messageId: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return getGmailWithRefresh(user, async (gmail) => {
    const response = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    const message = response.data;
    const headers = message.payload?.headers || [];
    const plain: string[] = [];
    const html: string[] = [];
    collectBodyParts(message.payload, plain, html);

    return {
      messageId: message.id || messageId,
      threadId: message.threadId || null,
      from: getHeader(headers, "From"),
      to: getHeader(headers, "To"),
      cc: getHeader(headers, "Cc"),
      bcc: getHeader(headers, "Bcc"),
      subject: getHeader(headers, "Subject"),
      date: getHeader(headers, "Date") || (message.internalDate ? new Date(Number(message.internalDate)).toISOString() : ""),
      messageIdHeader: getHeader(headers, "Message-ID"),
      references: getHeader(headers, "References"),
      body: plain.join("\n\n").trim() || stripHtml(html.join("\n")),
      snippet: message.snippet || "",
      labelIds: message.labelIds || [],
    };
  });
}

export async function createDraftForUser(userId: string, input: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}) {
  if (!input.to.length) throw new Error("At least one recipient is required");
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return getGmailWithRefresh(user, async (gmail) => {
    const created = await gmail.users.drafts.create({
      userId: "me",
      requestBody: {
        message: {
          threadId: input.threadId,
          raw: buildRawMessage(input),
        },
      },
    });

    if (!created.data.id) throw new Error("Gmail did not return a draft ID");
    return {
      draftId: created.data.id,
      messageId: created.data.message?.id || null,
      threadId: created.data.message?.threadId || input.threadId || null,
    };
  });
}

export async function updateDraftForUser(userId: string, draftId: string, input: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}) {
  if (!input.to.length) throw new Error("At least one recipient is required");
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return getGmailWithRefresh(user, async (gmail) => {
    const updated = await gmail.users.drafts.update({
      userId: "me",
      id: draftId,
      requestBody: {
        message: {
          threadId: input.threadId,
          raw: buildRawMessage(input),
        },
      },
    });

    return {
      draftId: updated.data.id || draftId,
      messageId: updated.data.message?.id || null,
      threadId: updated.data.message?.threadId || input.threadId || null,
    };
  });
}

export async function sendDraftForUser(userId: string, draftId: string) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return getGmailWithRefresh(user, async (gmail) => {
    const sent = await gmail.users.drafts.send({
      userId: "me",
      requestBody: { id: draftId },
    });
    return {
      sent: true,
      messageId: sent.data.id || null,
      threadId: sent.data.threadId || null,
    };
  });
}

export async function sendMessageForUser(userId: string, input: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}) {
  if (!input.to.length) throw new Error("At least one recipient is required");
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  return getGmailWithRefresh(user, async (gmail) => {
    const sent = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        threadId: input.threadId,
        raw: buildRawMessage(input),
      },
    });
    return {
      sent: true,
      messageId: sent.data.id || null,
      threadId: sent.data.threadId || input.threadId || null,
    };
  });
}

export async function batchDeleteMessagesForUser(userId: string, messageIds: string[]) {
  if (!messageIds.length) return { deleted: 0 };
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  await getGmailWithRefresh(user, async (gmail) => {
    await gmail.users.messages.batchDelete({
      userId: "me",
      requestBody: { ids: messageIds },
    });
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

  await getGmailWithRefresh(user, async (gmail) => {
    await gmail.users.messages.batchModify({
      userId: "me",
      requestBody: {
        ids: messageIds,
        addLabelIds: labelsToAdd,
        removeLabelIds: labelsToRemove,
      },
    });
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

  return getGmailWithRefresh(user, async (gmail) => {
    const q = `from:${senderMatch}`;
    const list = await gmail.users.messages.list({ userId: "me", q, maxResults: 500 });
    return (list.data.messages || []).map((m) => m.id!).filter(Boolean) as string[];
  });
}

export default {
  fetchGmailMessagesAndSave,
  getFullMessageForUser,
  createDraftForUser,
  updateDraftForUser,
  sendDraftForUser,
  sendMessageForUser,
  batchDeleteMessagesForUser,
  modifyMessagesForUser,
  getGroupedEmails,
  getMessageIdsForSender,
  ensureLabelForUser,
  markEmailsArchived,
};
