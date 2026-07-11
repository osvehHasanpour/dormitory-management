import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";
import { usePanelLayout, type PanelLayout } from "../../hooks/useMediaQuery";

const VIEWPORT_PADDING = 12;
const BASE_Z_INDEX = 75;
const ELEVATED_Z_INDEX = 90;

interface PanelPosition {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
}

interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef?: RefObject<HTMLDivElement | null>;
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  lockScroll?: boolean;
  /** Raise above BottomSheet / other overlays (z-index 90) */
  elevated?: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isRtlDocument(): boolean {
  return document.documentElement.dir === "rtl";
}

export function FloatingPanel({
  isOpen,
  onClose,
  triggerRef,
  panelRef: externalPanelRef,
  title,
  children,
  className = "",
  contentClassName = "",
  lockScroll = true,
  elevated = false,
}: FloatingPanelProps) {
  const layout = usePanelLayout();
  const internalPanelRef = useRef<HTMLDivElement>(null);
  const panelRef = externalPanelRef ?? internalPanelRef;
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const zIndex = elevated ? ELEVATED_Z_INDEX : BASE_Z_INDEX;

  useBodyScrollLock(isOpen && layout !== "dropdown" && lockScroll);

  useClickOutside([triggerRef, panelRef], onClose, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const updatePosition = useCallback(() => {
    if (!isOpen || layout !== "dropdown" || !triggerRef.current) {
      setPosition(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = clamp(rect.width, 220, viewportWidth - VIEWPORT_PADDING * 2);

    let left: number;
    if (isRtlDocument()) {
      left = rect.right - width;
      left = clamp(
        left,
        VIEWPORT_PADDING,
        viewportWidth - width - VIEWPORT_PADDING,
      );
    } else {
      left = clamp(
        rect.left,
        VIEWPORT_PADDING,
        viewportWidth - width - VIEWPORT_PADDING,
      );
    }

    const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openBelow = spaceBelow >= 200 || spaceBelow >= spaceAbove;
    const maxHeight = clamp(
      openBelow ? spaceBelow - 8 : spaceAbove - 8,
      180,
      viewportHeight - VIEWPORT_PADDING * 2,
    );
    const top = openBelow ? rect.bottom + 8 : rect.top - maxHeight - 8;

    setPosition({ top, left, width, maxHeight });
  }, [isOpen, layout, triggerRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen || layout !== "dropdown") {
      return undefined;
    }

    const handleReposition = () => {
      updatePosition();
    };

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isOpen, layout, updatePosition]);

  if (!isOpen) {
    return null;
  }

  const panelSurfaceClass =
    "overflow-hidden border border-hairline/50 bg-white shadow-[0_12px_48px_rgba(46,17,69,0.16)]";

  const panelContent = (
    <div
      className={
        layout === "dropdown"
          ? "contents"
          : "fixed inset-0 flex items-end justify-center sm:items-center"
      }
      style={{ zIndex }}
    >
      {layout !== "dropdown" ? (
        <button
          type="button"
          aria-label="بستن"
          className="absolute inset-0 animate-sheet-scrim bg-ink/45 backdrop-blur-[2px]"
          onClick={onClose}
        />
      ) : null}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={layout !== "dropdown" ? "true" : undefined}
        aria-label={title}
        style={
          layout === "dropdown" && position
            ? {
                position: "fixed",
                zIndex,
                top: position.top,
                left: position.left,
                width: position.width,
                maxHeight: position.maxHeight,
              }
            : layout === "dropdown"
              ? { position: "fixed", zIndex }
              : undefined
        }
        className={getPanelClassName(layout, panelSurfaceClass, className)}
      >
        {layout === "sheet" ? (
          <div
            className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-hairline"
            aria-hidden="true"
          />
        ) : null}

        {title ? (
          <div className="shrink-0 border-b border-hairline/40 px-5 py-3.5 text-right">
            <p className="text-body-sm-strong text-ink">{title}</p>
          </div>
        ) : null}

        <div
          className={`min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
}

function getPanelClassName(
  layout: PanelLayout,
  surface: string,
  className: string,
): string {
  if (layout === "dropdown") {
    return `flex flex-col animate-dropdown-panel rounded-lg ${surface} ${className}`;
  }

  if (layout === "modal") {
    return `relative z-10 flex max-h-[min(80vh,560px)] w-[calc(100%-1rem)] max-w-md flex-col animate-modal-pop rounded-lg min-[480px]:w-[calc(100%-2rem)] md:max-w-xl ${surface} ${className}`;
  }

  return `relative z-10 flex max-h-[min(78vh,520px)] w-full max-w-lg flex-col animate-sheet-panel rounded-t-lg pb-[env(safe-area-inset-bottom)] min-[480px]:max-w-xl md:max-w-2xl ${surface} ${className}`;
}
