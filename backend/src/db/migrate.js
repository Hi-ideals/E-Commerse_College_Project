/**
 * Minimal migration runner.
 * Applies every .sql file in ./migrations, in filename order, that has not
 * already been recorded in the schema_migrations table.
 */
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");
const logger = require("../utils/logger");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name        VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function run() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const applied = new Set(
      (await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name)
    );

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        logger.info(`Skipping already-applied migration: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      logger.info(`Applying migration: ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        logger.info(`Applied: ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    logger.info("All migrations up to date.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  logger.error("Migration failed", { error: err.message, stack: err.stack });
  process.exit(1);
});
