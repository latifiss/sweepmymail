import { Request, Response } from "express";
import { google } from "googleapis";
import { generateAccessToken } from "../utils/tokenUtils";
import { env } from "../config/env";
import {
  createUser,
  getEmailCountForUser,
  getUserByEmail,
  getUserById,
  updateUserTokens,
} from "../repositories/dataRepository";

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

export const googleAuthUrl = (req: Request, res: Response) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.modify",
      "https://mail.google.com/",
      "email",
      "profile",
    ],
  });
  res.json({ url });
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).json({ error: "Authorization code is missing" });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      return res.status(400).json({ error: "Email not provided by Google" });
    }

    let user = await getUserByEmail(data.email);
    if (!user) {
      // Check if refresh_token exists, if not use a placeholder (will need to re-auth later)
      if (!tokens.refresh_token) {
        console.warn("No refresh token provided by Google. User will need to re-authenticate when token expires.");
      }
      
      user = await createUser({
        email: data.email,
        name: data.name || data.email,
        provider: "google",
        access_token: tokens.access_token || "",
        refresh_token: tokens.refresh_token || null,
        picture: data.picture || null,
      });
    } else {
      await updateUserTokens(user.id, {
        access_token: tokens.access_token || user.access_token,
        refresh_token: tokens.refresh_token || undefined,
      });
      user = (await getUserByEmail(data.email)) || user;
    }

    const token = generateAccessToken({ id: user.id, email: user.email });
    const responsePayload = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: (data.picture || user.picture) || undefined,
      },
    };

    const acceptsHtml = (req.headers.accept || "").includes("text/html");
    if (acceptsHtml && env.FRONTEND_URL) {
      const callbackUrl = new URL("/login/callback", env.FRONTEND_URL);
      callbackUrl.searchParams.set("token", token);
      callbackUrl.searchParams.set("email", user.email);
      callbackUrl.searchParams.set("id", user.id);
      callbackUrl.searchParams.set("name", user.name || "");
      if (data.picture || user.picture) {
        callbackUrl.searchParams.set("picture", (data.picture || user.picture) as string);
      }
      return res.redirect(callbackUrl.toString());
    }

    res.json(responsePayload);
  } catch (error: any) {
    console.error("Google callback error:", error);
    
    // Handle specific OAuth errors
    if (error.message === 'invalid_grant' || error.code === 'invalid_grant') {
      return res.status(400).json({ 
        error: "Authorization code expired or already used",
        message: "The authorization code can only be used once and expires quickly. Please get a new code by visiting /auth/google/url again.",
        solution: "1. Visit http://localhost:7000/auth/google/url to get a fresh auth URL\n2. Open it in your browser and authenticate\n3. Use the new code immediately"
      });
    }
    
    res.status(500).json({ 
      error: "Authentication failed", 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getCurrentUserProfile = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id?: string };
    if (!authUser?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getUserById(authUser.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const emailsCleaned = await getEmailCountForUser(user.id);

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider,
      createdAt: user.created_at,
      emailsCleaned,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch profile",
      message: error.message,
    });
  }
};
