import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";
import type { StoreRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatDate } from "../utils/format";

export default function StorePage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<StoreRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get<StoreRow[] | unknown>("store/store-list");
      setRows(Array.isArray(r.data) ? (r.data as StoreRow[]) : []);
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
        title="Ombor"
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
      {rows.length === 0 && !loading ? <EmptyState text="Ombor yo‘q" /> : null}
      {rows.map((s) => (
        <MobileCard key={String(s.store_id)}>
          <div className="m-list-item__head">
            <h3 className="m-list-item__title">{s.store_name || "—"}</h3>
            {s.store_main ? (
              <span className="m-badge m-badge--ok">Asosiy</span>
            ) : null}
          </div>
          {s.store_createdat ? (
            <p className="m-list-item__meta">{formatDate(s.store_createdat)}</p>
          ) : null}
        </MobileCard>
      ))}
    </div>
  );
}
