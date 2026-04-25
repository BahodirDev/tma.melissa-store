import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { clearUserBrief, readUserBrief, storeUserBrief } from "../api/routes";
import type { UserBrief } from "../types/api";
import {
  api,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  unwrapError,
} from "../api/client";
import type { LoginResponse } from "../types/api";

type AuthValue = {
  user: UserBrief | null;
  isReady: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserBrief | null>(readUserBrief());
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(() => {
    const t = getStoredToken();
    if (!t) {
      setUser(null);
      clearUserBrief();
      return;
    }
    const u = readUserBrief();
    setUser(u);
  }, []);

  useEffect(() => {
    setIsReady(true);
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onOut = () => {
      setUser(null);
    };
    window.addEventListener("melissa:logout", onOut);
    return () => window.removeEventListener("melissa:logout", onOut);
  }, []);

  const login = useCallback(async (user_login: string, user_password: string) => {
    try {
      const { data } = await api.post<LoginResponse>("auth/auth-user", {
        user_login,
        user_password,
      });
      if (!data?.token) {
        throw new Error(data?.message || "Kirish bajarilmadi");
      }
      setStoredToken(data.token);
      storeUserBrief(data.user);
      setUser(data.user);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const b = e.response.data as { message?: string; error?: string };
        if (b.message) throw new Error(b.message);
      }
      throw new Error(unwrapError(e));
    }
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    clearUserBrief();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, logout, refresh }),
    [user, isReady, login, logout, refresh]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

export function useRequireAuth() {
  const { user, isReady } = useAuth();
  return { user, isReady, authed: Boolean(user) };
}
