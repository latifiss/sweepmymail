import { env } from "../config/env";
import {
  DbEmail,
  getEmailsForUserInRange,
  getLatestDailySummary,
  listUsers,
  replaceDailySummaryForUser,
} from "../repositories/dataRepository";

type SummaryCitation = {
  id: number;
  emailId: string;
  subject: string;
  sender: string;
  preview: string;
  link: string;
};

type DailySummaryPayload = {
  text: string;
  citations: SummaryCitation[];
  emailsReceived: number;
  priorityItems: number;
  generatedAt: string;
};

function buildCitations(emails: DbEmail[]): SummaryCitation[] {
  return emails.slice(0, 12).map((email, idx) => ({
    id: idx + 1,
    emailId: email.message_id,
    subject: email.subject || "No Subject",
    sender: email.sender || "Unknown Sender",
    preview: email.snippet || "",
    link: `https://mail.google.com/mail/u/0/#search/rfc822msgid:${encodeURIComponent(email.message_id)}`,
  }));
}

async function summarizeWithDeepSeek(citations: SummaryCitation[]): Promise<{ text: string; priorityItems: number }> {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  const promptData = citations
    .map((c) => `[${c.id}] Subject: ${c.subject}; Sender: ${c.sender}; Preview: ${c.preview}`)
    .join("\n");

  const systemPrompt =
    "You are an assistant that writes concise daily email summaries. Use citation markers exactly like [1], [2], etc, only for provided citation ids. Output JSON only.";

  const userPrompt = `
Create a concise summary (120-220 words) of the user's last 24h emails.
Requirements:
- Include only facts inferable from inputs.
- Use citation markers like [1] inline.
- Return strict JSON with keys: "text" (string), "priorityItems" (number).

Email inputs:
${promptData}
`;

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`DeepSeek request failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty content");

  const parsed = JSON.parse(content) as { text?: string; priorityItems?: number };
  if (!parsed.text) throw new Error("DeepSeek summary payload missing text");

  return {
    text: parsed.text,
    priorityItems: Number.isFinite(parsed.priorityItems) ? Number(parsed.priorityItems) : 0,
  };
}

function fallbackSummary(citations: SummaryCitation[]): { text: string; priorityItems: number } {
  const top = citations.slice(0, 3);
  const text =
    top.length === 0
      ? "No emails were found in the last 24 hours."
      : `You received ${citations.length} emails in the last 24 hours[1]. Key recent messages include ${top
          .map((c) => `${c.subject}[${c.id}]`)
          .join(", ")}.`;
  return { text, priorityItems: Math.min(3, citations.length) };
}

export async function generateDailySummaryForUser(userId: string): Promise<DailySummaryPayload> {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const until = now.toISOString();

  const emails = await getEmailsForUserInRange(userId, since, until);
  const citations = buildCitations(emails);

  let summarized: { text: string; priorityItems: number };
  try {
    summarized = await summarizeWithDeepSeek(citations);
  } catch (error) {
    console.warn("DeepSeek summary failed, using fallback:", error);
    summarized = fallbackSummary(citations);
  }

  const generatedAt = new Date().toISOString();
  await replaceDailySummaryForUser({
    user_id: userId,
    summary_text: summarized.text,
    citations,
    emails_received: emails.length,
    priority_items: summarized.priorityItems,
    generated_at: generatedAt,
  });

  return {
    text: summarized.text,
    citations,
    emailsReceived: emails.length,
    priorityItems: summarized.priorityItems,
    generatedAt,
  };
}

export async function getDailySummaryForUser(userId: string): Promise<DailySummaryPayload | null> {
  const existing = await getLatestDailySummary(userId);
  if (!existing) return null;
  return {
    text: existing.summary_text,
    citations: existing.citations || [],
    emailsReceived: existing.emails_received || 0,
    priorityItems: existing.priority_items || 0,
    generatedAt: existing.generated_at,
  };
}

let lastRunDayKey = "";

function getUtcDayKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

export async function runDailySummarySchedulerTick() {
  const now = new Date();
  const dayKey = getUtcDayKey(now);
  if (now.getUTCHours() !== 6 || now.getUTCMinutes() !== 0) return;
  if (lastRunDayKey === dayKey) return;

  lastRunDayKey = dayKey;
  const users = await listUsers();
  for (const user of users) {
    try {
      await generateDailySummaryForUser(user.id);
    } catch (error) {
      console.error(`Daily summary generation failed for user ${user.id}:`, error);
    }
  }
}

export function startDailySummaryScheduler() {
  setInterval(() => {
    runDailySummarySchedulerTick().catch((error) =>
      console.error("Daily summary scheduler tick failed:", error)
    );
  }, 60 * 1000);
}
