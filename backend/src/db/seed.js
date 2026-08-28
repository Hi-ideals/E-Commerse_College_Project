/**
 * Seeds baseline data: an admin user, a demo customer, and a few categories/products.
 * Safe to re-run (uses ON CONFLICT DO NOTHING / upserts).
 */
const bcrypt = require("bcrypt");
const { pool } = require("../config/db");
const env = require("../config/env");
const logger = require("../utils/logger");

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const adminHash = await bcrypt.hash("Admin@12345", env.bcryptSaltRounds);
    const userHash = await bcrypt.hash("User@12345", env.bcryptSaltRounds);

    await client.query(
      `INSERT INTO users (name, email, username, password_hash, role)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      ["Platform Admin", "admin@smartshop.com", "admin", adminHash]
    );

    await client.query(
      `INSERT INTO users (name, email, username, password_hash, role)
       VALUES ($1, $2, $3, $4, 'user')
       ON CONFLICT (email) DO NOTHING`,
      ["Demo Customer", "customer@smartshop.com", "democustomer", userHash]
    );

    const categories = [
      ["Electronics", "electronics"],
      ["Clothing", "clothing"],
      ["Home & Kitchen", "home-kitchen"],
      ["Books", "books"],
    ];
    for (const [name, slug] of categories) {
      await client.query(
        `INSERT INTO categories (name, slug) VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`,
        [name, slug]
      );
    }

    const { rows: cats } = await client.query("SELECT id, slug FROM categories");
    const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
    const { rows: admins } = await client.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    const adminId = admins[0]?.id;

    // Prices in INR (₹).
    const products = [
      ["Wireless Mouse", "Ergonomic 2.4GHz wireless mouse", 599, 150, "electronics"],
      ["Mechanical Keyboard", "RGB backlit mechanical keyboard", 1999, 80, "electronics"],
      ["Cotton T-Shirt", "Unisex 100% cotton t-shirt", 499, 300, "clothing"],
      ["Non-Stick Pan Set", "3-piece non-stick cookware set", 1499, 60, "home-kitchen"],
      ["The Pragmatic Programmer", "Classic software engineering book", 899, 40, "books"],
    ];
    const { rows: existing } = await client.query("SELECT COUNT(*)::int AS count FROM products");
    if (existing[0].count === 0) {
      for (const [name, description, price, stock, slug] of products) {
        await client.query(
          `INSERT INTO products (name, description, price, stock, category_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [name, description, price, stock, catBySlug[slug], adminId]
        );
      }
    }

    await client.query("COMMIT");
    logger.info("Seed complete. Admin login: admin@smartshop.com / Admin@12345");
    logger.info("Demo user login: customer@smartshop.com / User@12345");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  logger.error("Seeding failed", { error: err.message });
  process.exit(1);
});
