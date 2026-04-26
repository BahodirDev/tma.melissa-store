import { useCallback, useEffect, useState } from "react";
import { unwrapError } from "../api/client";
import { postReturnFilter } from "../api/parity";
import type { JsonObject, ReturnListResponse } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { pickReturnRowFields } from "../utils/rowLabels";
import { PageSearchRow } from "../components/m/PageSearchRow";
import { formatNumber } from "../utils/format";
import { api } from "../api/client";

type ClientN = {
  clients_name?: string;
  clients_nomer?: string;
};

export default function ReturnPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<JsonObject[]>([]);
  const [returnCount, setReturnCount] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<"all" | "search">("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get<ReturnListResponse | unknown>("return/return-list");
      const b = r.data as ReturnListResponse;
      if (b && Array.isArray(b.data)) {
        setRows(b.data);
        setReturnCount(
          typeof b.return === "number" ? b.return : b.data.length
        );
      } else {
        setRows([]);
        setReturnCount(0);
      }
    } catch (e) {
      setErr(unwrapError(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const onSearch = async () => {
    setMode("search");
    setLoading(true);
    setErr(null);
    try {
      const b = await postReturnFilter(q);
      const d = b.data ?? [];
      setRows(d);
      setReturnCount(typeof b.count === "number" ? b.count : d.length);
    } catch (e) {
      setErr(unwrapError(e));
    }
    setLoading(false);
  };

  const onReset = () => {
    setMode("all");
    setQ("");
    void fetchAll();
  };

  return (
    <div className="page">
      <SectionHeader
        title="Qaytgan mahsulotlar"
        action={
          <button
            className="btn btn--sm btn--secondary"
            type="button"
            onClick={() => void (mode === "search" ? onSearch() : fetchAll())}
          >
            Yangilash
          </button>
        }
      />
      <p className="m-page-hint">Mijoz, mahsulot yoki do‘kon bo‘yicha qidiruv</p>
      <div className="m-search-row" style={{ marginBottom: "var(--section-gap)" }}>
        <PageSearchRow
          value={q}
          onChange={setQ}
          placeholder="Qidiruv matni"
          endSlot={
            <div className="row" style={{ gap: "0.35rem" }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => void onSearch()}
              >
                Qidirish
              </button>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => void onReset()}
              >
                Barcha roʻyxat
              </button>
            </div>
          }
        />
      </div>
      {returnCount != null ? (
        <p className="m-page-hint">Jami yozuv: {formatNumber(returnCount)}</p>
      ) : null}
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {rows.length === 0 && !loading ? (
        <EmptyState text="Qaytarish topilmadi" />
      ) : null}
      {rows.map((r, i) => {
        const pairs = pickReturnRowFields(r as Record<string, unknown>);
        const cl = (r as { clients?: ClientN }).clients;
        return (
          <MobileCard
            key={(r as { return_id?: string }).return_id || String(i)}
          >
            {cl ? (
              <div
                className="m-list-item__meta"
                style={{ marginBottom: "0.5rem", fontWeight: 500 }}
              >
                Mijoz: {cl.clients_name ?? "—"}{" "}
                {cl.clients_nomer ? `· ${cl.clients_nomer}` : null}
              </div>
            ) : null}
            {pairs.map((p) => (
              <div key={p.key} className="m-statrow m-statrow--plain">
                <span className="m-statrow__label">{p.label}</span>
                <span className="m-statrow__val">{p.value}</span>
              </div>
            ))}
          </MobileCard>
        );
      })}
    </div>
  );
}
