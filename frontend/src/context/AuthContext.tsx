import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AuthTokens, AuthUser } from "../types/auth";
import { AuthContext } from "./authContext";

const ACCESS_TOKEN_KEY = "dormitory_access_token";
const REFRESH_TOKEN_KEY = "dormitory_refresh_token";
const USER_KEY = "dormitory_user";
const TOKENS_UPDATED_EVENT = "dormitory-auth:tokens-updated";
const LOGGED_OUT_EVENT = "dormitory-auth:logged-out";

function readStoredAuth(): {
  tokens: AuthTokens | null;
  user: AuthUser | null;
} {
  try {
    const access = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!access || !refresh || !storedUser) {
      return { tokens: null, user: null };
    }

    return {
      tokens: { access, refresh },
      user: JSON.parse(storedUser) as AuthUser,
    };
  } catch {
    return { tokens: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedAuth] = useState(readStoredAuth);
  const [user, setUser] = useState<AuthUser | null>(storedAuth.user);
  const [tokens, setTokens] = useState<AuthTokens | null>(storedAuth.tokens);

  const login = useCallback((nextTokens: AuthTokens, nextUser: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, nextTokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, nextTokens.refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setTokens(nextTokens);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setTokens(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const syncTokensFromStorage = () => {
      try {
        const access = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!access || !refresh) return;
        setTokens((current) => {
          if (current?.access === access && current?.refresh === refresh) {
            return current;
          }
          return { access, refresh };
        });
      } catch {
        // ignore storage failures
      }
    };

    const handleTokensUpdated = () => syncTokensFromStorage();
    const handleLoggedOut = () => logout();

    window.addEventListener(TOKENS_UPDATED_EVENT, handleTokensUpdated);
    window.addEventListener(LOGGED_OUT_EVENT, handleLoggedOut);

    return () => {
      window.removeEventListener(TOKENS_UPDATED_EVENT, handleTokensUpdated);
      window.removeEventListener(LOGGED_OUT_EVENT, handleLoggedOut);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(tokens?.access && user),
      login,
      logout,
    }),
    [user, tokens, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
