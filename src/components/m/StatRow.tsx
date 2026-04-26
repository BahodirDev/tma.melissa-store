import { formatNumber } from "../../utils/format";

export function StatRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="m-statrow">
      <span className="m-statrow__label">{label}</span>
      <span className="m-statrow__val">{value != null ? formatNumber(value) : "—"}</span>
    </div>
  );
}
