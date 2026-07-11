import type { ReactNode } from "react";

import { ContentContainer } from "./ContentContainer";

interface PageHeaderProps {
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  breadcrumb?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  onBack,
  backLabel = "بازگشت",
  breadcrumb,
  leftAction,
  rightAction,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`relative pb-4 pt-5 ${className}`}>
      <ContentContainer className="relative flex min-h-10 items-center justify-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/30 text-heading-lg text-ink backdrop-blur-sm active:bg-white/45"
            aria-label={backLabel}
          >
            ‹
          </button>
        ) : null}

        {leftAction ? (
          <div className="absolute left-0 top-0 z-20">{leftAction}</div>
        ) : null}

        {rightAction ? (
          <div className="absolute right-0 top-0 z-20">{rightAction}</div>
        ) : null}

        {breadcrumb ? (
          <span className="inline-flex max-w-[min(100%,16rem)] items-center rounded-full bg-surface-card px-4 py-1.5 text-caption-md font-medium text-ink">
            <span className="truncate">{breadcrumb}</span>
          </span>
        ) : null}

        {title && !breadcrumb ? (
          <h1 className="max-w-[calc(100%-5rem)] truncate text-heading-lg text-ink sm:max-w-none sm:whitespace-normal">
            {title}
          </h1>
        ) : null}
      </ContentContainer>
    </header>
  );
}
