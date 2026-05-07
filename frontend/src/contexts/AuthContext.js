import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setHydrated(true);
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const login = useCallback(
    async (email, senha) => {
      const response = await api.post("/auth/login", { email, senha });
      persistSession(response.data);
      router.push("/dashboard");
    },
    [persistSession, router]
  );

  const register = useCallback(
    async (payload) => {
      const response = await api.post("/auth/register", payload);
      persistSession(response.data);
      router.push("/dashboard");
    },
    [persistSession, router]
  );

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const value = useMemo(
    () => ({ token, user, hydrated, login, register, logout, updateUser, isAuthenticated: Boolean(token) }),
    [token, user, hydrated, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
