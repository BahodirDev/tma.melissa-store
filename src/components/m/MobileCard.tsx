import type { ReactNode } from "react";

export function MobileCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`m-card ${className}`.trim()}>{children}</div>;
}
