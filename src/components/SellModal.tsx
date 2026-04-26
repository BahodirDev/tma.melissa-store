import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrapError } from "../api/client";
import { clientApi } from "../api/routes";
import {
  getProductsByStoreAndDeliver,
  getProductsByStoreId,
  patchProductsSale,
  type ProductSaleLine,
} from "../api/parity";
import type { ClientRow } from "../types/api";
import type {
  DeliverRow,
  ProductListRow,
  ProductNestedCurrency,
  ProductNestedGood,
  StoreRow,
} from "../types/api-responses";
import { formatNumber } from "../utils/format";
import { ErrorBanner } from "./m/ErrorBanner";
import { LoadingBlock } from "./m/LoadingBlock";

type CartItem = {
  product_id: string;
  product_name: string;
  count: number;
  price: number; // 1 dona narxi, soʻm
  cost: number; // tannarx * valyuta (butun)
  client: ClientRow;
  currency_amount: number;
  code: string;
  each_box_count: number;
  store_id: string; // ombor uuid
  store: StoreRow;
  highlight?: boolean;
};

function goodOf(p: ProductListRow): ProductNestedGood {
  const g = p.goods_id;
  if (g && typeof g === "object") return g as ProductNestedGood;
  return {};
}

function curAmt(p: ProductListRow): number {
  const c = p.currency_id;
  if (c && typeof c === "object") {
    return Number((c as ProductNestedCurrency).currency_amount) || 1;
  }
  return 1;
}

