const { query } = require("../../config/db");

/**
 * Locks the user's cart rows joined with their product rows, within the
 * caller's transaction, so concurrent checkouts can't oversell stock.
 */
async function lockCartForCheckout(client, userId) {
  const { rows } = await client.query(
    `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name, p.price, p.stock, p.is_active
     FROM cart c
     JOIN products p ON p.id = c.product_id
     WHERE c.user_id = $1
     FOR UPDATE OF p`,
    [userId]
  );
  return rows;
}

async function insertOrder(client, { userId, subtotal, tax, shipping, total, shippingAddress, paymentMethod }) {
  const { rows } = await client.query(
    `INSERT INTO orders
       (user_id, subtotal_amount, tax_amount, shipping_amount, total_amount, status, shipping_address, payment_method)
     VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7)
     RETURNING *`,
    [userId, subtotal, tax, shipping, total, JSON.stringify(shippingAddress), paymentMethod]
  );
  return rows[0];
}

async function insertOrderItems(client, orderId, items) {
  for (const item of items) {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, item.product_id, item.name, item.quantity, item.price]
    );
  }
}

async function insertStatusHistory(client, orderId, status, updatedBy, note = null) {
  await client.query(
    `INSERT INTO order_status_history (order_id, status, note, updated_by)
     VALUES ($1, $2, $3, $4)`,
    [orderId, status, note, updatedBy]
  );
}

async function decrementStock(client, productId, quantity) {
  await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [quantity, productId]);
}

async function clearCart(client, userId) {
  await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);
}

async function findByUser(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT id, subtotal_amount, tax_amount, shipping_amount, total_amount, status,
            payment_method, created_at, updated_at
     FROM orders WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await query("SELECT COUNT(*)::int AS total FROM orders WHERE user_id = $1", [userId]);
  return { items: rows, total: countRows[0].total, page, limit, totalPages: Math.ceil(countRows[0].total / limit) || 1 };
}

async function findAll({ page = 1, limit = 10, status } = {}) {
  const params = [];
  const where = [];
  if (status) {
    params.push(status);
    where.push(`o.status = $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (page - 1) * limit;

  const { rows: countRows } = await query(`SELECT COUNT(*)::int AS total FROM orders o ${whereSql}`, params);
  const total = countRows[0].total;

  const listParams = [...params, limit, offset];
  const { rows } = await query(
    `SELECT o.id, o.user_id, u.name AS customer_name, u.email AS customer_email,
            o.total_amount, o.status, o.created_at, o.updated_at
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
    listParams
  );
  return { items: rows, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

async function findByIdWithClient(client, orderId) {
  const { rows } = await client.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

async function findById(orderId) {
  const { rows } = await query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

async function findItems(orderId) {
  const { rows } = await query(
    "SELECT id, product_id, product_name, quantity, price FROM order_items WHERE order_id = $1",
    [orderId]
  );
  return rows;
}

/**
 * Locks the order row within the caller's transaction so two concurrent
 * status updates can't race each other.
 */
async function lockOrder(client, orderId) {
  const { rows } = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [orderId]);
  return rows[0] || null;
}

async function updateStatus(client, orderId, status) {
  const { rows } = await client.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, orderId]
  );
  return rows[0];
}

async function restockOrderItems(client, orderId) {
  const { rows: items } = await client.query(
    "SELECT product_id, quantity FROM order_items WHERE order_id = $1",
    [orderId]
  );
  for (const item of items) {
    await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, item.product_id]);
  }
}

async function findStatusHistory(orderId) {
  const { rows } = await query(
    `SELECT h.status, h.note, h.updated_at, u.name AS updated_by_name
     FROM order_status_history h
     LEFT JOIN users u ON u.id = h.updated_by
     WHERE h.order_id = $1
     ORDER BY h.updated_at ASC`,
    [orderId]
  );
  return rows;
}

module.exports = {
  lockCartForCheckout, insertOrder, insertOrderItems, insertStatusHistory,
  decrementStock, clearCart, findByUser, findAll, findById, findItems, findStatusHistory,
  lockOrder, updateStatus, restockOrderItems, findByIdWithClient,
};
