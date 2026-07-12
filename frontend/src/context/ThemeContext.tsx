import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  SYSTEM_DARK_QUERY,
  THEME_STORAGE_KEY,
  ThemeContext,
  getSystemTheme,
  isThemePreference,
  readStoredPreference,
  resolveTheme,
} from "./themeContext";

function applyThemeClass(resolvedTheme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleSchemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    mediaQueryList.addEventListener("change", handleSchemeChange);
    return () => {
      mediaQueryList.removeEventListener("change", handleSchemeChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      setPreference(isThemePreference(event.newValue) ? event.newValue : "system");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // ignore storage failures
    }
  }, [preference]);

  const resolvedTheme = resolveTheme(preference, systemTheme);

  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const handleToggleTheme = useCallback(() => {
    setPreference((currentPreference) => {
      const currentResolved = resolveTheme(currentPreference, getSystemTheme());
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setPreference,
      toggleTheme: handleToggleTheme,
    }),
    [preference, resolvedTheme, handleToggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
