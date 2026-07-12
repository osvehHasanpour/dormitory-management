import type { ReactNode } from "react";

export type PageBottomSpacing = "none" | "nav" | "nav-fab" | "nav-cta";

const bottomSpacingClasses: Record<PageBottomSpacing, string> = {
  none: "pb-6",
  nav: "pb-24 sm:pb-28",
  "nav-fab": "pb-32 sm:pb-36",
  "nav-cta": "pb-40 sm:pb-44",
};

interface PageShellProps {
  children: ReactNode;
  bottomSpacing?: PageBottomSpacing;
  className?: string;
}

export function PageShell({
  children,
  bottomSpacing = "nav",
  className = "",
}: PageShellProps) {
  return (
    <div
      className={`page-gradient min-h-screen min-w-0 overflow-x-clip ${bottomSpacingClasses[bottomSpacing]} ${className}`}
    >
      {children}
    </div>
  );
}
