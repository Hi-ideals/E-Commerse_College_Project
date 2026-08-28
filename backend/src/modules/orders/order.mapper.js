function toPublicOrderSummary(row) {
  return {
    id: row.id,
    status: row.status,
    // Prices are tax-inclusive, so no tax field is exposed — only subtotal,
    // the flat shipping charge, and the final total.
    subtotal: row.subtotal_amount !== undefined ? Number(row.subtotal_amount) : undefined,
    shipping: row.shipping_amount !== undefined ? Number(row.shipping_amount) : undefined,
    totalAmount: Number(row.total_amount),
    paymentMethod: row.payment_method,
    customer: row.customer_name ? { name: row.customer_name, email: row.customer_email } : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPublicOrderDetail(order, items, history) {
  return {
    ...toPublicOrderSummary(order),
    shippingAddress: order.shipping_address,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      name: i.product_name,
      quantity: i.quantity,
      price: Number(i.price),
      lineTotal: Number((i.price * i.quantity).toFixed(2)),
    })),
    statusHistory: history.map((h) => ({
      status: h.status,
      note: h.note,
      updatedAt: h.updated_at,
      updatedBy: h.updated_by_name || null,
    })),
  };
}

module.exports = { toPublicOrderSummary, toPublicOrderDetail };
