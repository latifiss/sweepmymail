import {
  DbCategory,
  DbEmail,
  getEmailsForUser,
  listCategoriesForUser,
  updateCategoryEmailCount,
} from "../repositories/dataRepository";
import gmailService from "./gmailService";

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "you",
  "are",
  "was",
  "were",
  "have",
  "has",
  "had",
  "into",
  "about",
  "then",
  "than",
  "they",
  "them",
  "their",
  "will",
  "can",
  "could",
  "would",
  "should",
  "what",
  "when",
  "where",
  "who",
  "why",
  "how",
  "all",
  "any",
  "not",
  "only",
  "but",
  "our",
  "out",
  "new",
]);

export function extractKeywords(description: string): string[] {
  return Array.from(
    new Set(
      description
        .toLowerCase()
        .split(/[^a-z0-9@._-]+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    )
  ).slice(0, 30);
}

function emailMatchesCategory(email: DbEmail, category: DbCategory): boolean {
  const haystack = `${email.sender} ${email.subject} ${email.snippet}`.toLowerCase();
  return (category.keywords || []).some((kw) => haystack.includes(kw.toLowerCase()));
}

export async function applyCategoryToEmails(userId: string, category: DbCategory): Promise<number> {
  const emails = await getEmailsForUser(userId);
  const matched = emails.filter((email) => emailMatchesCategory(email, category));
  const ids = matched.map((m) => m.message_id).filter(Boolean);

  const { labelId } = await gmailService.ensureLabelForUser(userId, category.label);
  if (ids.length > 0) {
    await gmailService.modifyMessagesForUser(userId, ids, [labelId], []);
  }

  await updateCategoryEmailCount(userId, category.id, ids.length);
  return ids.length;
}

export async function applyAllCategoriesForUser(userId: string): Promise<void> {
  const categories = await listCategoriesForUser(userId);
  for (const category of categories) {
    try {
      await applyCategoryToEmails(userId, category);
    } catch (error) {
      console.error(`Failed applying category ${category.id} for user ${userId}:`, error);
    }
  }
}
