import api from "./axiosClient";

export const usersApi = {
  getMe: () => api.get("/users/me").then((r) => r.data.data),
  updateMe: (payload) => api.put("/users/me", payload).then((r) => r.data.data),
  changePassword: (payload) => api.put("/users/me/password", payload).then((r) => r.data.data),
  listAddresses: () => api.get("/users/me/addresses").then((r) => r.data.data),
  createAddress: (payload) => api.post("/users/me/addresses", payload).then((r) => r.data.data),
  updateAddress: (id, payload) => api.put(`/users/me/addresses/${id}`, payload).then((r) => r.data.data),
  removeAddress: (id) => api.delete(`/users/me/addresses/${id}`).then((r) => r.data.data),
};
