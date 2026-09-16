import express from "express";
import { getCurrentUserProfile } from "../controllers/authController";
import { verifyGoogleGmailAccessForEmail } from "../auth/auth";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, getCurrentUserProfile);

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

    return res.status(502).json({
      connected: false,
      error: "Google Gmail access is unavailable",
      message: error?.message || "Unable to verify Gmail access",
    });
  }
});

export default router;
