export interface EmailSearchIntent {
  query: string;
  limit: number;
  sender?: string;
  unread?: boolean;
  sourceText: string;
}

/**
 * Deterministic guardrail for common inbox retrieval requests.
 * The model can still handle complex language, but basic filters must not
 * depend on the model remembering to translate them into Gmail syntax.
 */
export function parseEmailSearchIntent(input: string, now = new Date()): EmailSearchIntent | null {
  const text = input.trim();
  if (!text || !/\b(show|find|get|list|give|fetch|display|search|what are|what's)\b/i.test(text)) return null;
  if (!/\b(email|emails|message|messages|inbox)\b/i.test(text)) return null;

  const limitMatch = text.match(/\b(?:last|latest|recent|newest|first|top)\s+(\d{1,3})\b/i)
    || text.match(/\b(\d{1,3})\s+(?:emails?|messages?)\b/i);
  const limit = Math.min(100, Math.max(1, Number(limitMatch?.[1] || 10)));

  const unread = /\b(unread|unread messages?)\b/i.test(text);
  const senderMatch = text.match(/\bfrom\s+(.+?)(?=\s+(?:this week|last week|today|yesterday|this month|last month|in the last|during|between|after|before|with|that|which)\b|[?.!,]|$)/i);
  let sender = senderMatch?.[1]?.trim().replace(/^(?:the\s+)?/i, "");
  if (sender) {
    sender = sender.replace(/\b(?:emails?|messages?)\b/gi, "").trim();
    if (/^(me|myself|my account)$/i.test(sender)) sender = undefined;
  }

  const parts: string[] = [];
  if (sender) {
    const normalized = sender.toLowerCase().replace(/^@/, "");
    // Gmail's from: operator searches sender addresses and display names.
    parts.push(`from:${normalized}`);
  }
  if (unread) parts.push("is:unread");

  const startOfWeek = new Date(now);
  const day = (startOfWeek.getUTCDay() + 6) % 7;
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - day);
  startOfWeek.setUTCHours(0, 0, 0, 0);
  if (/\bthis week\b/i.test(text)) {
    const yyyy = startOfWeek.getUTCFullYear();
    const mm = String(startOfWeek.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(startOfWeek.getUTCDate()).padStart(2, "0");
    parts.push(`after:${yyyy}/${mm}/${dd}`);
  } else if (/\btoday\b/i.test(text)) {
    parts.push("newer_than:1d");
  } else if (/\byesterday\b/i.test(text)) {
    parts.push("newer_than:2d older_than:1d");
  } else if (/\bthis month\b/i.test(text)) {
    parts.push("newer_than:30d");
  }

  // Only take over straightforward retrieval requests with a useful filter.
  // Sender-only and unread/date requests are all valid Gmail-native searches.
  if (!sender && !unread && !/\b(this week|today|yesterday|this month)\b/i.test(text)) return null;
  return { query: parts.join(" "), limit, sender, unread, sourceText: text };
}
