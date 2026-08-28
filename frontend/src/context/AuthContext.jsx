import { createContext, useContext, useEffect, useRef, useState } from "react";
import { authApi } from "../api/auth.api";
import { setAccessToken, setUnauthorizedHandler } from "../api/axiosClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    setUnauthorizedHandler(() => setUser(null));

    // Try to silently resume a session via the httpOnly refresh cookie.
    authApi
      .refresh()
      .then(({ user, accessToken }) => {
        setAccessToken(accessToken);
        setUser(user);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  async function login(email, password) {
    const { user, accessToken } = await authApi.login({ email, password });
    setAccessToken(accessToken);
    setUser(user);
    return user;
  }

  async function register(payload) {
    return authApi.register(payload);
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    initializing,
    login,
    register,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
