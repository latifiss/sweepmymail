import { betterAuth } from "better-auth";
import { parseEnvelope, symmetricDecrypt, symmetricEncrypt } from "better-auth/crypto";
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
      accessType: "offline",
      prompt: "select_account consent",
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

type GoogleAccountRow = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | string | null;
};

function looksEncrypted(token: string) {
  return token.startsWith("$ba$") || (token.length % 2 === 0 && /^[0-9a-f]+$/i.test(token) && token.length >= 48);
}

async function unwrapOAuthToken(token: string | null | undefined) {
  if (!token) return "";
  if (!env.BETTER_AUTH_SECRET || !looksEncrypted(token)) return token;

  try {
    const envelope = parseEnvelope(token);
    if (envelope) {
      return await symmetricDecrypt({ key: env.BETTER_AUTH_SECRET, data: envelope.ciphertext });
    }
    return await symmetricDecrypt({ key: env.BETTER_AUTH_SECRET, data: token });
  } catch (error) {
    console.warn("Failed to decrypt stored Google OAuth token:", error instanceof Error ? error.message : error);
    return token;
  }
}

async function wrapOAuthToken(token: string) {
  if (!env.BETTER_AUTH_SECRET) return token;
  return symmetricEncrypt({ key: env.BETTER_AUTH_SECRET, data: token });
}

function tokenExpiryDate(expiresAt: Date | string | null | undefined) {
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  return Number.isFinite(date.getTime()) ? date : null;
}

function isAccessTokenFresh(expiresAt: Date | string | null | undefined) {
  const date = tokenExpiryDate(expiresAt);
  return Boolean(date && date.getTime() - Date.now() > 60_000);
}

async function getGoogleAccountForEmail(email: string) {
  const userResult = await pool.query<{ id: string }>(
    'select "id" from "user" where lower("email") = lower($1) limit 1',
    [email]
  );

  const authUserId = userResult.rows[0]?.id;
  if (!authUserId) throw new Error("Better Auth user not found");

  const accountResult = await pool.query<GoogleAccountRow>(
    'select "id", "accessToken", "refreshToken", "accessTokenExpiresAt" from "account" where "userId" = $1 and "providerId" = $2 limit 1',
    [authUserId, "google"]
  );

  const account = accountResult.rows[0];
  if (!account) throw new Error("Google account is not connected");

  return { authUserId, account };
}

async function persistGoogleTokens(
  email: string,
  accountId: string,
  credentials: { access_token?: string | null; refresh_token?: string | null; expiry_date?: number | null }
) {
  const accessToken = credentials.access_token ? await wrapOAuthToken(credentials.access_token) : null;
  const refreshToken = credentials.refresh_token ? await wrapOAuthToken(credentials.refresh_token) : null;
  const expiresAt = credentials.expiry_date ? new Date(credentials.expiry_date) : null;

  await pool.query(
    `update "account"
     set "accessToken" = coalesce($1, "accessToken"),
         "refreshToken" = coalesce($2, "refreshToken"),
         "accessTokenExpiresAt" = coalesce($3, "accessTokenExpiresAt"),
         "updatedAt" = now()
     where "id" = $4`,
    [accessToken, refreshToken, expiresAt, accountId]
  );

  const appUpdate: { access_token?: string; refresh_token?: string } = {};
  if (credentials.access_token) appUpdate.access_token = credentials.access_token;
  if (credentials.refresh_token) appUpdate.refresh_token = credentials.refresh_token;
  if (!Object.keys(appUpdate).length) return;

  const { error } = await supabase.from("users").update(appUpdate).eq("email", email);
  if (error) console.warn("Failed to persist application Google tokens:", error.message);
}

async function refreshGoogleTokensWithGoogle(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  if (!credentials.access_token) throw new Error("Google access token refresh failed");
  return credentials;
}

async function getStoredGoogleRefreshToken(email: string, accountRefreshToken: string) {
  if (accountRefreshToken) return accountRefreshToken;

  const { data, error } = await supabase
    .from("users")
    .select("refresh_token")
    .eq("email", email)
    .maybeSingle();

  if (error) console.warn("Failed to load application Google refresh token:", error.message);
  return String(data?.refresh_token || "");
}

async function resolveGoogleAccessToken(email: string, forceRefresh = false) {
  const { authUserId, account } = await getGoogleAccountForEmail(email);

  if (!forceRefresh) {
    try {
      const token = await auth.api.getAccessToken({
        body: {
          accountId: account.id,
          userId: authUserId,
        },
      });
      if (token?.accessToken) return token.accessToken;
    } catch (error) {
      console.warn(
        `Better Auth getAccessToken failed for ${email}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  const accessToken = await unwrapOAuthToken(account.accessToken);
  const refreshToken = await getStoredGoogleRefreshToken(email, await unwrapOAuthToken(account.refreshToken));

  if (!forceRefresh && accessToken && !looksEncrypted(accessToken) && isAccessTokenFresh(account.accessTokenExpiresAt)) {
    return accessToken;
  }

  if (refreshToken && !looksEncrypted(refreshToken)) {
    const credentials = await refreshGoogleTokensWithGoogle(refreshToken);
    await persistGoogleTokens(email, account.id, credentials);
    return credentials.access_token as string;
  }

  if (forceRefresh) {
    try {
      const token = await auth.api.refreshToken({
        body: {
          accountId: account.id,
          userId: authUserId,
        },
      });
      if (token?.accessToken) return token.accessToken;
    } catch (error) {
      console.warn(
        `Better Auth refreshToken failed for ${email}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  if (accessToken && !looksEncrypted(accessToken)) return accessToken;

  throw new Error("Failed to get a valid Google access token. Please sign in with Google again.");
}

export async function getGoogleAccessTokenForEmail(email: string) {
  return resolveGoogleAccessToken(email, false);
}

export async function refreshGoogleAccessTokenForEmail(email: string) {
  return resolveGoogleAccessToken(email, true);
}

export async function getGoogleOAuth2ClientForEmail(email: string) {
  const { account } = await getGoogleAccountForEmail(email);
  const accessToken = await resolveGoogleAccessToken(email, false);
  const refreshToken = await getStoredGoogleRefreshToken(email, await unwrapOAuthToken(account.refreshToken));
  const oauth2Client = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
    expiry_date: tokenExpiryDate(account.accessTokenExpiresAt)?.getTime(),
  });

  oauth2Client.on("tokens", (tokens) => {
    void persistGoogleTokens(email, account.id, tokens).catch((error) => {
      console.warn("Failed to persist refreshed Google tokens:", error instanceof Error ? error.message : error);
    });
  });

  return oauth2Client;
}

export async function verifyGoogleGmailAccessForEmail(email: string) {
  const oauth2Client = await getGoogleOAuth2ClientForEmail(email);
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
