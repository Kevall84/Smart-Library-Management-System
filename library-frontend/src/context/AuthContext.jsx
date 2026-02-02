import { useEffect, useState } from "react";
import { authApi } from "../api/auth";
import { TOKEN_KEY, USER_KEY, safeJsonParse } from "./authStorage";
import AuthContext from "./AuthContextContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = safeJsonParse(localStorage.getItem(USER_KEY));
    return cached || null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [loading, setLoading] = useState(false);

  const setSession = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  };

  // Best-effort session refresh on app load
  useEffect(() => {
    const boot = async () => {
      if (!token) return;
      try {
        const res = await authApi.me();
        const nextUser = res?.data?.user || res?.user || null;
        if (nextUser) setSession(nextUser, token);
      } catch {
        setSession(null, null);
      }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const nextUser = res?.data?.user || res?.user;
      const nextToken = res?.data?.token || res?.token;
      if (!nextUser || !nextToken) {
        throw new Error("Invalid login response");
      }
      setSession(nextUser, nextToken);
      return nextUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await authApi.register(payload);
      const nextUser = res?.data?.user || res?.user;
      const nextToken = res?.data?.token || res?.token;
      if (nextUser && nextToken) {
        setSession(nextUser, nextToken);
      }
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore
    } finally {
      setSession(null, null);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    setUser, // for profile updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
