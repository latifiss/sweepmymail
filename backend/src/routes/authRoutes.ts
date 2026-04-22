import express from "express";
import { getCurrentUserProfile, googleAuthUrl, googleCallback } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = express.Router();

router.get("/google/url", googleAuthUrl);
router.get("/google/callback", googleCallback);
router.get("/me", authMiddleware, getCurrentUserProfile);

export default router;
