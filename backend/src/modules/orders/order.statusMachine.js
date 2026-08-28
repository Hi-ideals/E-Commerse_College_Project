/**
 * Defines every legal order-status transition. Enforced server-side so an
 * admin client can never push an order through an invalid jump (e.g.
 * Pending -> Delivered) regardless of what the UI sends.
 */
const ALLOWED_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

// Cancelling before the order has shipped means stock should be restored.
const RESTOCK_ELIGIBLE_STATUSES = new Set(["Pending", "Confirmed"]);

function assertValidTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    const err = new Error(
      allowed.length
        ? `Cannot move order from "${currentStatus}" to "${nextStatus}". Allowed next step(s): ${allowed.join(", ")}`
        : `Order is in a terminal state ("${currentStatus}") and cannot be changed`
    );
    err.code = "INVALID_TRANSITION";
    throw err;
  }
}

function shouldRestock(currentStatus, nextStatus) {
  return nextStatus === "Cancelled" && RESTOCK_ELIGIBLE_STATUSES.has(currentStatus);
}

module.exports = { ALLOWED_TRANSITIONS, assertValidTransition, shouldRestock };
