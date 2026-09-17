import express from "express";
import morgan from "morgan";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import { betterAuthHandler } from "./routes/betterAuthRoutes";
import emailRoutes from "./routes/emailRoutes";
import scheduledEmailRoutes from "./routes/scheduledEmailRoutes";
import automationRoutes from "./routes/automationRoutes";
import agentRoutes from "./routes/agentRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import dailySummaryRoutes from "./routes/dailySummaryRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { handleLemonSqueezyWebhook } from "./controllers/subscriptionWebhookController";

export function createApp() {
  const app = express();
  app.use(cors({ origin: function (origin, callback) { if (!origin) return callback(null, true); if (env.AUTH_TRUSTED_ORIGINS.includes(origin)) return callback(null, true); return callback(new Error("Not allowed by CORS")); }, credentials: true }));
  app.all("/api/auth/*splat", betterAuthHandler);
  app.post("/subscriptions/webhook/lemonsqueezy", express.raw({ type: "application/json" }), handleLemonSqueezyWebhook);
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(morgan("dev"));
  app.get("/", (req, res) => res.json({ name: "Magic Mail API", status: "ok" }));
  app.use("/auth", authRoutes);
  app.use("/emails", emailRoutes);
  app.use("/scheduled-emails", scheduledEmailRoutes);
  app.use("/automations", automationRoutes);
  app.use("/agent", agentRoutes);
  app.use("/stripe", stripeRoutes);
  app.use("/daily-summary", dailySummaryRoutes);
  app.use("/subscriptions", subscriptionRoutes);
  app.use(function onError(err: any, req: express.Request, res: express.Response, next: express.NextFunction) { if (res.headersSent) return next(err); const status = err.statusCode || err.status || 500; res.status(status).json({ error: process.env.NODE_ENV === "development" ? err.message : "Internal server error", ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}) }); });
  return app;
}
