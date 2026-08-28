const { query } = require("../../config/db");

async function findAll() {
  const { rows } = await query("SELECT id, name, slug, created_at FROM categories ORDER BY name ASC");
  return rows;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0] || null;
}

async function findByName(name) {
  const { rows } = await query("SELECT * FROM categories WHERE name = $1", [name]);
  return rows[0] || null;
}

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function create(name) {
  const slug = slugify(name);
  const { rows } = await query(
    "INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *",
    [name, slug]
  );
  return rows[0];
}

async function remove(id) {
  await query("DELETE FROM categories WHERE id = $1", [id]);
}

module.exports = { findAll, findById, findByName, create, remove, slugify };
