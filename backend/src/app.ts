import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import dailySummaryRoutes from "./routes/dailySummaryRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { handleLemonSqueezyWebhook } from "./controllers/subscriptionWebhookController";

export function createApp() {
  const app = express();

  const allowedOrigins = ["http://localhost:4000", "http://localhost:3000", "http://localhost:3001"];

  // Webhooks must receive raw body for signature validation.
  app.post("/subscriptions/webhook/lemonsqueezy", express.raw({ type: "application/json" }), handleLemonSqueezyWebhook);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );

  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.use("/auth", authRoutes);
  app.use("/emails", emailRoutes);
  app.use("/stripe", stripeRoutes);
  app.use("/daily-summary", dailySummaryRoutes);
  app.use("/subscriptions", subscriptionRoutes);

  app.use(function onError(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      })
    );
  });

  return app;
}

