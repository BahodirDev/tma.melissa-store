type EmptyStateProps = {
  /** Asosiy matn (foydalanuvchiga tushunarli) */
  text: string;
  /** Ixtiyoriy qo‘shimcha izoh (1 qator) */
  hint?: string;
};

export function EmptyState({ text, hint }: EmptyStateProps) {
  return (
    <div className="m-empty">
      {hint ? <p className="m-empty__hint">{hint}</p> : null}
      <p className="m-empty__text">{text}</p>
    </div>
  );
}
