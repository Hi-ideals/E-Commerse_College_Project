const app = require("./app");
const env = require("./config/env");
const logger = require("./utils/logger");
const { pool } = require("./config/db");

const server = app.listen(env.port, () => {
  logger.info(`Smart E-Commerce backend listening on port ${env.port} [${env.nodeEnv}]`);
});

// Without this, a failed bind (e.g. EADDRINUSE from a stray previous
// instance) fires an unhandled 'error' event and the process dies silently
// — no log line, nothing in the console. This makes that failure visible.
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${env.port} is already in use. Stop the other process or change PORT in .env.`);
  } else {
    logger.error("Server failed to start", { error: err.message, stack: err.stack });
  }
  process.exit(1);
});

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await pool.end();
    logger.info("HTTP server and DB pool closed.");
    process.exit(0);
  });
  // Force exit if not closed within 10s
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason: reason?.message || reason });
});
