const asyncHandler = require("../../utils/asyncHandler");
const service = require("./user.service");

const getMe = asyncHandler(async (req, res) => {
  const profile = await service.getProfile(req.user.id);
  res.json({ success: true, data: profile });
});

const updateMe = asyncHandler(async (req, res) => {
  const profile = await service.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: profile });
});

const changePassword = asyncHandler(async (req, res) => {
  const result = await service.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
  res.json({ success: true, data: result });
});

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await service.listAddresses(req.user.id);
  res.json({ success: true, data: addresses });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await service.createAddress(req.user.id, req.body);
  res.status(201).json({ success: true, data: address });
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await service.updateAddress(req.user.id, req.params.id, req.body);
  res.json({ success: true, data: address });
});

const removeAddress = asyncHandler(async (req, res) => {
  const result = await service.deleteAddress(req.user.id, req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { getMe, updateMe, changePassword, listAddresses, createAddress, updateAddress, removeAddress };
