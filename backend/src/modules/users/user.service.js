const bcrypt = require("bcrypt");
const env = require("../../config/env");
const ApiError = require("../../utils/apiError");
const { withTransaction } = require("../../config/db");
const repo = require("./user.repository");
const { toPublicAddress } = require("./address.mapper");

function toPublicUser(row) {
  return {
    id: row.id, name: row.name, email: row.email, username: row.username,
    role: row.role, createdAt: row.created_at,
  };
}

async function getProfile(userId) {
  const user = await repo.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return toPublicUser(user);
}

async function updateProfile(userId, { name }) {
  const updated = await repo.updateName(userId, name);
  return toPublicUser(updated);
}

async function changePassword(userId, currentPassword, newPassword) {
  const hash = await repo.findPasswordHash(userId);
  if (!hash) throw ApiError.notFound("User not found");

  const match = await bcrypt.compare(currentPassword, hash);
  if (!match) throw ApiError.unauthorized("Current password is incorrect");

  const newHash = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
  await repo.updatePasswordHash(userId, newHash);
  return { message: "Password updated" };
}

// ---------------------------------------------------------------- addresses
async function listAddresses(userId) {
  const rows = await repo.listAddresses(userId);
  return rows.map(toPublicAddress);
}

async function createAddress(userId, fields) {
  const created = await withTransaction(async (client) => {
    if (fields.isDefault) {
      await repo.unsetDefaultAddresses(client, userId);
    }
    return repo.createAddress(client, userId, fields);
  });
  return toPublicAddress(created);
}

async function updateAddress(userId, addressId, fields) {
  const existing = await repo.findAddress(userId, addressId);
  if (!existing) throw ApiError.notFound("Address not found");

  const updated = await withTransaction(async (client) => {
    if (fields.isDefault) {
      await repo.unsetDefaultAddresses(client, userId);
    }
    return repo.updateAddress(client, userId, addressId, fields);
  });
  return toPublicAddress(updated);
}

async function deleteAddress(userId, addressId) {
  const removed = await repo.deleteAddress(userId, addressId);
  if (!removed) throw ApiError.notFound("Address not found");
  return { message: "Address deleted" };
}

module.exports = {
  getProfile, updateProfile, changePassword,
  listAddresses, createAddress, updateAddress, deleteAddress,
};
