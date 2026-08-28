const { query } = require("../../config/db");

/**
 * List products with optional filters, search, and pagination.
 * filters: { category, search, minPrice, maxPrice, page, limit, includeInactive }
 */
async function findMany(filters) {
  const {
    category, search, minPrice, maxPrice,
    page = 1, limit = 12, includeInactive = false,
  } = filters;

  const where = [];
  const params = [];

  if (!includeInactive) {
    where.push("p.is_active = TRUE");
  }
  if (category) {
    params.push(category);
    where.push(`c.slug = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    where.push(`p.name ILIKE $${params.length}`);
  }
  if (minPrice !== undefined) {
    params.push(minPrice);
    where.push(`p.price >= $${params.length}`);
  }
  if (maxPrice !== undefined) {
    params.push(maxPrice);
    where.push(`p.price <= $${params.length}`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereSql}
  `;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0].total;

  const listParams = [...params, limit, offset];
  const listSql = `
    SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url, p.is_active,
           p.created_at, p.updated_at,
           c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    ${whereSql}
    ORDER BY p.created_at DESC
    LIMIT $${listParams.length - 1} OFFSET $${listParams.length}
  `;
  const { rows } = await query(listSql, listParams);

  return { items: rows, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

async function findById(id) {
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name, c.slug AS category_slug
     FROM products p LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, description, price, stock, categoryId, imageUrl, createdBy }) {
  const { rows } = await query(
    `INSERT INTO products (name, description, price, stock, category_id, image_url, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, description ?? null, price, stock, categoryId ?? null, imageUrl ?? null, createdBy]
  );
  return rows[0];
}

async function update(id, fields) {
  const allowed = ["name", "description", "price", "stock", "category_id", "image_url", "is_active"];
  const sets = [];
  const params = [];

  for (const [key, value] of Object.entries(fields)) {
    if (allowed.includes(key) && value !== undefined) {
      params.push(value);
      sets.push(`${key} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findById(id);

  params.push(id);
  const { rows } = await query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function softDelete(id) {
  const { rows } = await query(
    "UPDATE products SET is_active = FALSE WHERE id = $1 RETURNING id",
    [id]
  );
  return rows[0] || null;
}

async function hardDelete(id) {
  await query("DELETE FROM products WHERE id = $1", [id]);
}

async function decrementStock(client, productId, quantity) {
  await client.query(
    "UPDATE products SET stock = stock - $1 WHERE id = $2",
    [quantity, productId]
  );
}

async function incrementStock(client, productId, quantity) {
  await client.query(
    "UPDATE products SET stock = stock + $1 WHERE id = $2",
    [quantity, productId]
  );
}

module.exports = {
  findMany, findById, create, update, softDelete, hardDelete,
  decrementStock, incrementStock,
};
