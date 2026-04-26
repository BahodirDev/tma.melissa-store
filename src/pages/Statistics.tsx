import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrapError } from "../api/client";
import { getProductsLowStock } from "../api/parity";
import type { DeliverRow, StoreRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatNumber } from "../utils/format";
import { ImageThumb } from "../components/m/ImageThumb";
import { PageSearchRow } from "../components/m/PageSearchRow";

type LowStockItem = {
  id?: string;
  productName?: string;
  productCode?: string;
  mainStoreStock?: number;
  minimalStockCount?: number;
  recommendedPurchase?: number;
  storeSummary?: string;
  image?: string | null;
  deliver?: { deliver_name?: string };
};

function asStoreList(d: unknown): StoreRow[] {
  return Array.isArray(d) ? (d as StoreRow[]) : [];
}
function asDeliverList(d: unknown): DeliverRow[] {
  return Array.isArray(d) ? (d as DeliverRow[]) : [];
}
function asLowList(d: unknown): LowStockItem[] {
  return Array.isArray(d) ? (d as LowStockItem[]) : [];
}

export default function StatisticsPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [delivers, setDelivers] = useState<DeliverRow[]>([]);
  const [low, setLow] = useState<LowStockItem[]>([]);

  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [deliverId, setDeliverId] = useState<string>("");
  const [q, setQ] = useState("");

  const didLoadLowOnInit = useRef(false);

  const loadLow = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const allStores =
        selectedStoreIds.length > 0 &&
        stores.length > 0 &&
        selectedStoreIds.length === stores.length;
      const storeIdParam =
        !allStores && selectedStoreIds.length > 0
          ? selectedStoreIds.join(",")
          : undefined;
      const raw = await getProductsLowStock({
        store_id: storeIdParam,
        deliver_id: deliverId || undefined,
        search: q.trim() || undefined,
        limit: "200",
        page: "1",
      });
      setLow(asLowList(raw));
    } catch (e) {
      setErr(unwrapError(e));
      setLow([]);
    }
    setLoading(false);
  }, [selectedStoreIds, stores, deliverId, q]);

  const loadMeta = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        api.get<StoreRow[] | unknown>(`store/store-list?limit=1000&page=1`),
        api.get<DeliverRow[] | unknown>(`deliver/deliver-list?limit=1000&page=1`),
      ]);
      const s = asStoreList(a.data);
      setStores(s);
      setDelivers(asDeliverList(b.data));
      const ids = s.map((x) => String(x.store_id));
      setSelectedStoreIds(ids);
    } catch (e) {
      setErr(unwrapError(e));
    }
  }, []);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (stores.length === 0) return;
    if (didLoadLowOnInit.current) return;
    didLoadLowOnInit.current = true;
    void loadLow();
  }, [stores, loadLow]);

  const toggleStore = (id: string) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const selectAllStores = () => {
    setSelectedStoreIds(stores.map((x) => String(x.store_id)));
  };
  const clearLowFilters = () => {
    setSelectedStoreIds(stores.map((x) => String(x.store_id)));
    setDeliverId("");
    setQ("");
  };

  return (
    <div className="page">
      <SectionHeader
        title="Statistika"
        action={
          <button
            className="btn btn--sm btn--secondary"
            type="button"
            onClick={() => void loadLow()}
          >
            Yangilash
          </button>
        }
      />
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}

      <h3 className="h3">Kam qoldiq (filtr)</h3>
      <p className="m-page-hint">
        Ombor va postavchik — front-dagi kabi. Barcha omborlar tanlangan bo‘lsa,
        filtr yuborilmaydi.
      </p>
      <div className="m-filters" style={{ marginBottom: "var(--section-gap)" }}>
        <div className="m-filters__row">
          <label>
            <span>Postavchik</span>
            <select
              className="input"
              value={deliverId}
              onChange={(e) => setDeliverId(e.target.value)}
            >
              <option value="">Barcha</option>
              {delivers
                .filter((d) => !d || (d as { isdelete?: boolean }).isdelete !== true)
                .map((d) => (
                  <option key={d.deliver_id} value={d.deliver_id as string}>
                    {d.deliver_name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <p className="m-page-hint" style={{ margin: 0 }}>
          Omborlar
        </p>
        <div
          className="row"
          style={{ flexDirection: "column", alignItems: "stretch" }}
        >
          {stores.map((s) => (
            <label
              key={s.store_id}
              className="row"
              style={{ gap: "0.5rem", fontSize: "0.9rem" }}
            >
              <input
                type="checkbox"
                checked={selectedStoreIds.includes(String(s.store_id))}
                onChange={() => void toggleStore(String(s.store_id))}
              />
              {s.store_name}
            </label>
          ))}
        </div>
        <div className="m-filters__row">
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            onClick={selectAllStores}
          >
            Barcha omborlarni tanlash
          </button>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => void loadLow()}
          >
            Qo‘llash
          </button>
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            onClick={clearLowFilters}
          >
            Tozalash
          </button>
        </div>
        <PageSearchRow
          value={q}
          onChange={setQ}
          placeholder="Mahsulot qidirish"
          endSlot={
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => void loadLow()}
            >
              Qidirish
            </button>
          }
        />
      </div>

      <h3 className="h3">Kam qoldiq ro‘yxati</h3>
      {low.length === 0 && !loading ? (
        <EmptyState
          text="Kam qoldiq yo‘q yoki ruxsat yo‘q"
          hint="Filtr yoki qidiruvni o‘zgartirib ko‘ring"
        />
      ) : null}
      {low.map((p, i) => (
        <MobileCard key={p.id || `${p.productCode || "k"}-${i}`}>
          <div className="m-list-item__row--media">
            <ImageThumb src={p.image} alt={p.productName || ""} />
            <div className="m-list-item__body">
              <h3 className="m-list-item__title">{p.productName || "—"}</h3>
              <p className="m-list-item__meta">
                {p.productCode} · {p.deliver?.deliver_name || ""}
              </p>
              <table className="m-table">
                <tbody>
                  <tr>
                    <th>Asosiy ombor</th>
                    <td>{formatNumber(p.mainStoreStock)}</td>
                  </tr>
                  <tr>
                    <th>Minimal</th>
                    <td>{formatNumber(p.minimalStockCount)}</td>
                  </tr>
                  <tr>
                    <th>Tavsiya sotib olish</th>
                    <td>{formatNumber(p.recommendedPurchase)}</td>
                  </tr>
                </tbody>
              </table>
              {p.storeSummary ? (
                <p className="m-list-item__meta m-list-item__meta--stack">
                  {p.storeSummary}
                </p>
              ) : null}
            </div>
          </div>
        </MobileCard>
      ))}

      <h3 className="h3">Omborlar</h3>
      {stores.length === 0 && !loading ? (
        <EmptyState text="Ombor ro‘yxati bo‘sh" />
      ) : null}
      {stores.map((s) => (
        <MobileCard key={String(s.store_id)}>
          <div className="m-list-item__head">
            <h3 className="m-list-item__title">{s.store_name || "—"}</h3>
            {s.store_main ? (
              <span className="m-badge m-badge--ok">Asosiy</span>
            ) : null}
          </div>
        </MobileCard>
      ))}

      <h3 className="h3">Yetkazib beruvchilar</h3>
      {delivers.length === 0 && !loading ? (
        <EmptyState text="Postavchik ro‘yxati bo‘sh" />
      ) : null}
      {delivers.map((d) => (
        <MobileCard key={String(d.deliver_id)}>
          <h3 className="m-list-item__title">{d.deliver_name || "—"}</h3>
          {d.deliver_nomer ? (
            <p className="m-list-item__meta">{d.deliver_nomer}</p>
          ) : null}
        </MobileCard>
      ))}
    </div>
  );
}
