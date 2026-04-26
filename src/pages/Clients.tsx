import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { clientApi, unwrapError } from "../api/routes";
import type { ClientRow } from "../types/api";
import { SectionHeader } from "../components/m/SectionHeader";
import { PageSearchRow } from "../components/m/PageSearchRow";
import { MobileCard } from "../components/m/MobileCard";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { EmptyState } from "../components/m/EmptyState";
import { clientFormLabels } from "../utils/fieldLabels";

export default function ClientsPage() {
  const [list, setList] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [form, setForm] = useState({
    clients_name: "",
    clients_nomer: "",
    clients_desc: "",
  });

  const pageSize = 20;
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = q.trim() ? await clientApi.search(q.trim()) : await clientApi.list();
      setList(data);
    } catch (e) {
      setErr(unwrapError(e));
      setList([]);
    }
    setLoading(false);
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const paged = useMemo(
    () => list.slice((page - 1) * pageSize, page * pageSize),
    [list, page]
  );

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const s = await clientApi.create(form);
      if (s === 201 || s === 200) {
        setForm({ clients_name: "", clients_nomer: "", clients_desc: "" });
        await load();
      }
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("Mijoz o‘chirilsinmi?")) return;
    setErr(null);
    try {
      await clientApi.remove(id);
      await load();
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setErr(null);
    try {
      await clientApi.update(editing.clients_id, { ...form });
      setEditing(null);
      setForm({ clients_name: "", clients_nomer: "", clients_desc: "" });
      await load();
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const startEdit = (r: ClientRow) => {
    setEditing(r);
    setForm({
      clients_name: r.clients_name,
      clients_nomer: r.clients_nomer,
      clients_desc: r.clients_desc,
    });
  };

  return (
    <div className="page">
      <SectionHeader
        title="Mijozlar"
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
      <p className="m-page-hint">
        Roʻyxat serverdan: qidiruv (POST) yoki barcha (GET). Sahifalash
        lokal (sahifalar kliyentda) — tarmoq bitta to‘liq javob.
      </p>
      <PageSearchRow value={q} onChange={setQ} placeholder="Qidiruv" />
      {list.length > 0 ? (
        <p className="m-page-hint" style={{ marginTop: 0 }}>
          {list.length} ta yozuv · sahifa {page} / {totalPages}
        </p>
      ) : null}
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {list.length === 0 && !loading ? <EmptyState text="Mijoz topilmadi" /> : null}
      {paged.map((r) => (
        <MobileCard key={r.clients_id}>
          <h3 className="m-list-item__title">{r.clients_name}</h3>
          <p className="m-list-item__meta">
            {r.clients_nomer} {r.isdelete ? "(o‘chirilgan)" : ""}
          </p>
          <div className="m-card__actions">
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => startEdit(r)}
            >
              Tahrir
            </button>
            <button
              type="button"
              className="btn btn--sm btn--danger"
              onClick={() => void onDelete(r.clients_id)}
            >
              O‘chir
            </button>
          </div>
        </MobileCard>
      ))}
      {list.length > pageSize ? (
        <div
          className="row m-pagination"
          style={{ justifyContent: "space-between", margin: "0.5rem 0" }}
        >
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Oldingi
          </button>
          <button
            type="button"
            className="btn btn--sm btn--secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Keyingi
          </button>
        </div>
      ) : null}
      {!editing ? (
        <form className="form" onSubmit={onCreate}>
          <h3>Yangi mijoz</h3>
          {(["clients_name", "clients_nomer", "clients_desc"] as const).map((k) => (
            <label key={k} className="field">
              <span>{clientFormLabels[k]}</span>
              <input
                className="input"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={
                  k === "clients_nomer" ? "Masalan, +998…" : k === "clients_desc" ? "Agar kerak bo‘lsa" : undefined
                }
                type={k === "clients_nomer" ? "tel" : "text"}
                autoComplete={k === "clients_name" ? "name" : k === "clients_nomer" ? "tel" : "off"}
              />
            </label>
          ))}
          <button className="btn" type="submit">
            Yaratish
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={onSave}>
          <h3>Tahrirlash</h3>
          {(["clients_name", "clients_nomer", "clients_desc"] as const).map((k) => (
            <label key={k} className="field">
              <span>{clientFormLabels[k]}</span>
              <input
                className="input"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={
                  k === "clients_nomer" ? "Masalan, +998…" : k === "clients_desc" ? "Agar kerak bo‘lsa" : undefined
                }
                type={k === "clients_nomer" ? "tel" : "text"}
                autoComplete={k === "clients_name" ? "name" : k === "clients_nomer" ? "tel" : "off"}
              />
            </label>
          ))}
          <div className="row">
            <button className="btn" type="submit">
              Saqlash
            </button>
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Bekor
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
