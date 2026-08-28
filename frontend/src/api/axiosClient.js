import axios from "axios";

// Access token lives only in memory (never localStorage) — the refresh
// token is an httpOnly cookie the browser sends automatically, so it's
// never reachable from JS at all.
let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** Registered once by AuthContext so a failed refresh can force a logout. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // send the httpOnly refresh cookie
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  // De-dupe concurrent 401s into a single refresh call.
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/auth/refresh", {}, { withCredentials: true })
      .then((res) => {
        const token = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthRoute = original?.url?.startsWith("/auth/");

    if (status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshErr) {
        setAccessToken(null);
        if (onUnauthorized) onUnauthorized();
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

/** Normalizes our API's error envelope into a plain message string. */
export function extractErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.error?.message || error?.message || fallback;
}

export default api;
