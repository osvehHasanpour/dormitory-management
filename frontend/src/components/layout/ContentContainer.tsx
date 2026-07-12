import type { ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "main" | "section";
}

export function ContentContainer({
  children,
  className = "",
  as: Tag = "div",
}: ContentContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full min-w-0 max-w-lg px-4 sm:px-6 md:max-w-3xl lg:max-w-5xl lg:px-10 ${className}`}
    >
      {children}
    </Tag>
  );
}
