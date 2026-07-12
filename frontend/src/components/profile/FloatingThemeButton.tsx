import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../hooks/useTheme";

export function FloatingThemeButton() {
  const { toggleTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.96] ${
        isDark
          ? "border-primary/45 bg-surface-dark/85 text-on-dark shadow-[0_8px_24px_color-mix(in_oklab,var(--color-primary)_35%,transparent)]"
          : "border-hairline/70 bg-surface-card/85 text-ink shadow-elevated"
      }`}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      aria-pressed={isDark}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? "bg-primary/25 opacity-100"
            : "bg-overlay-bg opacity-70 group-hover:opacity-100"
        }`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-[3px] rounded-full border transition-colors duration-500 ${
          isDark ? "border-primary/35" : "border-overlay-border/70"
        }`}
      />

      <span className="relative z-10 h-5 w-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark
              ? "rotate-90 scale-50 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
          strokeWidth={1.9}
          aria-hidden="true"
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-50 opacity-0"
          }`}
          strokeWidth={1.9}
          aria-hidden="true"
        />
      </span>

    </button>
  );
}