function storeIdOf(p: ProductListRow): string {
  const s = p.store_id;
  if (s && typeof s === "object" && (s as { store_id?: string }).store_id) {
    return String((s as { store_id: string }).store_id);
  }
  return "";
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function SellModal({ open, onOpenChange }: Props) {
  const [err, setErr] = useState<string | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingProds, setLoadingProds] = useState(false);
  const [saving, setSaving] = useState(false);
  const metaInit = useRef(false);

  const [stores, setStores] = useState<StoreRow[]>([]);
  const [delivers, setDelivers] = useState<DeliverRow[]>([]);
  const [clientList, setClientList] = useState<ClientRow[]>([]);
  const [productRows, setProductRows] = useState<ProductListRow[]>([]);

  const [storeId, setStoreId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [deliverId, setDeliverId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [qty, setQty] = useState<string>("1");
  const [submitted, setSubmitted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartHasItems = cart.length > 0;

  const loadProductRows = useCallback(
    async (sId: string, dId: string) => {
      if (!sId) {
        setProductRows([]);
        return;
      }
      setLoadingProds(true);
      setErr(null);
      try {
        const rows = dId
          ? await getProductsByStoreAndDeliver(sId, dId)
          : await getProductsByStoreId(sId);
        setProductRows(rows);
      } catch (e) {
        setErr(unwrapError(e));
        setProductRows([]);
      }
      setLoadingProds(false);
    },
    []
  );

  const loadMetaOnce = useCallback(async () => {
    if (metaInit.current) return;
    setLoadingMeta(true);
    setErr(null);
    try {
      const [a, b, c] = await Promise.all([
        api.get<StoreRow[] | unknown>(`store/store-list?limit=2000&page=1`),
        api.get<DeliverRow[] | unknown>(`deliver/deliver-list?limit=2000&page=1`),
        clientApi.list(),
      ]);
      setStores(Array.isArray(a.data) ? (a.data as StoreRow[]) : []);
      setDelivers(
        Array.isArray(b.data)
          ? (b.data as DeliverRow[]).filter(
              (d) => !d || (d as { isdelete?: boolean }).isdelete !== true
            )
          : []
      );
      setClientList(
        c.filter(
          (cl) => !cl.isdelete
        ) as ClientRow[]
      );
      metaInit.current = true;
    } catch (e) {
      setErr(unwrapError(e));
    }
    setLoadingMeta(false);
  }, []);

  useEffect(() => {
    if (open) void loadMetaOnce();
  }, [open, loadMetaOnce]);

  useEffect(() => {
    if (open) void loadProductRows(storeId, deliverId);
  }, [open, storeId, deliverId, loadProductRows]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const selectedClient = clientList.find((c) => c.clients_id === clientId);
  const selectedStore = stores.find((s) => s.store_id === storeId);
  const selectedProduct = productRows.find(
    (p) => p.products_id === productId
  );

  const addToCart = () => {
    setSubmitted(true);
    if (!selectedStore || !selectedClient || !selectedProduct) return;
    const qf = parseFloat(String(qty).replace(",", "."));
    if (Number.isNaN(qf) || qf <= 0) return;
    const cam = curAmt(selectedProduct);
    const priceSoum = Math.round(
      Number(selectedProduct.products_count_price || 0) * cam
    );
    const cost = Number(selectedProduct.products_count_cost || 0) * cam;
    const stock = Number(selectedProduct.products_count) || 0;
    if (qf > stock) {
      setErr("Ombordagi miqdor yetarli emas");
      return;
    }
    const g = goodOf(selectedProduct);
    const stId = storeIdOf(selectedProduct) || storeId;
    setErr(null);
    const pack: Omit<CartItem, "highlight"> = {
      product_id: String(selectedProduct.products_id),
      product_name: g.goods_name || "—",
      count: qf,
      price: priceSoum,
      cost,
      client: selectedClient,
      currency_amount: cam,
      code: String(g.goods_code || ""),
      each_box_count: Number(selectedProduct.each_box_count) || 0,
      store_id: stId,
      store: {
        store_id: selectedStore.store_id,
        store_name: selectedStore.store_name,
      },
    };
    setCart((prev) => {
      const ex = prev.find((x) => x.product_id === pack.product_id);
      if (ex) {
        if (!window.confirm("Bu mahsulot roʻyxatda. Miqdorni qoʻshasizmi?")) {
          return prev;
        }
        return prev.map((x) =>
          x.product_id === pack.product_id
            ? {
                ...x,
                count: x.count + pack.count,
                highlight: false,
              }
            : x
        );
      }
      return [pack, ...prev];
    });
    setProductId("");
    setQty("1");
    setSubmitted(false);
  };

  const removeLine = (pid: string) => {
    setCart((prev) => prev.filter((x) => x.product_id !== pid));
  };

  const total = cart.reduce((s, it) => s + it.count * it.price, 0);

  const doSale = async () => {
    if (!cart.length) return;
    if (!window.confirm("Savdoni tasdiqlaysizmi?")) return;
    setSaving(true);
    setErr(null);
    try {
      const products: ProductSaleLine[] = [...cart].reverse().map((item) => ({
        product_id: item.product_id,
        count: item.count,
        client: item.client.clients_name,
        client_nomer: item.client.clients_nomer,
        client_id: item.client.clients_id,
        cost: item.cost / item.currency_amount,
        price: item.price / item.currency_amount,
        code: item.code,
        store_id: item.store_id,
        currency_amount: item.currency_amount,
        each_box_count: item.each_box_count,
      }));
      await patchProductsSale({ products });
      setCart([]);
      setStoreId("");
      setClientId("");
      setDeliverId("");
      setProductId("");
      setQty("1");
      onOpenChange(false);
    } catch (e) {
      setErr(unwrapError(e));
    }
    setSaving(false);
  };

  const onBackdrop = () => onOpenChange(false);
  return (
    <>
      {!open ? (
        <button
          type="button"
          className="m-sell-fab"
          aria-label="Sotish oynasi"
          onClick={() => onOpenChange(true)}
        >
          <span className="m-sell-fab__plus" aria-hidden>
            +
          </span>
        </button>
      ) : null}
      <div
        className={`m-sell-root${open ? " m-sell-root--open" : ""}`}
        aria-hidden={!open}
      >
        <div
          className="m-sell-backdrop"
          role="presentation"
          onClick={onBackdrop}
        />
        <div className="m-sell-panel" onClick={(e) => e.stopPropagation()}>
          <div className="m-sell-head">
            <h2 className="m-sell-title">Sotish</h2>
            <button
              type="button"
              className="btn btn--sm btn--secondary m-sell-close"
              onClick={() => onOpenChange(false)}
            >
              Yopish
            </button>
          </div>
          {err ? <ErrorBanner message={err} /> : null}
          {loadingMeta ? <LoadingBlock /> : null}
          {cart.length > 0 && (
            <p className="m-page-hint" style={{ margin: "0 0 0.5rem" }}>
              Savatda {cart.length} qator. Ombor va mijozni o‘zgartirish uchun
              savatni tozalang.
            </p>
          )}
          <div className="m-sell-form">
            <label className="field">
              <span>Ombor *</span>
              <select
                className="input"
                disabled={cartHasItems}
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setProductId("");
                }}
              >
                <option value="">Tanlang</option>
                {stores.map((s) => (
                  <option key={s.store_id} value={s.store_id}>
                    {s.store_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Mijoz *</span>
              <select
                className="input"
                disabled={cartHasItems}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Tanlang</option>
                {clientList.map((c) => (
                  <option key={c.clients_id} value={c.clients_id}>
                    {c.clients_name} · {c.clients_nomer}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Ta’minotchi (ixtiyoriy, filtr)</span>
              <select
                className="input"
                value={deliverId}
                onChange={(e) => {
                  setDeliverId(e.target.value);
                  setProductId("");
                }}
                disabled={!storeId}
              >
                <option value="">Barcha</option>
                {delivers.map((d) => (
                  <option key={d.deliver_id} value={d.deliver_id as string}>
                    {d.deliver_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Mahsulot *</span>
              <select
                className="input"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={!storeId}
              >
                <option value="">
                  {loadingProds
                    ? "Yuklanmoqda…"
                    : "Mahsulot roʻyxatidan tanlang"}
                </option>
                {productRows.map((p) => {
                  const g = goodOf(p);
                  const cam = curAmt(p);
                  const label = `${g.goods_name} · ${g.goods_code} · ${formatNumber(
                    Math.round(Number(p.products_count_price || 0) * cam)
                  )}`;
                  return (
                    <option
                      key={p.products_id}
                      value={p.products_id as string}
                    >
                      {label}
                    </option>
                  );
                })}
              </select>
            </label>
            <label className="field">
              <span>Miqdor *</span>
              <input
                className="input"
                type="number"
                min={0}
                step="any"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </label>
            {selectedProduct ? (
              <p className="m-page-hint" style={{ margin: 0 }}>
                Omborda:{" "}
                {formatNumber(
                  Number(selectedProduct.products_count) || 0
                )}{" "}
                dona
                {submitted && (!selectedClient || !storeId) ? (
                  <span> · Ombor va mijozni to‘ldiring</span>
                ) : null}
              </p>
            ) : null}
            <button
              type="button"
              className="btn btn--sm"
              onClick={addToCart}
              disabled={
                !storeId || !clientId || !productId || loadingProds
              }
            >
              Qatorga qoʻshish
            </button>
          </div>

          <h3 className="h3">Savat</h3>
          {cart.length === 0 ? (
            <p className="m-page-hint">Hali mahsulot yoʻq</p>
          ) : (
            <ul className="m-sell-cart">
              {cart.map((it) => (
                <li
                  key={it.product_id}
                  className={`m-sell-line${it.highlight ? " m-sell-line--warn" : ""}`}
                >
                  <div>
                    <strong>{it.product_name}</strong> · {it.code}
                    <br />
                    <span className="m-page-hint" style={{ margin: 0 }}>
                      {it.count} × {formatNumber(it.price)} ={" "}
                      {formatNumber(it.count * it.price)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => void removeLine(it.product_id)}
                  >
                    Olib tashlash
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="m-sell-foot">
            <div className="m-sell-total">Jami: {formatNumber(total)}</div>
            <button
              type="button"
              className="btn"
              disabled={!cart.length || saving}
              onClick={() => void doSale()}
            >
              Sotish
            </button>
            {cart.length > 0 ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  if (window.confirm("Savatni tozalab yuborilsinmi?")) {
                    setCart([]);
                    setStoreId("");
                    setClientId("");
                    setDeliverId("");
                  }
                }}
              >
                Tozalash
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
