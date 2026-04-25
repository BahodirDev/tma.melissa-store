import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";

export default function StatisticsPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<unknown>(null);
  const [delivers, setDelivers] = useState<unknown>(null);
  const [low, setLow] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [a, b, c] = await Promise.all([
        api.get("store/store-list"),
        api.get("deliver/deliver-list"),
        api.get("products/products-low-stock?limit=30&page=1"),
      ]);
      setStores(a.data);
      setDelivers(b.data);
      setLow(c.data);
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
      <h2>Statistika</h2>
      <button className="btn btn--sm" type="button" onClick={() => void load()}>
        Yangilash
      </button>
      {err ? <p className="err">{err}</p> : null}
      {loading ? <p className="muted">Yuklanmoqda…</p> : null}
      <h3 className="h3">Omborlar (store-list)</h3>
      <pre className="pre">{stores ? JSON.stringify(stores, null, 2) : "—"}</pre>
      <h3 className="h3">Yetkazib beruvchilar</h3>
      <pre className="pre">
        {delivers ? JSON.stringify(delivers, null, 2) : "—"}
      </pre>
      <h3 className="h3">Kam qoldiq (products-low-stock)</h3>
      <pre className="pre">{low ? JSON.stringify(low, null, 2) : "—"}</pre>
    </div>
  );
}
