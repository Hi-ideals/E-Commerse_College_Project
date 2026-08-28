import api from "./axiosClient";

export const productsApi = {
  list: (params) => api.get("/products", { params }).then((r) => r.data.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data.data),
  create: (formData) =>
    api
      .post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.data),
  update: (id, formData) =>
    api
      .put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data.data),
};

export const categoriesApi = {
  list: () => api.get("/categories").then((r) => r.data.data),
  create: (name) => api.post("/categories", { name }).then((r) => r.data.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data.data),
};
