import { Request, Response } from "express";
import {
  SUBSCRIPTION_TIER_LIMITS,
  getSubscriptionContext,
  setUserSubscriptionTier,
  TierLimitError,
} from "../services/subscriptionService";

export const getMySubscription = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  try {
    const context = await getSubscriptionContext(userId);
    return res.json({
      ok: true,
      subscription: context.subscription,
      limits: context.limits,
      tiers: SUBSCRIPTION_TIER_LIMITS,
    });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};

export const setMySubscriptionTier = async (req: Request, res: Response) => {
  const userId = (req as any).user.id as string;
  const { tier } = req.body as { tier?: string };
  try {
    if (!tier) {
      return res.status(400).json({ ok: false, error: "tier is required" });
    }

    const subscription = await setUserSubscriptionTier(userId, tier);
    return res.json({
      ok: true,
      subscription,
      limits: SUBSCRIPTION_TIER_LIMITS[subscription.tier],
    });
  } catch (error: any) {
    if (error instanceof TierLimitError) {
      return res.status(error.status).json({ ok: false, error: error.message });
    }
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
