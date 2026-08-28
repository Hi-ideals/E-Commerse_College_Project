// Mirrors backend/.env FLAT_SHIPPING_FEE — shown ahead of checkout since it's
// deterministic (flat fee on every order). The actual charge applied is
// still computed server-side; this is display-only.
export const SHIPPING_FEE = 40;

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount ?? 0);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  "Out for Delivery": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export const NEXT_STATUS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped", "Cancelled"],
  Shipped: ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
};
