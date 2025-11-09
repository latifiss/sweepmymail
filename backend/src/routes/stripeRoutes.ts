import express from "express";
import { createCheckoutSession } from "../services/stripeService";

const router = express.Router();

router.post("/checkout", async (req, res) => {
  const { priceId, email } = req.body;
  const session = await createCheckoutSession(priceId, email);
  res.json(session);
});

export default router;
