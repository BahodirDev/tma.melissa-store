import { useCallback, useEffect, useState, type FormEvent } from "react";
import { currencyApi, unwrapError } from "../api/routes";
import type { CurrencyRow } from "../types/api";

export default function CurrencyPage() {
  const [list, setList] = useState<CurrencyRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<CurrencyRow | null>(null);
  const [form, setForm] = useState({
    currency_name: "",
    currency_code: "",
    currency_symbol: "",
    currency_amount: 0,
    name: "",
    flag: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = q.trim()
        ? await currencyApi.search(q.trim())
        : await currencyApi.list();
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
      const s = await currencyApi.create({
        ...form,
        currency_amount: Number(form.currency_amount),
      });
      if (s === 201 || s === 200) {
        setForm({
          currency_name: "",
          currency_code: "",
          currency_symbol: "",
          currency_amount: 0,
          name: "",
          flag: "",
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
      await currencyApi.remove(id);
      await load();
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const onSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setErr(null);
    try {
      await currencyApi.update(editing.currency_id, {
        currency_name: form.currency_name,
        currency_amount: Number(form.currency_amount),
        currency_code: form.currency_code,
        currency_symbol: form.currency_symbol,
        name: form.name,
        flag: form.flag,
      });
      setEditing(null);
      await load();
    } catch (c) {
      setErr(unwrapError(c));
    }
  };

  const startEdit = (c: CurrencyRow) => {
    setEditing(c);
    setForm({
      currency_name: c.currency_name,
      currency_code: c.currency_code,
      currency_symbol: c.currency_symbol,
      currency_amount: Number(c.currency_amount) || 0,
      name: c.name,
      flag: c.flag,
    });
  };

  return (
    <div className="page">
      <h2>Valyuta</h2>
      <div className="row row--wrap">
        <input
          className="input"
          placeholder="Qidiruv (nom bo‘yicha)"
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
        {list.map((c) => (
          <li key={c.currency_id} className="li card">
            <div>
              <strong>{c.currency_name}</strong> {c.currency_code} ({c.currency_symbol}) —{" "}
              {c.currency_amount}
            </div>
            <div className="row">
              <button type="button" className="btn btn--sm" onClick={() => startEdit(c)}>
                Tahrir
              </button>
              <button
                type="button"
                className="btn btn--sm btn--danger"
                onClick={() => void onDelete(c.currency_id)}
              >
                O‘chir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!editing ? (
        <form className="form" onSubmit={onCreate}>
          <h3>Yangi valyuta</h3>
          {(["currency_name", "currency_code", "currency_symbol", "name", "flag"] as const).map(
            (k) => (
              <label key={k} className="field">
                <span>{k}</span>
                <input
                  className="input"
                  value={String(form[k] ?? "")}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            )
          )}
          <label className="field">
            <span>currency_amount</span>
            <input
              type="number"
              className="input"
              value={form.currency_amount}
              onChange={(e) =>
                setForm({ ...form, currency_amount: Number(e.target.value) })
              }
            />
          </label>
          <button className="btn" type="submit">
            Saqlash
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={onSaveEdit}>
          <h3>Tahrirlash</h3>
          {(["currency_name", "currency_code", "currency_symbol", "name", "flag"] as const).map(
            (k) => (
              <label key={k} className="field">
                <span>{k}</span>
                <input
                  className="input"
                  value={String(form[k] ?? "")}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            )
          )}
          <label className="field">
            <span>currency_amount</span>
            <input
              type="number"
              className="input"
              value={form.currency_amount}
              onChange={(e) =>
                setForm({ ...form, currency_amount: Number(e.target.value) })
              }
            />
          </label>
          <div className="row">
            <button className="btn" type="submit">
              Yangilash
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => setEditing(null)}
            >
              Bekor
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
