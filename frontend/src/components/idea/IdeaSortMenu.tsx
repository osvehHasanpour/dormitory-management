import { useEffect, useRef, useState } from "react";

import { ideaSortOptions } from "../../data/ideaItems";
import type { IdeaOrdering } from "../../types/idea";

interface IdeaSortMenuProps {
  activeOrdering: IdeaOrdering;
  onChange: (ordering: IdeaOrdering) => void;
}

function SortIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 7H16M4 12H13M4 17H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 7V17M18 17L15 14M18 17L21 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IdeaSortMenu({ activeOrdering, onChange }: IdeaSortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (ordering: IdeaOrdering) => {
    onChange(ordering);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="absolute left-4 top-5 z-20 sm:left-6">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-ink backdrop-blur-sm active:bg-white/45"
        aria-label="مرتب‌سازی ایده‌ها"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <SortIcon className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 min-w-[10.5rem] overflow-hidden rounded-md border border-hairline bg-white/95 py-1 text-right shadow-elevated backdrop-blur-md"
        >
          {ideaSortOptions.map((option) => {
            const isActive = option.value === activeOrdering;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-4 py-2.5 text-right text-body-sm transition-colors ${
                  isActive
                    ? "bg-primary/20 font-bold text-ink"
                    : "text-body-text hover:bg-primary/10"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
