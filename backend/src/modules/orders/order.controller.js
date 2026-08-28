const asyncHandler = require("../../utils/asyncHandler");
const service = require("./order.service");

const checkout = asyncHandler(async (req, res) => {
  const order = await service.checkout(req.user.id, req.body);
  res.status(201).json({ success: true, data: order });
});

const listMine = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await service.getUserOrders(req.user.id, { page, limit });
  res.json({
    success: true,
    data: { items: result.items, page: result.page, totalPages: result.totalPages, totalItems: result.total },
  });
});

const listAll = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await service.getAllOrders({ page, limit, status });
  res.json({
    success: true,
    data: { items: result.items, page: result.page, totalPages: result.totalPages, totalItems: result.total },
  });
});

const getById = asyncHandler(async (req, res) => {
  const enforceOwnership = req.user.role !== "admin";
  const order = await service.getOrderById(req.params.id, req.user.id, enforceOwnership);
  res.json({ success: true, data: order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await service.updateOrderStatus(req.params.id, status, note, req.user.id);
  res.json({ success: true, data: order });
});

// Tracking is the same status-history timeline, exposed as its own
// lightweight endpoint for a dedicated "track my parcel" screen.
const tracking = asyncHandler(async (req, res) => {
  const enforceOwnership = req.user.role !== "admin";
  const order = await service.getOrderById(req.params.id, req.user.id, enforceOwnership);
  res.json({
    success: true,
    data: { orderId: order.id, status: order.status, statusHistory: order.statusHistory },
  });
});

module.exports = { checkout, listMine, listAll, getById, updateStatus, tracking };
