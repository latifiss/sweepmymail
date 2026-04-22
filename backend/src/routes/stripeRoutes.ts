import express from "express";
import { createCheckoutSession } from "../services/stripeService";

const router = express.Router();

router.post("/checkout", async (req, res) => {
  try {
    const { priceId, email } = req.body;
    const session = await createCheckoutSession(priceId, email);
    res.json(session);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message || "Stripe service error",
      message: "Stripe is not configured. Please set STRIPE_SECRET_KEY in your .env file."
    });
  }
});

export default router;
