import express from "express";
import { getCurrentUserProfile } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/me", authMiddleware, getCurrentUserProfile);

export default router;
