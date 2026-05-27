import { Request, Response } from "express";
import gmailService from "../services/gmailService";
import { unsubscribeFromLink } from "../services/unsubscribeService";
import {
  getEmailByMessageId,
  getEmailsBySenderLike,
  markEmailsArchived,
  upsertSubscription,
} from "../repositories/dataRepository";
import { applyAllCategoriesForUser } from "../services/categoryService";
import { applyAllPriorityKeywordsForUser } from "../services/priorityService";
import { enforceBatchSize, getSubscriptionContext, TierLimitError } from "../services/subscriptionService";

function toApiError(err: any) {
  const details = err?.response?.data || err?.errors || err?.stack || undefined;
  const rawMessage = err?.message || String(err);
  const detailsText = typeof details === "string" ? details : JSON.stringify(details || {});
  const combined = `${rawMessage} ${detailsText}`.toLowerCase();

  if (combined.includes("insufficientpermissions") || combined.includes("insufficient permissions")) {
    return {
      status: 403,
      error:
        "Gmail permission missing. Please sign in with Google again to grant mail.google.com access, then retry.",
      details,
    };
  }

  if (combined.includes("invalid label name")) {
    return {
      status: 400,
      error: "Invalid Gmail label name generated for sender.",
      details,
    };
  }

  return {
    status: 500,
    error: rawMessage,
    details,
  };
}

/**
 * GET /emails
 * Fetch latest from Gmail and return (also saved)
 */
export const fetchAndGetEmails = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const { limits } = await getSubscriptionContext(userId);
    const emails = await gmailService.fetchGmailMessagesAndSave(userId, true, limits.maxFetchPerSync);
    await applyAllCategoriesForUser(userId);
    await applyAllPriorityKeywordsForUser(userId);
    res.json({ ok: true, count: emails.length, emails });
  } catch (err: any) {
    if (err instanceof TierLimitError) {
      return res.status(err.status).json({ ok: false, error: err.message });
    }
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

/**
 * GET /emails/grouped
 * Return grouped summary (sender/domain counts + examples)
 */
export const getGroupedEmails = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const grouped = await gmailService.getGroupedEmails(userId, 200);
    res.json({ ok: true, groups: grouped });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

/**
 * POST /emails/unsubscribe
 * Body: { messageId?, unsubscribeLink?, sender? }
 * If messageId provided, we use stored unsubscribeLink if any; else use provided link.
 * After successful unsubscribe, we record in Subscription collection.
 */
export const unsubscribe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { messageId, unsubscribeLink, sender } = req.body as { messageId?: string; unsubscribeLink?: string; sender?: string };

  try {
    let link = unsubscribeLink;
    if (!link && messageId) {
      const msg = await getEmailByMessageId((req as any).user.id, messageId);
      link = msg?.unsubscribe_link || undefined;
    }

    if (!link && sender) {
      const msgs = await getEmailsBySenderLike(userId, sender, 50);
      const withUnsub = msgs.find((m) => !!m.unsubscribe_link);
      link = withUnsub?.unsubscribe_link || undefined;
    }

    if (!link && !sender) {
      return res.status(400).json({ ok: false, error: "Provide unsubscribeLink, messageId or sender" });
    }
    if (!link) {
      return res.status(404).json({ ok: false, error: "No unsubscribe link found for this sender" });
    }

    const user = (req as any).user;
    const fromEmail = user.email || undefined;

    const result = await unsubscribeFromLink(link || "", fromEmail || "");

    if (sender) {
      await upsertSubscription({
        user_id: (req as any).user.id,
        sender,
        unsubscribed: result.success,
        unsubscribed_at: result.success ? new Date().toISOString() : null,
      });
    }

    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

export const rollup = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { sender } = req.body as { sender: string };

  if (!sender) return res.status(400).json({ ok: false, error: "sender required" });

  try {
    await upsertSubscription({
      user_id: userId,
      sender,
      rolled_up: true,
      rolled_up_at: new Date().toISOString(),
    });

    const { labelId, labelName } = await gmailService.ensureLabelForUser(userId, sender);

    const ids = await gmailService.getMessageIdsForSender(userId, sender);
    if (ids.length) {
      await gmailService.modifyMessagesForUser(userId, ids, [labelId], ["INBOX"]);
      await markEmailsArchived((req as any).user.id, ids);
    }

    res.json({ ok: true, rolledUp: true, labelName, labeledCount: ids.length, archivedCount: ids.length });
  } catch (err: any) {
    const parsed = toApiError(err);
    res.status(parsed.status).json({ ok: false, error: parsed.error, details: parsed.details });
  }
};

export const batchDelete = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { messageIds } = req.body as { messageIds: string[] };
  if (!messageIds || !Array.isArray(messageIds) || !messageIds.length) {
    return res.status(400).json({ ok: false, error: "messageIds array required" });
  }

  try {
    const { subscription, limits } = await getSubscriptionContext(userId);
    enforceBatchSize(messageIds.length, limits.maxDeleteBatch, subscription.tier);
    const result = await gmailService.batchDeleteMessagesForUser(userId, messageIds);
    res.json({ ok: true, result });
  } catch (err: any) {
    if (err instanceof TierLimitError) {
      return res.status(err.status).json({ ok: false, error: err.message });
    }
    const parsed = toApiError(err);
    res.status(parsed.status).json({ ok: false, error: parsed.error, details: parsed.details });
  }
};

export const getBySender = async (req: Request, res: Response) => {
  const sender = req.query.sender as string;
  if (!sender) return res.status(400).json({ ok: false, error: "sender query required" });

  const userId = (req as any).user.id;
  try {
    const msgs = await getEmailsBySenderLike((req as any).user.id, sender, 200);
    res.json({ ok: true, count: msgs.length, messages: msgs });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};
