import { tool } from "ai";
import { z } from "zod";
import gmailService from "../services/gmailService";
import { getEmailsForUser, getEmailByMessageId } from "../repositories/dataRepository";
import advancedGmailService from "../services/advancedGmailService";

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

export function createAdvancedAgentTools(userId: string, userEmail: string) {
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
        const messages = await gmailService.searchMessagesForUser(
          userId,
          query,
          limit,
          includeSpamTrash,
        );
        return { count: messages.length, emails: formatEmailList(messages) };
      },
    }),

    read_emails: tool({
      description:
        "Read several full emails at once. Use this for summaries, comparisons, extracting action items, or any request involving multiple emails. Do not dump all bodies into the final response unless explicitly asked.",
      inputSchema: z.object({
        messageIds: messageIdsSchema,
      }),
      execute: async ({ messageIds }) => {
        const emails = await Promise.all(
          messageIds.map((id) => gmailService.getFullMessageForUser(userId, id)),
        );
        return { count: emails.length, emails };
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
        gmailService.getThreadForUser(userId, threadId, limit),
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
      execute: async ({ limit }) => gmailService.listDraftsForUser(userId, limit),
    }),

    delete_draft: tool({
      description: "Delete a Gmail draft. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ draftId: z.string().min(1) }),
      execute: async ({ draftId }) => gmailService.deleteDraftForUser(userId, draftId),
    }),

    archive_emails: tool({
      description: "Archive messages by removing them from the inbox. Use only for explicitly selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], ["INBOX"]);
        return { archived: result.modified, messageIds };
      },
    }),

    mark_read: tool({
      description: "Mark messages as read.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.modifyMessagesForUser(userId, messageIds, [], ["UNREAD"]),
    }),

    mark_unread: tool({
      description: "Mark messages as unread.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.modifyMessagesForUser(userId, messageIds, ["UNREAD"], []),
    }),

    star_emails: tool({
      description: "Star selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.modifyMessagesForUser(userId, messageIds, ["STARRED"], []),
    }),

    unstar_emails: tool({
      description: "Remove the star from selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.modifyMessagesForUser(userId, messageIds, [], ["STARRED"]),
    }),

    trash_emails: tool({
      description: "Move selected messages to Gmail Trash. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.trashMessagesForUser(userId, messageIds),
    }),

    restore_from_trash: tool({
      description: "Restore selected messages from Gmail Trash. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) =>
        gmailService.untrashMessagesForUser(userId, messageIds),
    }),

    list_labels: tool({
      description: "List Gmail labels available to the user.",
      inputSchema: z.object({}),
      execute: async () => gmailService.listLabelsForUser(userId),
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
        return { label: resolved, modified: result.modified, messageIds };
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
        return { label: resolved, modified: result.modified, messageIds };
      },
    }),

    get_attachments: tool({
      description:
        "List attachment metadata for an email. Use when the user asks whether an email has attachments or what files were attached.",
      inputSchema: z.object({ messageId: z.string().min(1) }),
      execute: async ({ messageId }) => gmailService.getAttachmentsForMessage(userId, messageId),
    }),

    mark_not_important: tool({
      description: "Remove the Important marker from selected messages.",
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => advancedGmailService.markNotImportantForUser(userId, messageIds),
    }),

    mark_spam: tool({
      description: "Mark selected messages as spam. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => advancedGmailService.markSpamForUser(userId, messageIds),
    }),

    restore_from_spam: tool({
      description: "Restore selected messages from spam. ALWAYS requires explicit approval.",
      needsApproval: true,
      inputSchema: z.object({ messageIds: messageIdsSchema }),
      execute: async ({ messageIds }) => advancedGmailService.unmarkSpamForUser(userId, messageIds),
    }),

    mute_threads: tool({
      description: "Mute selected Gmail conversations.",
      inputSchema: z.object({ threadIds: messageIdsSchema }),
      execute: async ({ threadIds }) => advancedGmailService.muteThreadsForUser(userId, threadIds),
    }),

    unmute_threads: tool({
      description: "Unmute selected Gmail conversations.",
      inputSchema: z.object({ threadIds: messageIdsSchema }),
      execute: async ({ threadIds }) => advancedGmailService.unmuteThreadsForUser(userId, threadIds),
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
