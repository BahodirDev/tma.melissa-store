import { useCallback, useEffect, useState, type FormEvent } from "react";
import { userApi, unwrapError } from "../api/routes";
import type { EmployeeRow } from "../types/api";

export default function EmployeesPage() {
  const [list, setList] = useState<EmployeeRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [form, setForm] = useState({
    user_name: "",
    user_password: "",
    user_login: "",
    user_nomer: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = q.trim() ? await userApi.search(q.trim()) : await userApi.list();
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
      const s = await userApi.create(form);
      if (s === 201 || s === 200) {
        setForm({
          user_name: "",
          user_password: "",
          user_login: "",
          user_nomer: "",
        });
        await load();
      }
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const onDelete = async (id: string) => {
    if (!window.confirm("O‘chirilsinmi?")) return;
    setErr(null);
    try {
      await userApi.remove(id);
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
      await userApi.update(editing.user_id, { ...form });
      setEditing(null);
      setForm({ user_name: "", user_password: "", user_login: "", user_nomer: "" });
      await load();
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const startEdit = (r: EmployeeRow) => {
    setEditing(r);
    setForm({
      user_name: r.user_name,
      user_password: r.user_password || "",
      user_login: r.user_login,
      user_nomer: r.user_nomer,
    });
  };

  return (
    <div className="page">
      <h2>Xodimlar</h2>
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
          <li key={r.user_id} className="li card">
            <div>
              <strong>{r.user_name}</strong> · {r.user_role}
              <div className="sub">{r.user_login}</div>
            </div>
            <div className="row">
              <button type="button" className="btn btn--sm" onClick={() => startEdit(r)}>
                Tahrir
              </button>
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={() => void onDelete(r.user_id)}
              >
                O‘chir
              </button>
            </div>
          </li>
        ))}
      </ul>
      {!editing ? (
        <form className="form" onSubmit={onCreate}>
          <h3>Yangi xodim</h3>
          {(
            [
              "user_name",
              "user_login",
              "user_password",
              "user_nomer",
            ] as const
          ).map((k) => (
            <label key={k} className="field">
              <span>{k}</span>
              <input
                className="input"
                type={k === "user_password" ? "password" : "text"}
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
          {(
            [
              "user_name",
              "user_login",
              "user_password",
              "user_nomer",
            ] as const
          ).map((k) => (
            <label key={k} className="field">
              <span>{k}</span>
              <input
                className="input"
                type={k === "user_password" ? "password" : "text"}
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
