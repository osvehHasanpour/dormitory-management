import { Moon, Sparkles } from "lucide-react";

import { useTheme } from "../../hooks/useTheme";

export function FloatingThemeButton() {
  const { toggleTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-hairline/70 bg-surface-card/85 text-ink shadow-elevated backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-canvas active:translate-y-0 active:scale-[0.97] active:bg-surface-card"
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      aria-pressed={isDark}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-overlay-bg opacity-70 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[3px] rounded-full border border-overlay-border/70"
      />
      <Moon className="relative z-10 h-5 w-5" strokeWidth={1.9} aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute left-2 top-2 z-10 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-canvas/85 ring-1 ring-hairline/70 transition-transform duration-200 group-hover:scale-110"
      >
        <Sparkles className="h-2.5 w-2.5 text-primary" strokeWidth={2.4} />
      </span>
    </button>
  );
}
