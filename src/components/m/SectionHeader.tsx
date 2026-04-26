import type { ReactNode } from "react";

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="m-section">
      <h2 className="m-section__title">{title}</h2>
      {action ? <div className="m-section__action">{action}</div> : null}
    </div>
  );
}
