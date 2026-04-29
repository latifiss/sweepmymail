import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { getMySubscription, setMySubscriptionTier } from "../controllers/subscriptionController";

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getMySubscription);
router.patch("/tier", setMySubscriptionTier);

export default router;
