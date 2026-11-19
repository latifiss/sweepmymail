import { env } from "./config/env";
import { createApp } from "./app";
import { checkDatabaseConnection } from "./auth/auth";
import { startDailySummaryScheduler } from "./services/dailySummaryService";
import { startScheduledEmailScheduler } from "./services/scheduledEmailService";
import { startAutomationScheduler } from "./services/automationService";

const app = createApp();
const PORT = parseInt(env.PORT, 10);
if (isNaN(PORT) || PORT < 0 || PORT > 65535) {
  console.error(`Invalid PORT: ${env.PORT}.`);
  process.exit(1);
}

async function startServer() {
  const database = await checkDatabaseConnection();
  if (database.ok) {
    console.log("✅ PostgreSQL connection verified.");
  } else {
    console.error("❌ PostgreSQL connection failed.");
    console.error(`   Reason: ${database.error.message}`);
    console.error(`   Code: ${database.error.code}`);
    console.error(`   Next step: ${database.error.detail}`);
    console.error("   The API will start, but sign-in and database-backed endpoints will return a clear 503 until this is fixed.");
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running in ${env.NODE_ENV} mode`);
    console.log(`Listening on port ${PORT}`);
    console.log(database.ok ? "✅ Supabase/PostgreSQL is reachable." : "⚠️ Supabase/PostgreSQL is currently unreachable.");
    startDailySummaryScheduler();
    await startScheduledEmailScheduler();
    await startAutomationScheduler();
    console.log("✅ Daily summary, scheduled email, and inbox automation schedulers started");
  });
}
startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
