import { env } from './config/env';
import { createApp } from "./app";
import { startDailySummaryScheduler } from "./services/dailySummaryService";

const app = createApp();
const PORT = parseInt(env.PORT, 10);

if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
  console.error(`Invalid PORT: ${env.PORT}. Using default port 8000.`);
  process.exit(1);
}

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