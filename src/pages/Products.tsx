import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";
import { getProductsList, postProductsFilter } from "../api/parity";
import type { ProductListRow, ProductsListResponse } from "../types/api-responses";
import type { DeliverRow, StoreRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatNumber } from "../utils/format";
import { deliverName, goodName, storeName } from "../utils/parseProduct";
import { ImageThumb } from "../components/m/ImageThumb";
import { PageSearchRow } from "../components/m/PageSearchRow";

type Hisob = { soni?: number; umumiyQiymati?: number; kategoriya?: number };

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductListRow[]>([]);
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [useFilters, setUseFilters] = useState(false);

  const [stores, setStores] = useState<StoreRow[]>([]);
  const [delivers, setDelivers] = useState<DeliverRow[]>([]);
  const [storeId, setStoreId] = useState("");
  const [deliverId, setDeliverId] = useState("");
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const applyBody = useCallback(
    () => ({
      search: (q.trim() || " ") as string,
      store_id: storeId || null,
      deliver_id: deliverId || null,
    }),
    [q, storeId, deliverId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      if (useFilters) {
        const r = await postProductsFilter(applyBody(), { limit, page, date: null, price: null });
        const body = r as ProductsListResponse;
        const list = body?.data;
        const arr = Array.isArray(list) ? list : [];
        setData(arr);
        setHisob(
          (body && typeof body === "object" && "hisob" in body
            ? body.hisob
            : null) as Hisob | null
        );
        const fc = arr[0]?.full_count;
        setTotalCount(
          fc != null ? Number(fc) : (arr as ProductListRow[]).length
        );
      } else {
        const r = await getProductsList(limit, page);
        const body = r as ProductsListResponse;
        const list = body?.data;
        const arr = Array.isArray(list) ? list : [];
        setData(arr);
        setHisob(
          (body && typeof body === "object" && "hisob" in body
            ? body.hisob
            : null) as Hisob | null
        );
        const fc = arr[0]?.full_count;
        setTotalCount(
          fc != null ? Number(fc) : (arr as ProductListRow[]).length
        );
      }
    } catch (e) {
      setErr(unwrapError(e));
      setData([]);
      setHisob(null);
      setTotalCount(0);
    }
    setLoading(false);
  }, [useFilters, applyBody, limit, page]);

  useEffect(() => {
    void (async () => {
      try {
        const [a, b] = await Promise.all([
          api.get<StoreRow[] | unknown>(`store/store-list?limit=500&page=1`),
          api.get<DeliverRow[] | unknown>(`deliver/deliver-list?limit=500&page=1`),
        ]);
        setStores(Array.isArray(a.data) ? a.data : []);
        setDelivers(Array.isArray(b.data) ? b.data : []);
      } catch {
        /*  */
      }
    })();
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const maxPage = Math.max(1, Math.ceil(totalCount / limit) || 1);
  const onApply = () => {
    setUseFilters(true);
    setPage(1);
  };
  const onClear = () => {
    setUseFilters(false);
    setStoreId("");
    setDeliverId("");
    setQ("");
    setPage(1);
  };

  return (
    <div className="page">
      <SectionHeader
        title="Mahsulotlar"
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

      <div className="m-filters" style={{ marginBottom: "var(--section-gap)" }}>
        <button
          type="button"
          className="btn btn--sm btn--secondary"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? "Filtrni yig‘ish" : "Filtr"}
        </button>
        {filtersOpen ? (
          <>
            <div className="m-filters__row">
              <label>
                <span>Doʻkon</span>
                <select
                  className="input"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {stores.map((s) => (
                    <option key={s.store_id} value={s.store_id as string}>
                      {s.store_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Postavchik</span>
                <select
                  className="input"
                  value={deliverId}
                  onChange={(e) => setDeliverId(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {delivers.map((d) => (
                    <option
                      key={d.deliver_id}
                      value={d.deliver_id as string}
                    >
                      {d.deliver_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <PageSearchRow
              value={q}
              onChange={setQ}
              placeholder="Mahsulot (nom, kod) — bo‘sh bo‘lsa barcha"
            />
            <div className="m-filters__row">
              <button type="button" className="btn btn--sm" onClick={onApply}>
                Qo‘llash
              </button>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={onClear}
              >
                Tozalash
              </button>
            </div>
            {useFilters ? (
              <p className="m-page-hint" style={{ margin: 0 }}>
                Filtr yoqilgan
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {hisob ? (
        <div className="m-chiprow">
          <div className="m-chip">
            <b>Soni</b>
            <span>{formatNumber(hisob.soni)}</span>
          </div>
          <div className="m-chip">
            <b>Umumiy qiymat</b>
            <span>{formatNumber(hisob.umumiyQiymati)}</span>
          </div>
          <div className="m-chip">
            <b>Topilmalar</b>
            <span>{formatNumber(hisob.kategoriya)}</span>
          </div>
        </div>
      ) : null}
      <div className="m-pager">
        <button
          className="btn btn--sm"
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Orqaga
        </button>
        <span className="muted">
          Sahifa {page} / {maxPage} · {formatNumber(totalCount)} dona
        </span>
        <button
          className="btn btn--sm"
          type="button"
          disabled={page >= maxPage}
          onClick={() => setPage((p) => p + 1)}
        >
          Keyingi
        </button>
      </div>
      {data.length === 0 && !loading ? (
        <EmptyState
          text="Mahsulot topilmadi"
          hint="Filtrni o‘zgartirib ko‘ring"
        />
      ) : null}
      {data.map((row, i) => (
        <MobileCard key={row.products_id || `p-${i}`}>
          <div className="m-list-item__row--media">
            <ImageThumb src={row.img_url} alt={goodName(row)} />
            <div className="m-list-item__body">
              <h3 className="m-list-item__title">{goodName(row)}</h3>
              <p className="m-list-item__meta">
                {storeName(row)} · {deliverName(row)}
              </p>
              <p className="m-list-item__meta">
                Miqdor: {formatNumber(row.products_count)} · narx:{" "}
                {formatNumber(row.products_count_price)}
              </p>
            </div>
          </div>
        </MobileCard>
      ))}
    </div>
  );
}
