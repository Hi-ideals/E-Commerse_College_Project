const asyncHandler = require("../../utils/asyncHandler");
const service = require("./cart.service");

const getCart = asyncHandler(async (req, res) => {
  const cart = await service.getCart(req.user.id);
  res.json({ success: true, data: cart });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await service.addItem(req.user.id, productId, quantity);
  res.status(201).json({ success: true, data: cart });
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await service.updateQuantity(req.user.id, req.params.id, req.body.quantity);
  res.json({ success: true, data: cart });
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await service.removeItem(req.user.id, req.params.id);
  res.json({ success: true, data: cart });
});

module.exports = { getCart, addItem, updateItem, removeItem };
