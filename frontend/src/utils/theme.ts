import { getSystemTheme, readStoredPreference, resolveTheme } from "../context/themeContext";

export function initializeThemeClass() {
  if (typeof document === "undefined") {
    return;
  }

  const initialPreference = readStoredPreference();
  const resolvedTheme = resolveTheme(initialPreference, getSystemTheme());
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}
