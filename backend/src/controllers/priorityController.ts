import { Request, Response } from "express";
import {
  createPriorityKeyword,
  deletePriorityKeywordForUser,
  listPriorityKeywordsForUser,
} from "../repositories/dataRepository";
import { applyPriorityKeywordToEmails } from "../services/priorityService";
import { enforceMaxCount, getSubscriptionContext, TierLimitError } from "../services/subscriptionService";

export const getPriorityKeywords = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  try {
    const keywords = await listPriorityKeywordsForUser(userId);
    return res.json({ ok: true, keywords });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const createPriorityKeywordAndApply = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const rawWord = (req.body?.word || "") as string;
  const word = rawWord.trim().toLowerCase();

  if (!word) {
    return res.status(400).json({ ok: false, error: "Priority keyword is required" });
  }

  try {
    const existingKeywords = await listPriorityKeywordsForUser(userId);
    const { subscription, limits } = await getSubscriptionContext(userId);
    enforceMaxCount(existingKeywords.length, limits.maxPriorityKeywords, "Priority keyword", subscription.tier);

    const keyword = await createPriorityKeyword({
      user_id: userId,
      word,
      email_count: 0,
    });
    const count = await applyPriorityKeywordToEmails(userId, keyword);
    return res.json({ ok: true, keyword: { ...keyword, email_count: count } });
  } catch (error: any) {
    if (error instanceof TierLimitError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    console.error("createPriorityKeywordAndApply failed:", {
      message: error?.message,
      stack: error?.stack,
      userId,
      word,
    });
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const deletePriorityKeyword = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const keywordId = req.params.id;
  if (!keywordId) return res.status(400).json({ ok: false, error: "Keyword id is required" });

  try {
    await deletePriorityKeywordForUser(userId, keywordId);
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
