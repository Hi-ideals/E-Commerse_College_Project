const ApiError = require("../../utils/apiError");
const repo = require("./product.repository");
const categoryRepo = require("../categories/category.repository");
const { toPublicProduct } = require("./product.mapper");

async function list(filters) {
  const result = await repo.findMany(filters);
  return { ...result, items: result.items.map(toPublicProduct) };
}

async function getById(id) {
  const product = await repo.findById(id);
  if (!product || !product.is_active) throw ApiError.notFound("Product not found");
  return toPublicProduct(product);
}

async function create({ name, description, price, stock, categoryId, imageUrl, createdBy }) {
  if (categoryId) {
    const category = await categoryRepo.findById(categoryId);
    if (!category) throw ApiError.badRequest("categoryId does not reference an existing category");
  }
  const created = await repo.create({ name, description, price, stock, categoryId, imageUrl, createdBy });
  const product = await repo.findById(created.id); // re-fetch with category join
  return toPublicProduct(product);
}

async function update(id, fields) {
  const existing = await repo.findById(id);
  if (!existing) throw ApiError.notFound("Product not found");

  if (fields.categoryId) {
    const category = await categoryRepo.findById(fields.categoryId);
    if (!category) throw ApiError.badRequest("categoryId does not reference an existing category");
  }

  const dbFields = {
    name: fields.name,
    description: fields.description,
    price: fields.price,
    stock: fields.stock,
    category_id: fields.categoryId,
    image_url: fields.imageUrl,
    is_active: fields.isActive,
  };
  const updated = await repo.update(id, dbFields);
  const fresh = await repo.findById(updated.id); // re-fetch with category join
  return toPublicProduct(fresh);
}

async function softDelete(id) {
  const existing = await repo.findById(id);
  if (!existing) throw ApiError.notFound("Product not found");
  await repo.softDelete(id);
  return { message: "Product deactivated" };
}

module.exports = { list, getById, create, update, softDelete };
