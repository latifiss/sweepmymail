import {
  getUserSubscriptionByUserId,
  upsertUserSubscriptionByUserId,
  type DbUserSubscription,
  type SubscriptionTierId,
} from "../repositories/dataRepository";
import { env } from "../config/env";

export type SubscriptionTierLimits = {
  maxFetchPerSync: number;
  maxDeleteBatch: number;
  maxCategories: number;
  maxPriorityKeywords: number;
};

export const SUBSCRIPTION_TIER_LIMITS: Record<SubscriptionTierId, SubscriptionTierLimits> = {
  starter: {
    maxFetchPerSync: 200,
    maxDeleteBatch: 150,
    maxCategories: 5,
    maxPriorityKeywords: 10,
  },
  growth: {
    maxFetchPerSync: 500,
    maxDeleteBatch: 500,
    maxCategories: 20,
    maxPriorityKeywords: 40,
  },
  pro: {
    maxFetchPerSync: 1200,
    maxDeleteBatch: 2000,
    maxCategories: 100,
    maxPriorityKeywords: 200,
  },
};

export class TierLimitError extends Error {
  status: number;
  constructor(message: string) {
    super(message);
    this.status = 403;
  }
}

export type WebhookSubscriptionStatus = "active" | "inactive" | "past_due" | "canceled";

function normalizeTier(input: unknown): SubscriptionTierId {
  if (typeof input !== "string") return "starter";
  const tier = input.trim().toLowerCase();
  if (tier === "starter" || tier === "growth" || tier === "pro") return tier;
  return "starter";
}

export async function getSubscriptionContext(userId: string): Promise<{
  subscription: DbUserSubscription;
  limits: SubscriptionTierLimits;
}> {
  try {
    const subscription =
      (await getUserSubscriptionByUserId(userId)) || ({
        user_id: userId,
        tier: "starter",
        status: "active",
      } satisfies DbUserSubscription);

    const tier = normalizeTier(subscription.tier);
    const limits = SUBSCRIPTION_TIER_LIMITS[tier];

    return {
      subscription: { ...subscription, tier },
      limits,
    };
  } catch (error) {
    console.error("Failed to load subscription context, falling back to starter tier:", error);
    return {
      subscription: {
        user_id: userId,
        tier: "starter",
        status: "active",
      },
      limits: SUBSCRIPTION_TIER_LIMITS.starter,
    };
  }
}

export async function setUserSubscriptionTier(userId: string, tierInput: unknown): Promise<DbUserSubscription> {
  const tier = normalizeTier(tierInput);
  const payload: DbUserSubscription = {
    user_id: userId,
    tier,
    status: "active",
    updated_at: new Date().toISOString(),
  };

  await upsertUserSubscriptionByUserId(payload);
  return payload;
}

export function resolveTierFromVariantId(variantId: string | null): SubscriptionTierId {
  if (!variantId) return "starter";
  if (env.LEMONSQUEEZY_VARIANT_ID_PRO && variantId === env.LEMONSQUEEZY_VARIANT_ID_PRO) return "pro";
  if (env.LEMONSQUEEZY_VARIANT_ID_GROWTH && variantId === env.LEMONSQUEEZY_VARIANT_ID_GROWTH) return "growth";
  if (env.LEMONSQUEEZY_VARIANT_ID_STARTER && variantId === env.LEMONSQUEEZY_VARIANT_ID_STARTER) return "starter";
  return "starter";
}

export async function upsertSubscriptionFromWebhook(payload: {
  userId: string;
  tier: SubscriptionTierId;
  status: WebhookSubscriptionStatus;
  lemonSqueezyCustomerId: string | null;
  lemonSqueezyVariantId: string | null;
  currentPeriodEnd: string | null;
}): Promise<void> {
  await upsertUserSubscriptionByUserId({
    user_id: payload.userId,
    tier: payload.tier,
    status: payload.status,
    lemonsqueezy_customer_id: payload.lemonSqueezyCustomerId,
    lemonsqueezy_variant_id: payload.lemonSqueezyVariantId,
    current_period_end: payload.currentPeriodEnd,
    updated_at: new Date().toISOString(),
  });
}

export function enforceMaxCount(currentCount: number, maxCount: number, entityName: string, tier: SubscriptionTierId) {
  if (currentCount >= maxCount) {
    throw new TierLimitError(
      `${entityName} limit reached for ${tier} tier (${maxCount}). Upgrade your subscription to increase this limit.`
    );
  }
}

export function enforceBatchSize(batchSize: number, maxBatchSize: number, tier: SubscriptionTierId) {
  if (batchSize > maxBatchSize) {
    throw new TierLimitError(
      `This action exceeds your ${tier} tier limit (${maxBatchSize} items per request).`
    );
  }
}
