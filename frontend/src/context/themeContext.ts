import { createContext } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (nextPreference: ThemePreference) => void;
  toggleTheme: () => void;
}

export const THEME_STORAGE_KEY = "dormitory_theme_preference";
export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

export function isThemePreference(
  value: string | null,
): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
}

export function readStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedValue) ? storedValue : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(
  preference: ThemePreference,
  systemTheme: ResolvedTheme,
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}
