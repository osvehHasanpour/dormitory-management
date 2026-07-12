import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const THEME_TRANSITION_CLASS = "theme-switching";
const THEME_TRANSITION_DURATION_MS = 420;
let themeTransitionTimer: number | undefined;

function applyThemeClass(
  resolvedTheme: "light" | "dark",
  options?: { animate?: boolean },
) {
  if (typeof document === "undefined") {
    return;
  }

  const shouldAnimate = options?.animate ?? false;
  const root = document.documentElement;

  if (!shouldAnimate) {
    root.classList.toggle("dark", resolvedTheme === "dark");
    return;
  }

  root.classList.add(THEME_TRANSITION_CLASS);
  // Ensure transition class is applied before toggling theme class.
  void root.offsetWidth;
  root.classList.toggle("dark", resolvedTheme === "dark");

  if (typeof window !== "undefined") {
    if (themeTransitionTimer !== undefined) {
      window.clearTimeout(themeTransitionTimer);
    }
    themeTransitionTimer = window.setTimeout(() => {
      root.classList.remove(THEME_TRANSITION_CLASS);
    }, THEME_TRANSITION_DURATION_MS);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readStoredPreference);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const hasMountedRef = useRef(false);

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
    if (!hasMountedRef.current) {
      applyThemeClass(resolvedTheme);
      hasMountedRef.current = true;
      return;
    }

    applyThemeClass(resolvedTheme, { animate: true });
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
