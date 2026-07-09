import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | null;
  children: ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] animate-sheet-scrim"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col animate-sheet-panel overflow-hidden rounded-t-lg sm:max-h-[88vh] sm:rounded-lg"
      >
        <div className="glass-card-modal flex min-h-0 flex-1 flex-col rounded-t-lg sm:rounded-lg">
          <div
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-hairline sm:hidden"
            aria-hidden="true"
          />

          <header className="flex shrink-0 items-center gap-3 bg-surface-dark px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-on-dark transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
            <div className="min-w-0 flex-1 text-right">
              <h2
                id="request-detail-title"
                className="text-heading-lg text-on-dark"
              >
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 line-clamp-2 text-body-sm text-on-dark/75">
                  {subtitle}
                </p>
              ) : null}
            </div>
          </header>

          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 sm:px-7">
            {children}
          </div>

          <footer className="shrink-0 border-t border-white/35 px-5 py-4 sm:px-7 sm:pb-6">
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-button-md text-on-primary transition-colors hover:bg-primary-pressed"
            >
              بستن
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
