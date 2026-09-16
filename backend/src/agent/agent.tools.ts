import { tool } from "ai";
import { z } from "zod";
import {
  createCategory,
  getEmailByMessageId,
  getEmailsForUser,
  getEmailsBySenderLike,
  listCategoriesForUser,
} from "../repositories/dataRepository";
import { applyCategoryToEmails, extractKeywords } from "../services/categoryService";
import gmailService from "../services/gmailService";
import { unsubscribeFromLink } from "../services/unsubscribeService";
import { env } from "../config/env";

function requireAgentConfiguration() {
  if (!env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");
}

function formatEmails(emails: any[], limit: number) {
  return emails.slice(0, limit).map((email) => ({
    messageId: email.message_id,
    sender: email.sender,
    subject: email.subject,
    snippet: typeof email.snippet === "string" ? email.snippet.slice(0, 180) : "",
    date: email.date,
    hasUnsubscribeLink: Boolean(email.unsubscribe_link),
  }));
}

export function createAgentTools(userId: string, userEmail: string) {
  return {
    get_recent_emails: tool({
      description: "Get the user's most recent inbox emails. Always use this tool whenever the user asks for latest, recent, newest, or current emails without specifying a search topic. Refresh from Gmail first so the results reflect the current inbox. Results include message IDs for follow-up actions.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).default(10),
      }),
      execute: async ({ limit }) => {
        requireAgentConfiguration();
        const emails = await gmailService.fetchGmailMessagesAndSave(userId, true, Math.max(limit, 20));
        const sorted = [...emails].sort((a, b) => {
          const aTime = new Date(a.date || 0).getTime();
          const bTime = new Date(b.date || 0).getTime();
          return bTime - aTime;
        });

        return {
          count: Math.min(sorted.length, limit),
          emails: formatEmails(sorted, limit),
        };
      },
    }),

    search_emails: tool({
      description: "Search the user's synchronized inbox by keywords across sender, subject, and email preview. Use this for topic, sender, or keyword searches and before bulk email actions when the user describes emails semantically. Results include message IDs for follow-up actions.",
      inputSchema: z.object({
        query: z.string().min(1).describe("Keywords or phrase to search for"),
        limit: z.number().int().min(1).max(100).default(50),
      }),
      execute: async ({ query, limit }) => {
        requireAgentConfiguration();
        const emails = await getEmailsForUser(userId);
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = emails.filter((email) => {
          const haystack = `${email.sender} ${email.subject} ${email.snippet}`.toLowerCase();
          return terms.every((term) => haystack.includes(term));
        });

        return {
          count: matches.length,
          emails: formatEmails(matches, limit),
        };
      },
    }),

    list_categories: tool({
      description: "List the user's existing inbox categories before creating a new one.",
      inputSchema: z.object({}),
      execute: async () => listCategoriesForUser(userId),
    }),

    create_category: tool({
      description: "Create a Gmail-backed category and automatically apply it to matching synchronized emails.",
      inputSchema: z.object({
        label: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
      }),
      execute: async ({ label, description }) => {
        const existing = await listCategoriesForUser(userId);
        if (existing.some((category) => category.label.toLowerCase() === label.toLowerCase())) {
          throw new Error(`Category '${label}' already exists`);
        }

        const keywords = extractKeywords(`${label} ${description}`);
        const category = await createCategory({
          user_id: userId,
          label: label.trim(),
          description: description.trim(),
          keywords,
          email_count: 0,
        });
        const count = await applyCategoryToEmails(userId, category);

        return {
          categoryId: category.id,
          label: category.label,
          matchedEmails: count,
        };
      },
    }),

    categorize_emails: tool({
      description: "Apply an existing Gmail category to specific email message IDs. Use search_emails first to identify the correct emails.",
      inputSchema: z.object({
        messageIds: z.array(z.string()).min(1).max(500),
        categoryLabel: z.string().min(1).max(100),
      }),
      execute: async ({ messageIds, categoryLabel }) => {
        const categories = await listCategoriesForUser(userId);
        const category = categories.find((item) => item.label.toLowerCase() === categoryLabel.toLowerCase());
        if (!category) throw new Error(`Category '${categoryLabel}' does not exist`);

        const { labelId } = await gmailService.ensureLabelForUser(userId, category.label);
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [labelId], []);
        return { category: category.label, categorized: result.modified };
      },
    }),

    archive_emails: tool({
      description: "Archive specific emails by removing them from the Gmail inbox. Use search_emails first.",
      inputSchema: z.object({
        messageIds: z.array(z.string()).min(1).max(500),
      }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, [], ["INBOX"]);
        return { archived: result.modified };
      },
    }),

    mark_important: tool({
      description: "Mark specific emails as important in Gmail. Use search_emails first.",
      inputSchema: z.object({
        messageIds: z.array(z.string()).min(1).max(500),
      }),
      execute: async ({ messageIds }) => {
        const result = await gmailService.modifyMessagesForUser(userId, messageIds, ["IMPORTANT"], []);
        return { markedImportant: result.modified };
      },
    }),

    delete_emails: tool({
      description: "Permanently delete specific Gmail messages. This is destructive and always requires explicit user approval.",
      needsApproval: true,
      inputSchema: z.object({
        messageIds: z.array(z.string()).min(1).max(100),
      }),
      execute: async ({ messageIds }) => gmailService.batchDeleteMessagesForUser(userId, messageIds),
    }),

    unsubscribe: tool({
      description: "Unsubscribe from a sender using a verified unsubscribe link stored on the user's emails. This is an external side effect and requires explicit user approval.",
      needsApproval: true,
      inputSchema: z.object({
        messageId: z.string().optional(),
        sender: z.string().optional(),
      }).refine((input) => Boolean(input.messageId || input.sender), {
        message: "messageId or sender is required",
      }),
      execute: async ({ messageId, sender }) => {
        let link: string | null = null;
        let resolvedSender = sender || "";

        if (messageId) {
          const email = await getEmailByMessageId(userId, messageId);
          link = email?.unsubscribe_link || null;
          resolvedSender = resolvedSender || email?.sender || "";
        }

        if (!link && sender) {
          const emails = await getEmailsBySenderLike(userId, sender, 50);
          const email = emails.find((item) => Boolean(item.unsubscribe_link));
          link = email?.unsubscribe_link || null;
          resolvedSender = email?.sender || sender;
        }

        if (!link) throw new Error("No unsubscribe link was found for this sender");

        const result = await unsubscribeFromLink(link, userEmail);
        return {
          sender: resolvedSender,
          success: result.success,
          message: result.message,
        };
      },
    }),
  };
}
