const asyncHandler = require("../../utils/asyncHandler");
const service = require("./product.service");

const list = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, page, limit, includeInactive } = req.query;
  // Only an authenticated admin may opt into seeing deactivated products —
  // never honored for public/anonymous or non-admin requests.
  const canSeeInactive = req.user?.role === "admin" && includeInactive === "true";
  const result = await service.list({
    category, search, minPrice, maxPrice, page, limit, includeInactive: canSeeInactive,
  });
  res.json({
    success: true,
    data: {
      items: result.items,
      page: result.page,
      totalPages: result.totalPages,
      totalItems: result.total,
    },
  });
});

const getById = asyncHandler(async (req, res) => {
  const product = await service.getById(req.params.id);
  res.json({ success: true, data: product });
});

const create = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : req.body.imageUrl || null;

  const product = await service.create({
    name, description, price, stock, categoryId, imageUrl, createdBy: req.user.id,
  });
  res.status(201).json({ success: true, data: product });
});

const update = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, isActive } = req.body;
  const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : req.body.imageUrl;

  const product = await service.update(req.params.id, {
    name, description, price, stock, categoryId, imageUrl, isActive,
  });
  res.json({ success: true, data: product });
});

const remove = asyncHandler(async (req, res) => {
  const result = await service.softDelete(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { list, getById, create, update, remove };
