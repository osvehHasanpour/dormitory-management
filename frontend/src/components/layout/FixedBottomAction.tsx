import type { ReactNode } from "react";

import { ContentContainer } from "./ContentContainer";

interface FixedBottomActionProps {
  children: ReactNode;
  align?: "start" | "center" | "stretch";
  className?: string;
}

const alignClasses = {
  start: "justify-start",
  center: "justify-center",
  stretch: "justify-stretch",
};

export function FixedBottomAction({
  children,
  align = "stretch",
  className = "",
}: FixedBottomActionProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-24 z-40 sm:bottom-28 ${className}`}
    >
      <ContentContainer
        className={`pointer-events-auto flex ${alignClasses[align]}`}
      >
        {children}
      </ContentContainer>
    </div>
  );
}
