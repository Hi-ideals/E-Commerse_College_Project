import api from "./axiosClient";

export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data.data),
  add: (productId, quantity) => api.post("/cart", { productId, quantity }).then((r) => r.data.data),
  updateQuantity: (cartItemId, quantity) =>
    api.put(`/cart/${cartItemId}`, { quantity }).then((r) => r.data.data),
  remove: (cartItemId) => api.delete(`/cart/${cartItemId}`).then((r) => r.data.data),
};
