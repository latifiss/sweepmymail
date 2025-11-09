import { google } from "googleapis";
import { env } from "../config/env.js";
import User, { IUser } from "../models/user";
import Email, { IEmail } from "../models/email";
import mongoose from "mongoose";

const { OAuth2 } = google.auth;

function getOauthClient() {
  return new OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

/**
 * Build an authenticated gmail client for a stored user
 */
async function getGmailForUser(user: IUser) {
  const oauth2Client = getOauthClient();
  // set refresh token so google lib will auto-refresh access token
  oauth2Client.setCredentials({
    refresh_token: user.refreshToken,
  });

  // ensure we have a fresh access token (optional: google lib will refresh as needed)
  try {
    const res = await oauth2Client.getAccessToken();
    if (res.token) {
      oauth2Client.setCredentials({ access_token: res.token });
    }
  } catch (err) {
    // ignore - next calls may still refresh automatically
  }

  return google.gmail({ version: "v1", auth: oauth2Client });
}

/**
 * Fetch promotional/newsletter messages and return structured array.
 * Also optionally persist into Emails collection.
 */
export async function fetchGmailMessagesAndSave(userId: string, persist = true) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const gmail = await getGmailForUser(user);
  const list = await gmail.users.messages.list({
    userId: "me",
    q: "category:promotions OR category:social OR label:^unread", // broaden optionally
    maxResults: 200,
  });

  const messages = list.data.messages || [];
  const results: Array<Partial<IEmail>> = [];

  for (const m of messages) {
    try {
      const details = await gmail.users.messages.get({
        userId: "me",
        id: m.id!,
        format: "full",
      });

      const headers = details.data.payload?.headers || [];
      const from = headers.find(h => h.name === "From")?.value || "unknown";
      const subject = headers.find(h => h.name === "Subject")?.value || "";
      const listUnsub = headers.find(h => h.name?.toLowerCase() === "list-unsubscribe")?.value;
      const messageId = m.id!;
      const internalDate = details.data.internalDate ? new Date(Number(details.data.internalDate)) : new Date();

      const snippet = details.data.snippet || "";

      const item = {
        user: user._id as mongoose.Types.ObjectId,
        sender: from,
        subject,
        snippet,
        date: internalDate,
        unsubscribeLink: listUnsub || undefined,
        messageId,
      };

      results.push(item);

      if (persist) {
        try {
          // upsert avoid duplicates
          await Email.updateOne({ messageId }, { $set: item }, { upsert: true });
        } catch (err) {
          // ignore duplicates or save errors
        }
      }
    } catch (err) {
      // skip single message errors
      console.warn("Failed to fetch message", m.id, err);
    }
  }

  return results;
}

/**
 * Batch delete messages by Gmail message IDs
 */
export async function batchDeleteMessagesForUser(userId: string, messageIds: string[]) {
  if (!messageIds.length) return { deleted: 0 };
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  // Gmail supports batchModify for trash or delete - here we call 'batchDelete' via modifying labels to TRASH or using delete
  // We'll use users.messages.batchDelete which permanently deletes messages.
  try {
    await gmail.users.messages.batchDelete({
      userId: "me",
      requestBody: { ids: messageIds },
    });

    // also remove from our DB
    await Email.deleteMany({ messageId: { $in: messageIds }, user: user._id });

    return { deleted: messageIds.length };
  } catch (err) {
    throw err;
  }
}

/**
 * Archive (remove INBOX) or add labels to messages.
 * labelsToAdd: array of labelIds to add
 * labelsToRemove: array of labelIds to remove
 */
export async function modifyMessagesForUser(userId: string, messageIds: string[], labelsToAdd: string[] = [], labelsToRemove: string[] = []) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  try {
    await gmail.users.messages.batchModify({
      userId: "me",
      requestBody: {
        ids: messageIds,
        addLabelIds: labelsToAdd,
        removeLabelIds: labelsToRemove,
      },
    });
    return { modified: messageIds.length };
  } catch (err) {
    throw err;
  }
}

/**
 * Group saved emails by sender domain / sender name
 * returns array of { key, count, examples: [...first few messages] }
 */
export async function getGroupedEmails(userId: string, limit = 100) {
  // we group by normalized sender (extract domain or email)
  const pipeline = [
    { $match: { user: (await User.findById(userId))?._id } },
    {
      $project: {
        subject: 1,
        snippet: 1,
        sender: 1,
        messageId: 1,
        date: 1,
        // try to extract domain from sender
        domain: {
          $toLower: {
            $trim: {
              input: {
                $arrayElemAt: [
                  { $split: [{ $arrayElemAt: [{ $split: ["$sender", "<"] }, 1] }, ">"] },
                  0,
                ],
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        domain2: {
          $cond: [
            { $eq: [{ $type: "$domain" }, "string"] },
            {
              $let: {
                vars: {
                  parts: { $split: ["$domain", "@"] },
                },
                in: { $arrayElemAt: ["$$parts", 1] },
              },
            },
            "unknown",
          ],
        },
      },
    },
    {
      $group: {
        _id: { sender: "$sender", domain: "$domain2" },
        count: { $sum: 1 },
        examples: { $push: { subject: "$subject", snippet: "$snippet", messageId: "$messageId", date: "$date" } },
      },
    },
    { $sort: { count: -1 as const } },
    { $limit: limit },
    {
      $project: {
        key: { $ifNull: ["$_id.domain", "$_id.sender"] },
        sender: "$_id.sender",
        count: 1,
        examples: { $slice: ["$examples", 5] },
      },
    },
  ];

  // run aggregation on Email collection
  const agg = await Email.aggregate(pipeline).allowDiskUse(true);
  return agg;
}

/**
 * Helper: fetch all messages ids for a given sender (by domain or full sender string)
 */
export async function getMessageIdsForSender(userId: string, senderMatch: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const gmail = await getGmailForUser(user);

  // Try search query: from:"domain or sender"
  const q = `from:${senderMatch}`;
  const list = await gmail.users.messages.list({ userId: "me", q, maxResults: 500 });
  const ids = (list.data.messages || []).map(m => m.id!) as string[];
  return ids;
}

export default {
  fetchGmailMessagesAndSave,
  batchDeleteMessagesForUser,
  modifyMessagesForUser,
  getGroupedEmails,
  getMessageIdsForSender,
};
