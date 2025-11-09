import Stripe from "stripe";
import { env } from "../config/env";
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (priceId: string, customerEmail: string) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: customerEmail,
    success_url: "https://yourapp.com/success",
    cancel_url: "https://yourapp.com/cancel",
  });
  return session;
};
