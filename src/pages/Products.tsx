import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get(
        `products/products-list?limit=${limit}&page=${page}`
      );
      setData(r.data);
    } catch (e) {
      setErr(unwrapError(e));
    }
    setLoading(false);
  }, [page, limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="page">
      <h2>Mahsulotlar</h2>
      <div className="row">
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
          onClick={() => setPage((p) => p + 1)}
        >
          Keyingi
        </button>
        <button className="btn btn--sm" type="button" onClick={() => void load()}>
          Yangilash
        </button>
      </div>
      {err ? <p className="err">{err}</p> : null}
      {loading ? <p className="muted">Yuklanmoqda…</p> : null}
      <pre className="pre">{data ? JSON.stringify(data, null, 2) : "—"}</pre>
    </div>
  );
}
