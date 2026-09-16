import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { env } from "../config/env";
import { supabase } from "../config/supabase";

const pool = new Pool({
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

export async function getGoogleAccessTokenForEmail(email: string) {
  const result = await pool.query<{ id: string }>(
    'select "id" from "user" where lower("email") = lower($1) limit 1',
    [email]
  );

  const authUserId = result.rows[0]?.id;
  if (!authUserId) throw new Error("Better Auth user not found");

  const token = await auth.api.getAccessToken({
    body: {
      providerId: "google",
      userId: authUserId,
    },
  });

  if (!token?.accessToken) {
    throw new Error("Google account is not connected or its access token is unavailable");
  }

  return token.accessToken;
}

export type Auth = typeof auth;
