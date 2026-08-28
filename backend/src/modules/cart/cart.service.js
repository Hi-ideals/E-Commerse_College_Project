const ApiError = require("../../utils/apiError");
const productRepo = require("../products/product.repository");
const repo = require("./cart.repository");

function toPublicCartItem(row) {
  return {
    id: row.id,
    quantity: row.quantity,
    product: {
      id: row.product_id,
      name: row.name,
      price: Number(row.price),
      stock: row.stock,
      imageUrl: row.image_url,
      isActive: row.is_active,
    },
    lineTotal: Number((row.price * row.quantity).toFixed(2)),
  };
}

function summarize(items) {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
  };
}

async function getCart(userId) {
  const rows = await repo.findByUser(userId);
  return summarize(rows.map(toPublicCartItem));
}

async function addItem(userId, productId, quantity) {
  const product = await productRepo.findById(productId);
  if (!product || !product.is_active) throw ApiError.notFound("Product not found");

  const existing = await repo.findByUserAndProduct(userId, productId);
  const prospectiveQty = (existing?.quantity || 0) + quantity;
  if (prospectiveQty > product.stock) {
    throw ApiError.conflict(
      `Only ${product.stock} unit(s) of "${product.name}" available`,
      { available: product.stock }
    );
  }

  await repo.upsertAdd(userId, productId, quantity);
  return getCart(userId);
}

async function updateQuantity(userId, cartItemId, quantity) {
  const item = await repo.findOne(userId, cartItemId);
  if (!item) throw ApiError.notFound("Cart item not found");
  if (!item.is_active) throw ApiError.conflict("This product is no longer available");
  if (quantity > item.stock) {
    throw ApiError.conflict(`Only ${item.stock} unit(s) available`, { available: item.stock });
  }

  await repo.setQuantity(cartItemId, userId, quantity);
  return getCart(userId);
}

async function removeItem(userId, cartItemId) {
  const removed = await repo.remove(cartItemId, userId);
  if (!removed) throw ApiError.notFound("Cart item not found");
  return getCart(userId);
}

module.exports = { getCart, addItem, updateQuantity, removeItem };
