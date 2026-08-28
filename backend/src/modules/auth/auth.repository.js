const { query } = require("../../config/db");

async function findByEmail(email) {
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

async function findByUsername(username) {
  const { rows } = await query("SELECT * FROM users WHERE username = $1", [username]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

async function createUser({ name, email, username, passwordHash, role = "user" }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, username, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, username, role, created_at`,
    [name, email, username, passwordHash, role]
  );
  return rows[0];
}

async function storeRefreshToken({ userId, tokenHash, expiresAt }) {
  const { rows } = await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3) RETURNING id`,
    [userId, tokenHash, expiresAt]
  );
  return rows[0];
}

async function findRefreshToken(tokenHash) {
  const { rows } = await query(
    `SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked = FALSE AND expires_at > now()`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function revokeRefreshToken(tokenHash) {
  await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1`, [tokenHash]);
}

async function revokeAllUserTokens(userId) {
  await query(`UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`, [userId]);
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUser,
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
