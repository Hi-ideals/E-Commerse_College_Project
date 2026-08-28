const { query } = require("../../config/db");

async function findByUser(userId) {
  const { rows } = await query(
    `SELECT c.id, c.quantity, c.created_at, c.updated_at,
            p.id AS product_id, p.name, p.price, p.stock, p.image_url, p.is_active
     FROM cart c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1
     ORDER BY c.created_at ASC`,
    [userId]
  );
  return rows;
}

async function findOne(userId, cartItemId) {
  const { rows } = await query(
    `SELECT c.*, p.stock, p.is_active FROM cart c
     JOIN products p ON p.id = c.product_id
     WHERE c.id = $1 AND c.user_id = $2`,
    [cartItemId, userId]
  );
  return rows[0] || null;
}

async function findByUserAndProduct(userId, productId) {
  const { rows } = await query(
    "SELECT * FROM cart WHERE user_id = $1 AND product_id = $2",
    [userId, productId]
  );
  return rows[0] || null;
}

async function upsertAdd(userId, productId, quantity) {
  const { rows } = await query(
    `INSERT INTO cart (user_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity, updated_at = now()
     RETURNING *`,
    [userId, productId, quantity]
  );
  return rows[0];
}

async function setQuantity(cartItemId, userId, quantity) {
  const { rows } = await query(
    `UPDATE cart SET quantity = $1, updated_at = now()
     WHERE id = $2 AND user_id = $3 RETURNING *`,
    [quantity, cartItemId, userId]
  );
  return rows[0] || null;
}

async function remove(cartItemId, userId) {
  const { rows } = await query(
    "DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id",
    [cartItemId, userId]
  );
  return rows[0] || null;
}

async function clear(userId) {
  await query("DELETE FROM cart WHERE user_id = $1", [userId]);
}

module.exports = {
  findByUser, findOne, findByUserAndProduct, upsertAdd, setQuantity, remove, clear,
};
