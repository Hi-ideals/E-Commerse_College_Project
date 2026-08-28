const ApiError = require("../../utils/apiError");
const env = require("../../config/env");
const { withTransaction } = require("../../config/db");
const repo = require("./order.repository");
const { toPublicOrderSummary, toPublicOrderDetail } = require("./order.mapper");
const { assertValidTransition, shouldRestock } = require("./order.statusMachine");
const invoiceService = require("../invoices/invoice.service");
const userRepo = require("../users/user.repository");

function round2(n) {
  return Math.round(n * 100) / 100;
}

function validateShippingAddress(addr) {
  if (!addr || typeof addr !== "object") {
    throw ApiError.badRequest("shippingAddress is required");
  }
  const required = ["line1", "city", "postalCode", "country"];
  const missing = required.filter((f) => !addr[f] || !String(addr[f]).trim());
  if (missing.length) {
    throw ApiError.badRequest(`shippingAddress is missing: ${missing.join(", ")}`);
  }
}

/**
 * Checkout: converts the caller's cart into an order inside a single DB
 * transaction. Cart/product rows are locked (FOR UPDATE) so concurrent
 * checkouts can never oversell stock; stock is decremented atomically
 * with the order insert, and the cart is cleared only on success.
 */
async function checkout(userId, { addressId, shippingAddress, paymentMethod = "COD" }) {
  if (addressId) {
    const saved = await userRepo.findAddress(userId, addressId);
    if (!saved) throw ApiError.badRequest("addressId does not reference one of your saved addresses");
    shippingAddress = {
      label: saved.label, line1: saved.line1, line2: saved.line2,
      city: saved.city, state: saved.state, postalCode: saved.postal_code, country: saved.country,
    };
  }
  validateShippingAddress(shippingAddress);

  const result = await withTransaction(async (client) => {
    const cartRows = await repo.lockCartForCheckout(client, userId);

    if (cartRows.length === 0) {
      throw ApiError.badRequest("Your cart is empty");
    }

    for (const row of cartRows) {
      if (!row.is_active) {
        throw ApiError.conflict(`"${row.name}" is no longer available`);
      }
      if (row.stock < row.quantity) {
        throw ApiError.conflict(`Insufficient stock for "${row.name}" (only ${row.stock} left)`, {
          productId: row.product_id,
          available: row.stock,
        });
      }
    }

    // Prices are tax-inclusive — no separate tax line. Shipping is a flat
    // fee applied to every order.
    const subtotal = round2(cartRows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0));
    const tax = 0;
    const shipping = env.flatShippingFee;
    const total = round2(subtotal + shipping);

    const order = await repo.insertOrder(client, {
      userId, subtotal, tax, shipping, total, shippingAddress, paymentMethod,
    });

    await repo.insertOrderItems(client, order.id, cartRows);

    for (const row of cartRows) {
      await repo.decrementStock(client, row.product_id, row.quantity);
    }

    await repo.insertStatusHistory(client, order.id, "Pending", userId, "Order placed");
    await repo.clearCart(client, userId);

    const orderWithCustomer = await repo.findByIdWithClient(client, order.id);
    const invoiceItems = cartRows.map((r) => ({
      product_name: r.name, price: Number(r.price), quantity: r.quantity,
    }));
    await invoiceService.generateForOrder(client, orderWithCustomer, invoiceItems);

    return order;
  });

  return getOrderById(result.id, userId, false);
}

async function getUserOrders(userId, { page, limit } = {}) {
  const result = await repo.findByUser(userId, { page, limit });
  return { ...result, items: result.items.map(toPublicOrderSummary) };
}

async function getAllOrders({ page, limit, status } = {}) {
  const result = await repo.findAll({ page, limit, status });
  return { ...result, items: result.items.map(toPublicOrderSummary) };
}

/**
 * @param {boolean} enforceOwnership - when true, throws 404 if the order
 *   doesn't belong to userId (used for the User-facing route; Admin route
 *   passes false to view any order).
 */
async function getOrderById(orderId, userId, enforceOwnership = true) {
  const order = await repo.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");
  if (enforceOwnership && order.user_id !== userId) {
    throw ApiError.notFound("Order not found");
  }

  const [items, history] = await Promise.all([
    repo.findItems(orderId),
    repo.findStatusHistory(orderId),
  ]);

  return toPublicOrderDetail(order, items, history);
}

/**
 * Admin-only: advances an order to a new status, enforcing the legal
 * transition graph. Cancelling a not-yet-shipped order restores stock.
 * The order row is locked for the duration so two concurrent updates
 * can't both "win" against a stale current status.
 */
async function updateOrderStatus(orderId, nextStatus, note, updatedBy) {
  await withTransaction(async (client) => {
    const order = await repo.lockOrder(client, orderId);
    if (!order) throw ApiError.notFound("Order not found");

    try {
      assertValidTransition(order.status, nextStatus);
    } catch (err) {
      throw ApiError.badRequest(err.message);
    }

    await repo.updateStatus(client, orderId, nextStatus);
    await repo.insertStatusHistory(client, orderId, nextStatus, updatedBy, note || null);

    if (shouldRestock(order.status, nextStatus)) {
      await repo.restockOrderItems(client, orderId);
    }
  });

  return getOrderById(orderId, updatedBy, false);
}

module.exports = { checkout, getUserOrders, getAllOrders, getOrderById, updateOrderStatus };
