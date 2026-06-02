import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authService, tokenStorage } from "../services/auth";
import type { User } from "../services/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, first_name?: string, last_name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) { setLoading(false); return; }
    authService.me()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const tokens = await authService.login({ username, password });
    tokenStorage.set(tokens);
    setUser(tokens.user);
  }, []);

  const register = useCallback(async (
    username: string, email: string, password: string,
    first_name = "", last_name = ""
  ) => {
    await authService.register({ username, email, password, first_name, last_name });
    // Auto-login after register
    const tokens = await authService.login({ username, password });
    tokenStorage.set(tokens);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
