const bcrypt = require("bcrypt");
const ms = require("../../utils/parseDuration");
const env = require("../../config/env");
const ApiError = require("../../utils/apiError");
const { hashToken } = require("../../utils/crypto");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const repo = require("./auth.repository");

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    createdAt: user.created_at,
  };
}

function issueTokens(user) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

async function register({ name, email, username, password }) {
  const [existingEmail, existingUsername] = await Promise.all([
    repo.findByEmail(email),
    repo.findByUsername(username),
  ]);
  if (existingEmail) throw ApiError.conflict("Email is already registered");
  if (existingUsername) throw ApiError.conflict("Username is already taken");

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  const user = await repo.createUser({ name, email, username, passwordHash, role: "user" });
  return toPublicUser(user);
}

async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user || !user.is_active) throw ApiError.unauthorized("Invalid email or password");

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized("Invalid email or password");

  const { accessToken, refreshToken } = issueTokens(user);
  await repo.storeRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + ms(env.jwtRefreshExpiry)),
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function refresh(oldRefreshToken) {
  if (!oldRefreshToken) throw ApiError.unauthorized("Missing refresh token");

  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const tokenHash = hashToken(oldRefreshToken);
  const stored = await repo.findRefreshToken(tokenHash);
  if (!stored) throw ApiError.unauthorized("Refresh token has been revoked or reused");

  const user = await repo.findById(payload.sub);
  if (!user || !user.is_active) throw ApiError.unauthorized("Account no longer active");

  // Rotate: revoke the used token, issue a brand new pair.
  await repo.revokeRefreshToken(tokenHash);
  const { accessToken, refreshToken } = issueTokens(user);
  await repo.storeRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + ms(env.jwtRefreshExpiry)),
  });

  return { user: toPublicUser(user), accessToken, refreshToken };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await repo.revokeRefreshToken(hashToken(refreshToken));
}

module.exports = { register, login, refresh, logout, toPublicUser };
