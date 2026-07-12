import type { ReactNode } from "react";

export interface ScrollableTabItem<T extends string> {
  value: T;
  label: string;
}

interface ScrollableTabsProps<T extends string> {
  tabs: readonly ScrollableTabItem<T>[];
  activeValue: T;
  onChange: (value: T) => void;
  variant?: "underline" | "pill";
  className?: string;
  renderTab?: (tab: ScrollableTabItem<T>, isActive: boolean) => ReactNode;
}

export function ScrollableTabs<T extends string>({
  tabs,
  activeValue,
  onChange,
  variant = "underline",
  className = "",
  renderTab,
}: ScrollableTabsProps<T>) {
  const isPill = variant === "pill";

  return (
    <div
      className={`-mx-4 overflow-x-auto px-4 scrollbar-hide sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 ${className}`}
    >
      <div
        className={`flex min-w-max gap-2 ${isPill ? "gap-2" : "gap-5 border-b border-hairline px-1"}`}
        role="tablist"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeValue;

          if (renderTab) {
            return (
              <div key={tab.value} role="presentation">
                {renderTab(tab, isActive)}
              </div>
            );
          }

          if (isPill) {
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(tab.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-caption-md font-bold transition-colors ${
                  isActive
                    ? "bg-surface-dark text-on-dark"
                    : "bg-surface-card text-mute hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            );
          }

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={`relative shrink-0 pb-3 text-caption-md font-bold transition-colors ${
                isActive ? "text-ink" : "text-mute hover:text-ink"
              }`}
            >
              {tab.label}
              {isActive ? (
                <span
                  className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
