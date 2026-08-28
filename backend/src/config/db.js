const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  logger.error("Unexpected PostgreSQL pool error", { error: err.message });
});

/**
 * Run a single query using the shared pool.
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (env.nodeEnv !== "production") {
    logger.debug("SQL query executed", { text, duration, rows: result.rowCount });
  }
  return result;
}

/**
 * Run a callback within a single client transaction.
 * Automatically BEGIN/COMMIT/ROLLBACK.
 *
 * Usage:
 *   await withTransaction(async (client) => {
 *     await client.query('...');
 *   });
 */
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
