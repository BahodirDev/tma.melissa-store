import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";

export default function StorePage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get("store/store-list");
      setData(r.data);
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
      <h2>Ombor</h2>
      <button className="btn btn--sm" type="button" onClick={() => void load()}>
        Yangilash
      </button>
      {err ? <p className="err">{err}</p> : null}
      {loading ? <p className="muted">Yuklanmoqda…</p> : null}
      <pre className="pre">{data ? JSON.stringify(data, null, 2) : "—"}</pre>
    </div>
  );
}
