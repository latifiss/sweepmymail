import { betterAuth } from "better-auth";
import { google } from "googleapis";
import { Pool } from "pg";
import { env } from "../config/env";
import { supabase } from "../config/supabase";

export class GoogleReauthorizationRequiredError extends Error {
  readonly code = "GOOGLE_REAUTH_REQUIRED";
  constructor(public readonly email: string) {
    super(`Google authorization for ${email} has expired or been revoked. Reconnect the Google account to continue using Gmail.`);
    this.name = "GoogleReauthorizationRequiredError";
  }
}

function isGoogleReauthorizationError(error: unknown) {
  const err = error as any;
  const responseError = err?.response?.data?.error;
  const responseCode = err?.response?.data?.code;
  const bodyCode = err?.body?.code;
  const code = err?.code;
  return responseError === "invalid_grant" || err?.error === "invalid_grant" ||
    code === "invalid_grant" || responseCode === "FAILED_TO_GET_ACCESS_TOKEN" ||
    responseCode === "FAILED_TO_REFRESH_ACCESS_TOKEN" || bodyCode === "FAILED_TO_GET_ACCESS_TOKEN" ||
    bodyCode === "FAILED_TO_REFRESH_ACCESS_TOKEN" || code === "FAILED_TO_GET_ACCESS_TOKEN" ||
    code === "FAILED_TO_REFRESH_ACCESS_TOKEN" ||
    (typeof err?.message === "string" && err.message.includes("invalid_grant"));
}

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
});

// pg emits idle-client errors here. Keep them visible without crashing the process.
pool.on("error", (error) => {
  console.error("[database] An idle PostgreSQL connection failed:", describeDatabaseError(error));
});

export function describeDatabaseError(error: unknown) {
  const err = error as { code?: string; message?: string; cause?: unknown };
  const message = err?.message || "Unknown database error";
  const cause = err?.cause as { code?: string; message?: string } | undefined;
  const combinedMessage = [message, cause?.message].filter(Boolean).join(" ");
  // Supavisor may report this as PostgreSQL XX000 while embedding the
  // actionable ENOTFOUND tenant/user detail in the message.
  const code = /tenant\\/user .* not found/i.test(combinedMessage)
    ? "SUPABASE_POOLER_TENANT_NOT_FOUND"
    : err?.code || cause?.code || "UNKNOWN";
  if (code === "SUPABASE_POOLER_TENANT_NOT_FOUND") {
    return {
      code,
      message: "Supabase's connection pooler does not recognize this project/user. Your DATABASE_URL likely contains an outdated project reference, pooler host, or username.",
      detail: "Open Supabase Project Settings → Database → Connection string and copy the current URI. Use the matching pooler host and username, or use the direct database host if your network supports IPv6.",
    };
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return {
      code,
      message: "The database hostname could not be resolved. Check DATABASE_URL and confirm the Supabase project/host still exists.",
      detail: "This is a hostname/DNS or connection-string problem, not an expired Google OAuth key.",
    };
  }
  if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ECONNRESET") {
    return {
      code,
      message: "The database server could not be reached. Check the Supabase project status, port, network, and connection type.",
      detail: "This does not indicate an expired Google OAuth key.",
    };
  }
  if (code === "28P01" || code === "P1000") {
    return {
      code,
      message: "Supabase rejected the database username or password. Verify the database password in DATABASE_URL.",
      detail: "The database credentials may be wrong or have been rotated. This is separate from Google OAuth credentials.",
    };
  }
  if (code === "3D000") {
    return { code, message: "The configured PostgreSQL database does not exist. Check the database name in DATABASE_URL.", detail: message };
  }
  return { code, message, detail: "Check DATABASE_URL, Supabase connectivity, and database permissions." };
}

export async function checkDatabaseConnection() {
  if (!env.DATABASE_URL.trim()) {
    return {
      ok: false as const,
      error: {
        code: "DATABASE_URL_MISSING",
        message: "DATABASE_URL is not configured. Better Auth cannot connect to PostgreSQL.",
        detail: "Set DATABASE_URL in backend/.env using the current connection string from Supabase Project Settings → Database.",
      },
    };
  }
  try {
    await pool.query("select 1");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, error: describeDatabaseError(error) };
  }
}

export const auth = betterAuth({
  appName: "Magic Mail",
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: pool,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: "offline",
      prompt: "select_account consent",
      scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/gmail.modify", "https://mail.google.com/"],
    },
  },
  account: {
    encryptOAuthTokens: true,
    updateAccountOnSignIn: true,
    accountLinking: { enabled: true, trustedProviders: ["google"], allowDifferentEmails: false },
  },
  advanced: { database: { joins: true } },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { error } = await supabase.from("users").upsert({
            email: user.email, name: user.name || user.email, provider: "google",
            access_token: "", refresh_token: null, picture: user.image || null,
          }, { onConflict: "email" });
          if (error) console.error("Failed to synchronize application user:", error);
        },
      },
    },
  },
});

async function getGoogleAccountForEmail(email: string) {
  const userResult = await pool.query<{ id: string }>(
    'select "id" from "user" where lower("email") = lower($1) limit 1', [email]
  );
  const authUserId = userResult.rows[0]?.id;
  if (!authUserId) throw new Error("Better Auth user not found");
  const accountResult = await pool.query<{ id: string }>(
    'select "id" from "account" where "userId" = $1 and "providerId" = $2 limit 1', [authUserId, "google"]
  );
  const account = accountResult.rows[0];
  if (!account) throw new Error("Google account is not connected");
  return { authUserId, accountId: account.id };
}

export async function getGoogleAccessTokenForEmail(email: string) {
  const { authUserId, accountId } = await getGoogleAccountForEmail(email);
  try {
    const token = await auth.api.getAccessToken({ body: { accountId, userId: authUserId } });
    if (!token?.accessToken) throw new Error("Google access token is unavailable");
    return token.accessToken;
  } catch (error) {
    if (isGoogleReauthorizationError(error)) throw new GoogleReauthorizationRequiredError(email);
    throw error;
  }
}

export async function refreshGoogleAccessTokenForEmail(email: string) {
  const { authUserId, accountId } = await getGoogleAccountForEmail(email);
  try {
    const token = await auth.api.refreshToken({ body: { accountId, userId: authUserId } });
    if (!token?.accessToken) throw new Error("Google access token refresh failed");
    return token.accessToken;
  } catch (error) {
    if (isGoogleReauthorizationError(error)) throw new GoogleReauthorizationRequiredError(email);
    throw error;
  }
}

export async function verifyGoogleGmailAccessForEmail(email: string) {
  const accessToken = await getGoogleAccessTokenForEmail(email);
  const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });
  return {
    connected: true, email: profile.data.emailAddress || email,
    messagesTotal: profile.data.messagesTotal ?? 0, threadsTotal: profile.data.threadsTotal ?? 0,
  };
}

export type Auth = typeof auth;
