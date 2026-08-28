const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/apiError");
const repo = require("./category.repository");

const list = asyncHandler(async (req, res) => {
  const categories = await repo.findAll();
  res.json({ success: true, data: categories });
});

const create = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) throw ApiError.badRequest("Category name is required");

  const existing = await repo.findByName(name.trim());
  if (existing) throw ApiError.conflict("Category already exists");

  const category = await repo.create(name.trim());
  res.status(201).json({ success: true, data: category });
});

const remove = asyncHandler(async (req, res) => {
  const category = await repo.findById(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");
  await repo.remove(req.params.id);
  res.json({ success: true, data: { message: "Category deleted" } });
});

module.exports = { list, create, remove };
