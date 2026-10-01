import express from "express";
import { getCurrentUserProfile } from "../controllers/authController";
import { auth, verifyGoogleGmailAccessForEmail } from "../auth/auth";
import { fromNodeHeaders } from "better-auth/node";
import { authMiddleware } from "../middlewares/authMiddleware";
import { env } from "../config/env";

const router = express.Router();

router.get("/me", authMiddleware, getCurrentUserProfile);

router.post("/google/reconnect", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as { email?: string } | undefined;
    const frontendOrigin =
      env.AUTH_TRUSTED_ORIGINS.find((origin) => origin !== env.BETTER_AUTH_URL) ||
      env.AUTH_TRUSTED_ORIGINS[0];

    const result = await auth.api.linkSocialAccount({
      body: {
        provider: "google",
        callbackURL: `${frontendOrigin}/reconnect-google?success=1`,
        scopes: [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/gmail.modify",
          "https://mail.google.com/",
        ],
        ...(user?.email ? { loginHint: user.email } : {}),
        additionalParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
      headers: fromNodeHeaders(req.headers),
    });

    if (!result?.url) {
      return res.status(502).json({
        error: "Failed to start Google reauthorization",
      });
    }

    return res.json({ url: result.url });
  } catch (error: any) {
    console.error("Google reauthorization initialization failed:", error);

    return res.status(502).json({
      error: "Failed to start Google reauthorization",
      message: error?.message || "Unable to start Google reauthorization",
    });
  }
});

router.get("/google/status", authMiddleware, async (req, res) => {
  try {
    const user = (req as any).user as { email?: string } | undefined;

    if (!user?.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await verifyGoogleGmailAccessForEmail(user.email);

    return res.json(result);
  } catch (error: any) {
    console.error("Google Gmail access verification failed:", error);

    const requiresReauthorization = error?.code === "GOOGLE_REAUTH_REQUIRED";

    return res.status(requiresReauthorization ? 409 : 502).json({
      connected: false,
      requiresReauthorization,
      code: error?.code,
      error: requiresReauthorization
        ? "Google reauthorization required"
        : "Google Gmail access is unavailable",
      message: error?.message || "Unable to verify Gmail access",
    });
  }
});

export default router;
