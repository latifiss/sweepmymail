import crypto from "crypto";
import { Request, Response } from "express";
import { env } from "../config/env";
import {
  resolveTierFromVariantId,
  upsertSubscriptionFromWebhook,
  type WebhookSubscriptionStatus,
} from "../services/subscriptionService";

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      userId?: string;
    };
  };
  data?: {
    attributes?: {
      status?: string;
      variant_id?: number | string;
      customer_id?: number | string;
      renews_at?: string | null;
      ends_at?: string | null;
      custom_data?: {
        user_id?: string;
        userId?: string;
      };
    };
  };
};

function safeCompareSignature(rawBody: Buffer, signatureHeader: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signatureHeader));
}

function mapWebhookStatus(status?: string): WebhookSubscriptionStatus {
  const normalized = (status || "").toLowerCase();
  if (normalized === "active" || normalized === "on_trial") return "active";
  if (normalized === "past_due" || normalized === "unpaid") return "past_due";
  if (normalized === "expired" || normalized === "cancelled" || normalized === "canceled") return "canceled";
  return "inactive";
}

export const handleLemonSqueezyWebhook = async (req: Request, res: Response) => {
  try {
    if (!env.LEMONSQUEEZY_WEBHOOK_SECRET) {
      return res.status(500).json({ ok: false, error: "LEMONSQUEEZY_WEBHOOK_SECRET is not configured" });
    }

    const signature = req.headers["x-signature"];
    if (typeof signature !== "string") {
      return res.status(401).json({ ok: false, error: "Missing webhook signature" });
    }

    const rawBody = req.body as Buffer;
    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ ok: false, error: "Invalid raw payload" });
    }

    const isValidSignature = safeCompareSignature(rawBody, signature, env.LEMONSQUEEZY_WEBHOOK_SECRET);
    if (!isValidSignature) {
      return res.status(401).json({ ok: false, error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(rawBody.toString("utf8")) as LemonWebhookPayload;
    const attrs = payload.data?.attributes;

    const userId =
      payload.meta?.custom_data?.user_id ||
      payload.meta?.custom_data?.userId ||
      attrs?.custom_data?.user_id ||
      attrs?.custom_data?.userId;

    if (!userId) {
      return res.status(400).json({ ok: false, error: "Missing custom_data.user_id in webhook payload" });
    }

    const variantId = attrs?.variant_id != null ? String(attrs.variant_id) : null;
    const customerId = attrs?.customer_id != null ? String(attrs.customer_id) : null;
    const tier = resolveTierFromVariantId(variantId);
    const status = mapWebhookStatus(attrs?.status);
    const currentPeriodEnd = attrs?.renews_at || attrs?.ends_at || null;

    await upsertSubscriptionFromWebhook({
      userId,
      tier,
      status,
      lemonSqueezyCustomerId: customerId,
      lemonSqueezyVariantId: variantId,
      currentPeriodEnd,
    });

    return res.status(200).json({ ok: true, event: payload.meta?.event_name || "unknown" });
  } catch (error: any) {
    return res.status(500).json({ ok: false, error: error.message || String(error) });
  }
};
