import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";
import type { DebtTransactionRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatDate, formatNumber } from "../utils/format";
import { formatTransactionType } from "../utils/fieldLabels";

export default function DebtsPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DebtTransactionRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get<DebtTransactionRow[] | unknown>("debts/debts-list");
      setRows(
        Array.isArray(r.data) ? (r.data as DebtTransactionRow[]) : []
      );
    } catch (e) {
      setErr(unwrapError(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <SectionHeader
        title="Qarz eslatmalar"
        action={
          <button
            className="btn btn--sm btn--secondary"
            type="button"
            onClick={() => void load()}
          >
            Yangilash
          </button>
        }
      />
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {rows.length === 0 && !loading ? <EmptyState text="Yozuvlar yo‘q" /> : null}
      {rows.map((r, i) => (
        <MobileCard key={r.transaction_id || i}>
          <div className="m-list-item__head">
            <h3 className="m-list-item__title">
              {formatNumber(r.transaction_money as number)} soʻm
            </h3>
            <span className="m-badge">
              {formatTransactionType(
                r.transaction_type != null ? String(r.transaction_type) : null
              )}
            </span>
          </div>
          {r.transaction_summary ? (
            <p className="m-list-item__meta m-list-item__meta--stack">
              {r.transaction_summary}
            </p>
          ) : null}
          {r.transaction_created_at ? (
            <p className="m-list-item__meta">{formatDate(r.transaction_created_at as string)}</p>
          ) : null}
        </MobileCard>
      ))}
    </div>
  );
}
