import { google } from "googleapis";
import { env } from "../config/env";
import {
  getGoogleAccessTokenForEmail,
  refreshGoogleAccessTokenForEmail,
  GoogleReauthorizationRequiredError,
} from "../auth/auth";
import { getUserById } from "../repositories/dataRepository";

const { OAuth2 } = google.auth;

function client(accessToken: string) {
  const oauth2Client = new OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth: oauth2Client });
}

function unauthorized(error: any) {
  return error?.response?.status === 401 || error?.code === 401;
}

async function withGmail<T>(userId: string, fn: (gmail: ReturnType<typeof google.gmail>) => Promise<T>) {
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  let gmail = client(await getGoogleAccessTokenForEmail(user.email));
  try {
    return await fn(gmail);
  } catch (error) {
    if (!unauthorized(error)) throw error;
    try {
      const token = await refreshGoogleAccessTokenForEmail(user.email);
      gmail = client(token);
      return await fn(gmail);
    } catch (refreshError) {
      if (refreshError instanceof GoogleReauthorizationRequiredError) throw refreshError;
      throw refreshError;
    }
  }
}

function header(headers: any[] | undefined, name: string) {
  return headers?.find((h) => String(h.name || "").toLowerCase() === name.toLowerCase())?.value || "";
}

function decode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf8");
}

function stripHtml(value: string) {
  return value.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").trim();
}

function collect(part: any, plain: string[], html: string[], attachments: any[]) {
  if (!part) return;
  if (part.body?.attachmentId) {
    attachments.push({
      attachmentId: part.body.attachmentId,
      filename: part.filename || "attachment",
      mimeType: part.mimeType || "application/octet-stream",
      size: part.body.size || 0,
    });
  }
  if (part.body?.data) {
    const text = decode(part.body.data);
    if (part.mimeType === "text/plain") plain.push(text);
    else if (part.mimeType === "text/html") html.push(text);
  }
  for (const child of part.parts || []) collect(child, plain, html, attachments);
}

function metadata(message: any) {
  const headers = message.payload?.headers || [];
  return {
    messageId: message.id || "",
    threadId: message.threadId || null,
    from: header(headers, "From"),
    to: header(headers, "To"),
    cc: header(headers, "Cc"),
    bcc: header(headers, "Bcc"),
    subject: header(headers, "Subject"),
    date: header(headers, "Date") || (message.internalDate ? new Date(Number(message.internalDate)).toISOString() : ""),
    snippet: message.snippet || "",
    labelIds: message.labelIds || [],
  };
}

async function getFull(gmail: ReturnType<typeof google.gmail>, id: string) {
  const response = await gmail.users.messages.get({ userId: "me", id, format: "full" });
  const message = response.data;
  const plain: string[] = [];
  const html: string[] = [];
  const attachments: any[] = [];
  collect(message.payload, plain, html, attachments);
  const headers = message.payload?.headers || [];
  return {
    ...metadata(message),
    messageIdHeader: header(headers, "Message-ID"),
    references: header(headers, "References"),
    inReplyTo: header(headers, "In-Reply-To"),
    body: plain.join("\n\n").trim() || stripHtml(html.join("\n")),
    attachments,
  };
}

export async function searchMessagesForUser(userId: string, query: string, limit = 20, includeSpamTrash = false) {
  return withGmail(userId, async (gmail) => {
    const out: any[] = [];
    let pageToken: string | undefined;
    while (out.length < limit) {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: Math.min(100, limit - out.length),
        pageToken,
        includeSpamTrash,
      });
      for (const item of response.data.messages || []) {
        if (!item.id) continue;
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: item.id,
            format: "metadata",
            metadataHeaders: ["From", "To", "Cc", "Subject", "Date", "List-Unsubscribe"],
          });
          out.push({
            ...metadata(detail.data),
            unsubscribeLink: header(detail.data.payload?.headers, "List-Unsubscribe") || null,
          });
        } catch {}
        if (out.length >= limit) break;
      }
      pageToken = response.data.nextPageToken || undefined;
      if (!pageToken || !(response.data.messages || []).length) break;
    }
    return out;
  });
}

export async function getThreadForUser(userId: string, threadId: string, limit = 50) {
  return withGmail(userId, async (gmail) => {
    const response = await gmail.users.threads.get({ userId: "me", id: threadId, format: "full" });
    const messages = (response.data.messages || []).slice(-limit);
    return {
      threadId,
      count: messages.length,
      messages: await Promise.all(messages.map((message) => getFull(gmail, message.id!))),
    };
  });
}

export async function listDraftsForUser(userId: string, limit = 20) {
  return withGmail(userId, async (gmail) => {
    const response = await gmail.users.drafts.list({ userId: "me", maxResults: limit });
    const drafts = [];
    for (const draft of response.data.drafts || []) {
      if (!draft.id) continue;
      const full = await gmail.users.drafts.get({ userId: "me", id: draft.id, format: "full" });
      drafts.push({ draftId: draft.id, message: await getFull(gmail, full.data.message?.id || "") });
    }
    return drafts;
  });
}

export async function deleteDraftForUser(userId: string, draftId: string) {
  return withGmail(userId, async (gmail) => {
    await gmail.users.drafts.delete({ userId: "me", id: draftId });
    return { deleted: true, draftId };
  });
}

export async function trashMessagesForUser(userId: string, messageIds: string[]) {
  return withGmail(userId, async (gmail) => {
    for (const id of messageIds) await gmail.users.messages.trash({ userId: "me", id });
    return { trashed: messageIds.length, messageIds };
  });
}

export async function untrashMessagesForUser(userId: string, messageIds: string[]) {
  return withGmail(userId, async (gmail) => {
    for (const id of messageIds) await gmail.users.messages.untrash({ userId: "me", id });
    return { restored: messageIds.length, messageIds };
  });
}

export async function listLabelsForUser(userId: string) {
  return withGmail(userId, async (gmail) => {
    const response = await gmail.users.labels.list({ userId: "me" });
    return (response.data.labels || []).map((label) => ({
      id: label.id || "",
      name: label.name || "",
      type: label.type || "",
      messagesTotal: label.messagesTotal || 0,
      messagesUnread: label.messagesUnread || 0,
    }));
  });
}

export async function getAttachmentsForMessage(userId: string, messageId: string) {
  return withGmail(userId, async (gmail) => {
    const message = await gmail.users.messages.get({ userId: "me", id: messageId, format: "full" });
    const attachments: any[] = [];
    const walk = (part: any) => {
      if (!part) return;
      if (part.body?.attachmentId) attachments.push({
        attachmentId: part.body.attachmentId,
        filename: part.filename || "attachment",
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body.size || 0,
      });
      for (const child of part.parts || []) walk(child);
    };
    walk(message.data.payload);
    return { messageId, attachments };
  });
}

export default {
  searchMessagesForUser,
  getThreadForUser,
  listDraftsForUser,
  deleteDraftForUser,
  trashMessagesForUser,
  untrashMessagesForUser,
  listLabelsForUser,
  getAttachmentsForMessage,
};
