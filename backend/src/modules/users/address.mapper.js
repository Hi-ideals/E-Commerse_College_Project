function toPublicAddress(row) {
  return {
    id: row.id,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

module.exports = { toPublicAddress };
