import { Request, Response } from "express";
import {
  createCategory,
  deleteCategoryForUser,
  listCategoriesForUser,
} from "../repositories/dataRepository";
import { applyCategoryToEmails, extractKeywords } from "../services/categoryService";
import { enforceMaxCount, getSubscriptionContext, TierLimitError } from "../services/subscriptionService";

export const getCategories = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  try {
    const categories = await listCategoriesForUser(userId);
    return res.json({ ok: true, categories });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const createCategoryAndApply = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const { label, description } = req.body as { label?: string; description?: string };

  if (!label || !label.trim()) {
    return res.status(400).json({ ok: false, error: "Category label is required" });
  }

  const safeDescription = description?.trim() || "No description provided";
  const keywords = extractKeywords(`${label} ${safeDescription}`);

  try {
    const existingCategories = await listCategoriesForUser(userId);
    const { subscription, limits } = await getSubscriptionContext(userId);
    enforceMaxCount(existingCategories.length, limits.maxCategories, "Category", subscription.tier);

    const category = await createCategory({
      user_id: userId,
      label: label.trim(),
      description: safeDescription,
      keywords,
      email_count: 0,
    });
    const count = await applyCategoryToEmails(userId, category);
    return res.json({ ok: true, category: { ...category, email_count: count } });
  } catch (error: any) {
    if (error instanceof TierLimitError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const categoryId = req.params.id;
  if (!categoryId) return res.status(400).json({ ok: false, error: "Category id is required" });

  try {
    await deleteCategoryForUser(userId, categoryId);
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
