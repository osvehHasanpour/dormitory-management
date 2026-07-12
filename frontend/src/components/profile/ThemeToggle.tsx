import type { ThemePreference } from "../../context/themeContext";
import { useTheme } from "../../hooks/useTheme";

const options: Array<{ value: ThemePreference; label: string }> = [
  { value: "light", label: "روشن" },
  { value: "dark", label: "تاریک" },
  { value: "system", label: "سیستم" },
];

export function ThemeToggle() {
  const { preference, setPreference, resolvedTheme } = useTheme();

  return (
    <section
      className="glass-card rounded-lg p-4 dark:bg-canvas/95"
      aria-label="تنظیم حالت نمایش"
    >
      <p className="text-body-sm-strong text-ink">حالت نمایش</p>
      <p className="mt-1 text-caption-md text-mute">
        تغییرات بدون نیاز به بارگذاری مجدد اعمال می‌شود.
      </p>

      <div
        role="radiogroup"
        aria-label="انتخاب تم"
        className="mt-3 grid grid-cols-3 gap-1 rounded-md bg-surface-card p-1"
      >
        {options.map((option) => {
          const isSelected = preference === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setPreference(option.value)}
              className={`rounded-md px-2 py-2 text-button-sm transition-colors ${
                isSelected
                  ? "bg-primary text-on-primary"
                  : "text-mute hover:bg-canvas active:bg-canvas dark:hover:bg-surface-soft dark:active:bg-surface-soft"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-caption-sm text-mute">
        تم فعال: {resolvedTheme === "dark" ? "تاریک" : "روشن"}
      </p>
    </section>
  );
}
