import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { userApi, unwrapError } from "../api/routes";
import type { EmployeeRow } from "../types/api";
import { SectionHeader } from "../components/m/SectionHeader";
import { PageSearchRow } from "../components/m/PageSearchRow";
import { MobileCard } from "../components/m/MobileCard";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { EmptyState } from "../components/m/EmptyState";
import { employeeFormLabels, formatUserRole } from "../utils/fieldLabels";

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

  const pageSize = 20;
  const [page, setPage] = useState(1);

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
      <SectionHeader
        title="Xodimlar"
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
        Login va rol bilan boshqaruv. Roʻyxat tarmoqqa bir marta; sahifalash
        lokal.
      </p>
      <PageSearchRow value={q} onChange={setQ} placeholder="Qidiruv" />
      {list.length > 0 ? (
        <p className="m-page-hint" style={{ marginTop: 0 }}>
          {list.length} ta yozuv · sahifa {page} / {totalPages}
        </p>
      ) : null}
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {list.length === 0 && !loading ? <EmptyState text="Xodim topilmadi" /> : null}
      {paged.map((r) => (
        <MobileCard key={r.user_id}>
          <h3 className="m-list-item__title">
            {r.user_name} · {formatUserRole(r.user_role)}
          </h3>
          <p className="m-list-item__meta">{r.user_login}</p>
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
              onClick={() => void onDelete(r.user_id)}
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
              <span>{employeeFormLabels[k]}</span>
              <input
                className="input"
                type={k === "user_password" ? "password" : "text"}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                autoComplete={
                  k === "user_name"
                    ? "name"
                    : k === "user_login"
                      ? "username"
                      : k === "user_password"
                        ? "new-password"
                        : "tel"
                }
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
              <span>{employeeFormLabels[k]}</span>
              <input
                className="input"
                type={k === "user_password" ? "password" : "text"}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                autoComplete={
                  k === "user_name"
                    ? "name"
                    : k === "user_login"
                      ? "username"
                      : k === "user_password"
                        ? "current-password"
                        : "tel"
                }
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
