const { query } = require("../../config/db");

async function findById(id) {
  const { rows } = await query(
    "SELECT id, name, email, username, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return rows[0] || null;
}

async function findPasswordHash(id) {
  const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [id]);
  return rows[0]?.password_hash || null;
}

async function updateName(id, name) {
  const { rows } = await query(
    `UPDATE users SET name = $1 WHERE id = $2
     RETURNING id, name, email, username, role, created_at`,
    [name, id]
  );
  return rows[0];
}

async function updatePasswordHash(id, passwordHash) {
  await query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, id]);
}

// ---------------------------------------------------------------- addresses
async function listAddresses(userId) {
  const { rows } = await query(
    `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
  return rows;
}

async function findAddress(userId, addressId) {
  const { rows } = await query(
    "SELECT * FROM addresses WHERE id = $1 AND user_id = $2",
    [addressId, userId]
  );
  return rows[0] || null;
}

async function unsetDefaultAddresses(client, userId) {
  await client.query("UPDATE addresses SET is_default = FALSE WHERE user_id = $1", [userId]);
}

async function createAddress(client, userId, fields) {
  const { label, line1, line2, city, state, postalCode, country, isDefault } = fields;
  const { rows } = await client.query(
    `INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, label ?? null, line1, line2 ?? null, city, state ?? null, postalCode, country, !!isDefault]
  );
  return rows[0];
}

async function updateAddress(client, userId, addressId, fields) {
  const allowed = { label: "label", line1: "line1", line2: "line2", city: "city", state: "state", postalCode: "postal_code", country: "country", isDefault: "is_default" };
  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(allowed)) {
    if (fields[key] !== undefined) {
      params.push(fields[key]);
      sets.push(`${column} = $${params.length}`);
    }
  }
  if (sets.length === 0) return findAddress(userId, addressId);

  params.push(addressId, userId);
  const { rows } = await client.query(
    `UPDATE addresses SET ${sets.join(", ")} WHERE id = $${params.length - 1} AND user_id = $${params.length} RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function deleteAddress(userId, addressId) {
  const { rows } = await query(
    "DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id",
    [addressId, userId]
  );
  return rows[0] || null;
}

module.exports = {
  findById, findPasswordHash, updateName, updatePasswordHash,
  listAddresses, findAddress, unsetDefaultAddresses, createAddress, updateAddress, deleteAddress,
};
