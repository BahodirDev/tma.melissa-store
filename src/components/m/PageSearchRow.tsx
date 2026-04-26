import type { ChangeEvent, ReactNode } from "react";

type PageSearchRowProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  endSlot?: ReactNode;
  autoComplete?: string;
};

/**
 * Qidiruv satri: `.m-search-row` + kengayuvchi `input` (Yangilash sarlavhada qoladi).
 */
export function PageSearchRow({
  value,
  onChange,
  placeholder = "Qidiruv",
  id,
  className = "",
  endSlot,
  autoComplete = "off",
}: PageSearchRowProps) {
  return (
    <div className={`m-search-row ${className}`.trim()}>
      <input
        id={id}
        className="input m-input--grow"
        type="search"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {endSlot}
    </div>
  );
}
