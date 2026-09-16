import dotenv from "dotenv";
dotenv.config({ override: process.env.NODE_ENV !== "production" });

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

const frontendUrl = process.env.FRONTEND_URL || "https://www.mymagicmail.app";

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || "3000",
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_POOL_MAX: parsePositiveInt(process.env.DATABASE_POOL_MAX, 20),
  DATABASE_IDLE_TIMEOUT_MS: parsePositiveInt(process.env.DATABASE_IDLE_TIMEOUT_MS, 30000),
  DATABASE_CONNECTION_TIMEOUT_MS: parsePositiveInt(process.env.DATABASE_CONNECTION_TIMEOUT_MS, 10000),
  DATABASE_SSL: parseBoolean(process.env.DATABASE_SSL, true),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:7000",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "",
  AUTH_TRUSTED_ORIGINS: (process.env.AUTH_TRUSTED_ORIGINS || frontendUrl)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY?.trim() || "",
  AGENT_MODEL: process.env.AGENT_MODEL || "google/gemma-4-26b-a4b-it:free",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "",
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: process.env.SMTP_PORT || "587",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  FRONTEND_URL: frontendUrl,
  LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "",
  LEMONSQUEEZY_VARIANT_ID_STARTER: process.env.LEMONSQUEEZY_VARIANT_ID_STARTER || "",
  LEMONSQUEEZY_VARIANT_ID_GROWTH: process.env.LEMONSQUEEZY_VARIANT_ID_GROWTH || "",
  LEMONSQUEEZY_VARIANT_ID_PRO: process.env.LEMONSQUEEZY_VARIANT_ID_PRO || "",
};
