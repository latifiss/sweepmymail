// src/controllers/emailController.ts
import { Request, Response } from "express";
import gmailService from "../services/gmailService.js";
import { unsubscribeFromLink } from "../services/unsubscribeService";
import Email from "../models/email";
import Subscription from "../models/subscription";

/**
 * GET /emails
 * Fetch latest from Gmail and return (also saved)
 */
export const fetchAndGetEmails = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const emails = await gmailService.fetchGmailMessagesAndSave(userId, true);
    res.json({ ok: true, count: emails.length, emails });
  } catch (err: any) {
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
      const msg = await Email.findOne({ messageId, user: (req as any).user.id });
      link = msg?.unsubscribeLink;
    }

    if (!link && !sender) {
      return res.status(400).json({ ok: false, error: "Provide unsubscribeLink, messageId or sender" });
    }

    // determine user email for mail-from (we store user as JWT payload id only; fetch user from Subscription/User collection if needed)
    // here we retrieve the saved user email for 'from' when sending mailto
    const user = (req as any).user;
    const fromEmail = user.email || undefined;

    // try unsubscribe
    const result = await unsubscribeFromLink(link || "", fromEmail || "");

    // store subscription record for sender if provided
    if (sender) {
      await Subscription.updateOne(
        { user: (req as any).user.id, sender },
        { $set: { unsubscribed: result.success, unsubscribedAt: result.success ? new Date() : undefined } },
        { upsert: true }
      );
    }

    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

/**
 * POST /emails/rollup
 * Body: { sender }  -> mark sender as rolled up: set subscription rule, archive existing messages for that sender
 *
 * This endpoint:
 *  - stores a Subscription with a `rolledUp: true`
 *  - finds message ids for the sender and archives them (removes INBOX label)
 */
export const rollup = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { sender } = req.body as { sender: string };

  if (!sender) return res.status(400).json({ ok: false, error: "sender required" });

  try {
    // upsert subscription rule
    await Subscription.updateOne(
      { user: userId, sender },
      { $set: { rolledUp: true, rolledUpAt: new Date() } },
      { upsert: true }
    );

    // find messages for sender, archive (remove INBOX label). We'll search via gmailService.
    const ids = await gmailService.getMessageIdsForSender(userId, sender);
    if (ids.length) {
      // Gmail label for INBOX is "INBOX" to remove
      await gmailService.modifyMessagesForUser(userId, ids, [], ["INBOX"]);
      // optionally update our DB record to reflect they're archived (we can remove or flag)
      await Email.updateMany({ messageId: { $in: ids }, user: (req as any).user.id }, { $set: { archived: true } });
    }

    res.json({ ok: true, rolledUp: true, archivedCount: ids.length });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

/**
 * POST /emails/delete
 * Body: { messageIds: string[] }
 */
export const batchDelete = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { messageIds } = req.body as { messageIds: string[] };
  if (!messageIds || !Array.isArray(messageIds) || !messageIds.length) {
    return res.status(400).json({ ok: false, error: "messageIds array required" });
  }

  try {
    const result = await gmailService.batchDeleteMessagesForUser(userId, messageIds);
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};

/**
 * GET /emails/by-sender?sender=Spotify
 * Get example messages for a given sender (first 50)
 */
export const getBySender = async (req: Request, res: Response) => {
  const sender = req.query.sender as string;
  if (!sender) return res.status(400).json({ ok: false, error: "sender query required" });

  const userId = (req as any).user.id;
  try {
    const msgs = await Email.find({ user: (req as any).user.id, sender: { $regex: sender, $options: "i" } })
      .sort({ date: -1 })
      .limit(200)
      .lean();
    res.json({ ok: true, count: msgs.length, messages: msgs });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message || err });
  }
};
