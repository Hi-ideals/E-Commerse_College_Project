import api from "./axiosClient";

export const ordersApi = {
  checkout: (payload) => api.post("/orders", payload).then((r) => r.data.data),
  listMine: (params) => api.get("/orders", { params }).then((r) => r.data.data),
  listAll: (params) => api.get("/orders/all", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data.data),
  getTracking: (id) => api.get(`/orders/${id}/tracking`).then((r) => r.data.data),
  updateStatus: (id, status, note) =>
    api.put(`/orders/${id}/status`, { status, note }).then((r) => r.data.data),
  invoiceUrl: (orderId) => `/api/invoices/${orderId}`,
};
