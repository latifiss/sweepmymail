import express from 'express';
import { env } from './config/env';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import dailySummaryRoutes from "./routes/dailySummaryRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { handleLemonSqueezyWebhook } from "./controllers/subscriptionWebhookController";
import { startDailySummaryScheduler } from "./services/dailySummaryService";

const app = express();
const PORT = parseInt(env.PORT, 10);

if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
  console.error(`Invalid PORT: ${env.PORT}. Using default port 8000.`);
  process.exit(1);
}

const allowedOrigins = [
  'http://localhost:4000',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.post("/subscriptions/webhook/lemonsqueezy", express.raw({ type: "application/json" }), handleLemonSqueezyWebhook);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use(
  cors({
    origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use((req, res, next) => {
  console.log(`Received a ${req.method} request for ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!');
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
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    })
  );
});

async function startServer() {
  try {
    app.listen(PORT, '0.0.0.0', async () => {
      console.clear();
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`Listening on port ${PORT}`);
      console.log('✅ Supabase connection configured via environment variables');
      startDailySummaryScheduler();
      console.log("✅ Daily summary scheduler started (runs at 06:00 UTC)");
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
}

startServer();