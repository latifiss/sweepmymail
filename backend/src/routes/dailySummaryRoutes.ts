import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getLatestDailySummary, regenerateDailySummary } from "../controllers/dailySummaryController";

const router = express.Router();

router.use(authMiddleware);
router.get("/latest", getLatestDailySummary);
router.post("/regenerate", regenerateDailySummary);

export default router;
