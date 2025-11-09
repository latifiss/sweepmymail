import express from "express";
import { googleAuthUrl, googleCallback } from "../controllers/authController";
const router = express.Router();

router.get("/google/url", googleAuthUrl);
router.get("/google/callback", googleCallback);

export default router;
