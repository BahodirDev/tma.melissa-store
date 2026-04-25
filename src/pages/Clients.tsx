import { useCallback, useEffect, useState, type FormEvent } from "react";
import { clientApi, unwrapError } from "../api/routes";
import type { ClientRow } from "../types/api";

export default function ClientsPage() {
  const [list, setList] = useState<ClientRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [form, setForm] = useState({
    clients_name: "",
    clients_nomer: "",
    clients_desc: "Qoshimcha ma`lumot",
  });

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

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const s = await clientApi.create(form);
      if (s === 201 || s === 200) {
        setForm({ clients_name: "", clients_nomer: "", clients_desc: "Qoshimcha ma`lumot" });
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
      setForm({ clients_name: "", clients_nomer: "", clients_desc: "Qoshimcha ma`lumot" });
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
      <h2>Mijozlar</h2>
      <div className="row row--wrap">
        <input
          className="input"
          placeholder="Qidiruv"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn btn--sm" type="button" onClick={() => void load()}>
          Yangilash
        </button>
      </div>
      {err ? <p className="err">{err}</p> : null}
      {loading ? <p className="muted">Yuklanmoqda…</p> : null}
      <ul className="list">
        {list.map((r) => (
          <li key={r.clients_id} className="li card">
            <div>
              <strong>{r.clients_name}</strong>
              <div className="sub">
                {r.clients_nomer} {r.isdelete ? "(o‘chirilgan)" : ""}
              </div>
            </div>
            <div className="row">
              <button type="button" className="btn btn--sm" onClick={() => startEdit(r)}>
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
          </li>
        ))}
      </ul>
      {!editing ? (
        <form className="form" onSubmit={onCreate}>
          <h3>Yangi mijoz</h3>
          {(["clients_name", "clients_nomer", "clients_desc"] as const).map((k) => (
            <label key={k} className="field">
              <span>{k}</span>
              <input
                className="input"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
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
              <span>{k}</span>
              <input
                className="input"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
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
