import { useCallback, useEffect, useState } from "react";
import { unwrapError } from "../api/client";
import { postGoodsSearch } from "../api/parity";
import { api } from "../api/client";
import type { GoodsRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatNumber } from "../utils/format";
import { PageSearchRow } from "../components/m/PageSearchRow";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [rows, setRows] = useState<GoodsRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [useSearch, setUseSearch] = useState(false);
  const [appliedQ, setAppliedQ] = useState("");
  const [totalHint, setTotalHint] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      if (useSearch) {
        const d = await postGoodsSearch(
          { search: appliedQ, deliver_id: null },
          limit,
          page
        );
        setRows(d);
        const fc = d[0] && (d[0] as { full_count?: string | number }).full_count;
        setTotalHint(fc != null ? Number(fc) : d.length);
      } else {
        const r = await api.get<GoodsRow[] | unknown>(
          `goods/goods-list?limit=${limit}&page=${page}`
        );
        const d = r.data;
        setRows(Array.isArray(d) ? d : []);
        setTotalHint(null);
      }
    } catch (e) {
      setErr(unwrapError(e));
      setRows([]);
      setTotalHint(null);
    }
    setLoading(false);
  }, [page, limit, useSearch, appliedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  const onApplySearch = () => {
    setAppliedQ(q);
    setUseSearch(true);
    setPage(1);
  };
  const onClearSearch = () => {
    setUseSearch(false);
    setQ("");
    setAppliedQ("");
    setPage(1);
  };

  const canNext = useSearch
    ? page * limit < (totalHint ?? 0) && rows.length >= limit
    : rows.length >= limit;

  return (
    <div className="page">
      <SectionHeader
        title="Kategoriyalar (tovarlar)"
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
      <p className="m-page-hint">Nom yoki kod bo‘yicha qidiruv (server)</p>
      <div className="m-search-row">
        <PageSearchRow
          value={q}
          onChange={setQ}
          placeholder="Masalan, shokolad yoki kod"
          endSlot={
            <div className="row" style={{ gap: "0.35rem" }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => void onApplySearch()}
              >
                Qidirish
              </button>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => void onClearSearch()}
              >
                Ro‘yxat
              </button>
            </div>
          }
        />
      </div>
      {useSearch ? (
        <p className="m-page-hint" style={{ marginTop: 0 }}>
          {totalHint != null ? `Topildi: taxminan ${formatNumber(totalHint)}` : null}
        </p>
      ) : null}
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      <div className="m-pager">
        <button
          className="btn btn--sm"
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Orqaga
        </button>
        <span className="muted">Sahifa {page}</span>
        <button
          className="btn btn--sm"
          type="button"
          disabled={!canNext}
          onClick={() => setPage((p) => p + 1)}
        >
          Keyingi
        </button>
      </div>
      {!loading && !err && rows.length === 0 ? (
        <EmptyState text="Ma’lumot yo‘q" />
      ) : null}
      {rows.map((g) => (
        <MobileCard key={g.goods_id || g.goods_code}>
          <h3 className="m-list-item__title">{g.goods_name || "—"}</h3>
          <p className="m-list-item__meta">
            Kod: {g.goods_code || "—"} · min. zaxira:{" "}
            {g.dead_limit != null ? formatNumber(g.dead_limit) : "—"}
          </p>
        </MobileCard>
      ))}
    </div>
  );
}
