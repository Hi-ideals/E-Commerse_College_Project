import api from "./axiosClient";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data.data),
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data.data),
  refresh: () => api.post("/auth/refresh").then((r) => r.data.data),
  logout: () => api.post("/auth/logout").then((r) => r.data.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
};
