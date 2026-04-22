import {
  DbEmail,
  DbPriorityKeyword,
  getEmailsForUser,
  listPriorityKeywordsForUser,
  updatePriorityKeywordEmailCount,
} from "../repositories/dataRepository";
import gmailService from "./gmailService";

function emailMatchesKeyword(email: DbEmail, word: string): boolean {
  const haystack = `${email.sender} ${email.subject} ${email.snippet}`.toLowerCase();
  return haystack.includes(word.toLowerCase());
}

export async function applyPriorityKeywordToEmails(
  userId: string,
  keyword: DbPriorityKeyword
): Promise<number> {
  const emails = await getEmailsForUser(userId);
  const matched = emails.filter((email) => emailMatchesKeyword(email, keyword.word));
  const ids = matched.map((m) => m.message_id).filter(Boolean);

  if (ids.length > 0) {
    // IMPORTANT is a Gmail system label used for high-priority marker.
    await gmailService.modifyMessagesForUser(userId, ids, ["IMPORTANT"], []);
  }

  await updatePriorityKeywordEmailCount(userId, keyword.id, ids.length);
  return ids.length;
}

export async function applyAllPriorityKeywordsForUser(userId: string): Promise<void> {
  const keywords = await listPriorityKeywordsForUser(userId);
  for (const keyword of keywords) {
    try {
      await applyPriorityKeywordToEmails(userId, keyword);
    } catch (error) {
      console.error(`Failed applying priority keyword ${keyword.id} for user ${userId}:`, error);
    }
  }
}
