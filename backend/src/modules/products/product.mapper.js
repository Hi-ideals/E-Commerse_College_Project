/**
 * Shapes a DB row (snake_case, joined category columns) into the API's
 * camelCase response contract.
 */
function toPublicProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    stock: row.stock,
    imageUrl: row.image_url,
    isActive: row.is_active,
    category: row.category_id
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { toPublicProduct };
