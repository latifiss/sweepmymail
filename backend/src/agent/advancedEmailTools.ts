import { tool } from "ai";
import { z } from "zod";
import gmailService from "../services/gmailService";
import { getEmailsForUser, getEmailByMessageId } from "../repositories/dataRepository";
import advancedGmailService from "../services/advancedGmailService";
import type { EmailSearchIntent } from "./emailSearchIntent";

const messageIdsSchema = z.array(z.string().min(1)).min(1).max(100);

function formatEmail(email: any) {
  return {
    id: email.messageId || email.message_id,
    messageId: email.messageId || email.message_id,
    threadId: email.threadId || null,
    sender: email.from || email.sender || "",
    to: email.to || "",
    cc: email.cc || "",
    subject: email.subject || "(no subject)",
    preview: String(email.snippet || email.body || "").slice(0, 240),
    date: email.date || "",
    receivedAt: email.date || "",
    labels: email.labelIds || [],
  };
}

function formatEmailList(emails: any[]) {
  return emails.map(formatEmail);
}

function actionUi(lead: string, title: string, content: string) {
  return {
    lead,
    ui: {
      kind: "summary",
      lead,
      title,
      content,
      citations: [],
    },
  };
}

export function createAdvancedAgentTools(userId: string, userEmail: string, searchIntent?: EmailSearchIntent | null) {
  // A single user request must produce one authoritative Gmail search result.
  // ToolLoopAgent may ask for the same search again after an empty result; cache
  // the first execution and suppress duplicate UI payloads.
  let searchPromise: Promise<{ count: number; emails: any[]; ui: any }> | null = null;

  return {
    search_gmail: tool({
      description:
        "Search Gmail directly using Gmail search syntax. Use this for sender, subject, date, unread, starred, has:attachment, label, thread, or broad natural-language email searches. Prefer this over the local database when freshness matters. Return message IDs and metadata, not a prose list.",
      inputSchema: z.object({
        query: z.string().min(1).max(500),
        limit: z.number().int().min(1).max(100).default(20),
        includeSpamTrash: z.boolean().default(false),
      }),
      execute: async ({ query, limit, includeSpamTrash }) => {
        if (searchPromise) {
          const cached = await searchPromise;
          return { count: cached.count, emails: cached.emails, duplicateSearch: true };
        }

        const effectiveQuery = searchIntent?.query || query;
        const effectiveLimit = searchIntent?.limit || limit;
        searchPromise = (async () => {
          const messages = await advancedGmailService.searchMessagesForUser(
            userId, effectiveQuery, effectiveLimit, includeSpamTrash,
          );
          const emails = formatEmailList(messages);
          return {
            count: emails.length,
            emails,
            ui: {
              kind: "email-list",
              lead: emails.length
                ? `I found ${emails.length} matching email${emails.length === 1 ? "" : "s"} in Gmail:`
                : "I couldn't find any matching emails in Gmail.",
              emails,
            },
          };
        })();
        return searchPromise;
      },
    }),

    read_emails: tool({
      description:
        "Read up to 10 full emails at once. Use this for summaries, comparisons, and action items. Prefer the most relevant/recent message IDs; do not request more than 10 in one call. Each body is capped to control token use. Do not dump all bodies into the final response unless explicitly asked.",
      inputSchema: z.object({
        messageIds: messageIdsSchema,
      }),
      execute: async ({ messageIds }) => {
        // Full email bodies are expensive context. Read a bounded batch and
        // cap each body while preserving headers and message metadata.
        const MAX_EMAILS_PER_READ = 10;
        const MAX_BODY_CHARS = 6000;
        const selectedIds = messageIds.slice(0, MAX_EMAILS_PER_READ);
        const emails = await Promise.all(
          selectedIds.map(async (id) => {
            const email = await gmailService.getFullMessageForUser(userId, id);
            const body = typeof email.body === "string" ? email.body : "";
            return {
              ...email,
              body: body.length > MAX_BODY_CHARS
                ? `${body.slice(0, MAX_BODY_CHARS)}\\n\\n[Email body truncated to control context size.]`
                : body,
            };
          }),
        );
        return {
          count: emails.length,
          requestedCount: messageIds.length,
          omittedCount: Math.max(0, messageIds.length - emails.length),
          emails,
        };
      },
    }),

    get_email: tool({
      description:
        "Get one full email by message ID, including headers, body, thread ID, labels, and attachment metadata.",
      inputSchema: z.object({ messageId: z.string().min(1) }),
      execute: async ({ messageId }) =>
        gmailService.getFullMessageForUser(userId, messageId),
    }),

    get_thread: tool({
      description:
        "Read an entire Gmail conversation/thread. Use when the user says thread, conversation, reply chain, previous message, or asks for context around an email.",
      inputSchema: z.object({
        threadId: z.string().min(1),
        limit: z.number().int().min(1).max(50).default(20),
      }),
      execute: async ({ threadId, limit }) =>
        advancedGmailService.getThreadForUser(userId, threadId, limit),
    }),

    get_current_time: tool({
      description:
        "Resolve the current date/time for relative scheduling language such as tomorrow, tonight, next Friday, or in two hours. Use an IANA timezone when the user provides one. If no timezone is provided, use UTC unless the account has a known timezone.",
      inputSchema: z.object({
        timezone: z.string().min(1).max(100).default("UTC"),
      }),
      execute: async ({ timezone }) => {
        const now = new Date();
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: timezone,
          dateStyle: "full",
          timeStyle: "long",
        }).format(now);
        return { timezone, iso: now.toISOString(), local: formatted };
      },
    }),

    list_drafts: tool({
      description: "List the user's Gmail drafts when they ask about drafts or want to edit/delete/send a saved draft.",
      inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
      execute: async ({ limit }) => advancedGmailService.listDraftsForUser(userId, limit),
    }),

    delete_draft: tool({
      description: "Delete a Gmail draft. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ draftId: z.string().min(1) }),
      execute: async ({ draftId }) => {
        const result = await advancedGmailService.deleteDraftForUser(userId, draftId);
        return { ...result, ...actionUi("Done. Deleted the draft.", "Draft deleted", "I deleted the saved Gmail draft.") };
      },
    }),

    archive_emails: tool({
      description: "Archive messages by removing them from the inbox. Use only for explicitly selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], ["INBOX"]);
        return { archived: result.modified, messageIds, ...actionUi(`Done. Archived ${result.modified} email${result.modified === 1 ? "" : "s"}.`, "Archived", `I archived ${result.modified} email${result.modified === 1 ? "" : "s"}.`) };
      },
    }),

    mark_read: tool({
      description: "Mark messages as read.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], ["UNREAD"]);
        return { ...result, ...actionUi(`Done. Marked ${result.modified} email${result.modified === 1 ? "" : "s"} as read.`, "Marked as read", `I marked ${result.modified} email${result.modified === 1 ? "" : "s"} as read.`) };
      },
    }),

    mark_unread: tool({
      description: "Mark messages as unread.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, ["UNREAD"], []);
        return { ...result, ...actionUi(`Done. Marked ${result.modified} email${result.modified === 1 ? "" : "s"} as unread.`, "Marked as unread", `I marked ${result.modified} email${result.modified === 1 ? "" : "s"} as unread.`) };
      },
    }),

    star_emails: tool({
      description: "Star selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, ["STARRED"], []);
        return { ...result, ...actionUi(`Done. Starred ${result.modified} email${result.modified === 1 ? "" : "s"}.`, "Starred", `I starred ${result.modified} email${result.modified === 1 ? "" : "s"}.`) };
      },
    }),

    unstar_emails: tool({
      description: "Remove the star from selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], ["STARRED"]);
        return { ...result, ...actionUi(`Done. Removed the star from ${result.modified} email${result.modified === 1 ? "" : "s"}.`, "Unstarred", `I removed the star from ${result.modified} email${result.modified === 1 ? "" : "s"}.`) };
      },
    }),

    trash_emails: tool({
      description: "Move selected messages to Gmail Trash. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await advancedGmailService.trashMessagesForUser(userId, messageIds);
        return { ...result, ...actionUi(`Done. Moved ${result.trashed} email${result.trashed === 1 ? "" : "s"} to Trash.`, "Moved to Trash", `I moved ${result.trashed} email${result.trashed === 1 ? "" : "s"} to Trash.`) };
      },
    }),

    restore_from_trash: tool({
      description: "Restore selected messages from Gmail Trash. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await advancedGmailService.untrashMessagesForUser(userId, messageIds);
        return { ...result, ...actionUi(`Done. Restored ${result.restored} email${result.restored === 1 ? "" : "s"}.`, "Restored", `I restored ${result.restored} email${result.restored === 1 ? "" : "s"} from Trash.`) };
      },
    }),

    list_labels: tool({
      description: "List Gmail labels available to the user.",
      inputSchema: z.object({}),
      execute: async () => advancedGmailService.listLabelsForUser(userId),
    }),

    label_emails: tool({
      description: "Apply an existing Gmail label to selected messages.",
      inputSchema: z.object({
        messageIds: messageIdsSchema,
        labelName: z.string().min(1).max(225),
      }),
      execute: async ({ messageIds, labelName }) => {
        const { labelId, labelName: resolved } = await gmailService.ensureLabelForUser(userId, labelName);
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [labelId], []);
        return { label: resolved, modified: result.modified, messageIds, ...actionUi(`Done. Added the ${resolved} label to ${result.modified} email${result.modified === 1 ? "" : "s"}.`, resolved, `I applied the ${resolved} label to ${result.modified} email${result.modified === 1 ? "" : "s"}.`) };
      },
    }),

    remove_label_from_emails: tool({
      description: "Remove an existing Gmail label from selected messages.",
      inputSchema: z.object({
        messageIds: messageIdsSchema,
        labelName: z.string().min(1).max(225),
      }),
      execute: async ({ messageIds, labelName }) => {
        const { labelId, labelName: resolved } = await gmailService.ensureLabelForUser(userId, labelName);
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], [labelId]);
        return { label: resolved, modified: result.modified, messageIds, ...actionUi(`Done. Removed the ${resolved} label from ${result.modified} email${result.modified === 1 ? "" : "s"}.`, resolved, `I removed the ${resolved} label from ${result.modified} email${result.modified === 1 ? "" : "s"}.`) };
      },
    }),

    get_attachments: tool({
      description:
        "List attachment metadata for an email. Use when the user asks whether an email has attachments or what files were attached.",
      inputSchema: z.object({ messageId: z.string().min(1) }),
      execute: async ({ messageId }) => advancedGmailService.getAttachmentsForMessage(userId, messageId),
    }),

    mark_not_important: tool({
      description: "Remove the Important marker from selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await advancedGmailService.markNotImportantForUser(userId, messageIds);
        return { ...result, ...actionUi("Done. Removed the Important marker.", "Not important", `I removed the Important marker from ${result.markedNotImportant} email${result.markedNotImportant === 1 ? "" : "s"}.`) };
      },
    }),

    mark_spam: tool({
      description: "Mark selected messages as spam. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await advancedGmailService.markSpamForUser(userId, messageIds);
        return { ...result, ...actionUi("Done. Marked the selected email as spam.", "Spam", `I marked ${result.markedSpam} email${result.markedSpam === 1 ? "" : "s"} as spam.`) };
      },
    }),

    restore_from_spam: tool({
      description: "Restore selected messages from spam. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await advancedGmailService.unmarkSpamForUser(userId, messageIds);
        return { ...result, ...actionUi("Done. Restored the selected email from spam.", "Restored from spam", `I restored ${result.restoredFromSpam} email${result.restoredFromSpam === 1 ? "" : "s"} from spam.`) };
      },
    }),

    mute_threads: tool({
      description: "Mute selected Gmail conversations.",
      inputSchema: z.object({ threadIds: messageIdsSchema }),
      execute: async ({ threadIds }) => {
        const result = await advancedGmailService.muteThreadsForUser(userId, threadIds);
        return { ...result, ...actionUi("Done. Muted the conversation.", "Conversation muted", `I muted ${result.muted} conversation${result.muted === 1 ? "" : "s"}.`) };
      },
    }),

    unmute_threads: tool({
      description: "Unmute selected Gmail conversations.",
      inputSchema: z.object({ threadIds: messageIdsSchema }),
      execute: async ({ threadIds }) => {
        const result = await advancedGmailService.unmuteThreadsForUser(userId, threadIds);
        return { ...result, ...actionUi("Done. Unmuted the conversation.", "Conversation unmuted", `I unmuted ${result.unmuted} conversation${result.unmuted === 1 ? "" : "s"}.`) };
      },
    }),

    find_unsubscribe_options: tool({
      description:
        "Find whether a message or sender has a usable unsubscribe option. Use before unsubscribe when the target is not already identified.",
      inputSchema: z.object({
        messageId: z.string().optional(),
        sender: z.string().optional(),
      }).refine((v) => Boolean(v.messageId || v.sender), "messageId or sender is required"),
      execute: async ({ messageId, sender }) => {
        if (messageId) {
          const email = await getEmailByMessageId(userId, messageId);
          return { sender: email?.sender || "", messageId, unsubscribeLink: email?.unsubscribe_link || null };
        }
        const emails = await getEmailsForUser(userId);
        const matches = emails
          .filter((email) => email.sender.toLowerCase().includes(String(sender).toLowerCase()))
          .filter((email) => Boolean(email.unsubscribe_link))
          .slice(0, 10);
        return { sender, options: matches.map((email) => ({ messageId: email.message_id, sender: email.sender, subject: email.subject, unsubscribeLink: email.unsubscribe_link })) };
      },
    }),
  };
}
