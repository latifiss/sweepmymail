import { betterAuth } from "better-auth";
import { google } from "googleapis";
import { Pool } from "pg";
import { env } from "../config/env";
import { supabase } from "../config/supabase";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DATABASE_POOL_MAX,
  idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined,
});

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
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://mail.google.com/",
      ],
    },
  },
  account: {
    encryptOAuthTokens: true,
    updateAccountOnSignIn: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      allowDifferentEmails: false,
    },
  },
  advanced: {
    database: {
      joins: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { error } = await supabase.from("users").upsert(
            {
              email: user.email,
              name: user.name || user.email,
              provider: "google",
              access_token: "",
              refresh_token: null,
              picture: user.image || null,
            },
            { onConflict: "email" }
          );

          if (error) {
            console.error("Failed to synchronize application user:", error);
          }
        },
      },
    },
  },
});

async function getGoogleAccountForEmail(email: string) {
  const userResult = await pool.query<{ id: string }>(
    'select "id" from "user" where lower("email") = lower($1) limit 1',
    [email]
  );

  const authUserId = userResult.rows[0]?.id;
  if (!authUserId) throw new Error("Better Auth user not found");

  const accountResult = await pool.query<{ id: string }>(
    'select "id" from "account" where "userId" = $1 and "providerId" = $2 limit 1',
    [authUserId, "google"]
  );

  const account = accountResult.rows[0];
  if (!account) throw new Error("Google account is not connected");

  return { authUserId, accountId: account.id };
}

export async function getGoogleAccessTokenForEmail(email: string) {
  const { authUserId, accountId } = await getGoogleAccountForEmail(email);

  const token = await auth.api.getAccessToken({
    body: {
      accountId,
      userId: authUserId,
    },
  });

  if (!token?.accessToken) {
    throw new Error("Google access token is unavailable");
  }

  return token.accessToken;
}

export async function refreshGoogleAccessTokenForEmail(email: string) {
  const { authUserId, accountId } = await getGoogleAccountForEmail(email);

  const token = await auth.api.refreshToken({
    body: {
      accountId,
      userId: authUserId,
    },
  });

  if (!token?.accessToken) {
    throw new Error("Google access token refresh failed");
  }

  return token.accessToken;
}

export async function verifyGoogleGmailAccessForEmail(email: string) {
  const accessToken = await getGoogleAccessTokenForEmail(email);
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: "me" });

  return {
    connected: true,
    email: profile.data.emailAddress || email,
    messagesTotal: profile.data.messagesTotal ?? 0,
    threadsTotal: profile.data.threadsTotal ?? 0,
  };
}

export type Auth = typeof auth;
