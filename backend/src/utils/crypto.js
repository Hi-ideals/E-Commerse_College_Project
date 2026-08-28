const crypto = require("crypto");

/**
 * One-way hash of a refresh token before persisting it, so a DB leak
 * doesn't expose usable tokens (mirrors password-hashing hygiene).
 */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = { hashToken };
