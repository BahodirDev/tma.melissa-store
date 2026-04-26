import { useCallback, useEffect, useRef, useState } from "react";
import { api, unwrapError } from "../api/client";
import {
  deleteReport,
  getReportsList,
  postReportsFilter,
  toReportDateParam,
  type ReportFilterBody,
} from "../api/parity";
import type { JsonObject } from "../types/api-responses";
import type { ClientRow, EmployeeRow } from "../types/api";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatNumber } from "../utils/format";
import { pickReportRowFields, REPORT_LABELS } from "../utils/rowLabels";
import type { StoreRow, DeliverRow } from "../types/api-responses";

type Hisob = { [k: string]: unknown };
type Outcome = "all" | "income" | "outcome";

function buildFilterBody(
  o: {
    store: string;
    deliver: string;
    client: string;
    seller: string;
    q: string;
    dateFrom: string;
    dateTo: string;
    outcome: Outcome;
  }
): ReportFilterBody {
  const b: ReportFilterBody = {
    store: o.store || undefined,
    deliver: o.deliver || undefined,
    client: o.client || undefined,
    seller: o.seller || undefined,
    search: o.q?.trim() || undefined,
  };
  if (o.dateFrom) b.selectedDate = toReportDateParam(o.dateFrom);
  if (o.dateTo) b.finishedDate = toReportDateParam(o.dateTo);
  if (o.outcome === "income") b.isEnter = true;
  if (o.outcome === "outcome") b.isEnter = false;
  return b;
}

export default function ReportsPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JsonObject[]>([]);
  const [hisob, setHisob] = useState<Hisob | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [totalCount, setTotalCount] = useState(0);
  const [useFilters, setUseFilters] = useState(false);

  const [stores, setStores] = useState<StoreRow[]>([]);
  const [delivers, setDelivers] = useState<DeliverRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [users, setUsers] = useState<EmployeeRow[]>([]);

  const [outcome, setOutcome] = useState<Outcome>("all");
  const [store, setStore] = useState("");
  const [deliver, setDeliver] = useState("");
  const [client, setClient] = useState("");
  const [seller, setSeller] = useState("");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(true);

  const fetchList = useCallback(
    async (pageArg: number, withFilters: boolean) => {
      setLoading(true);
      setErr(null);
      try {
        if (withFilters) {
          const body = buildFilterBody({
            store,
            deliver,
            client,
            seller,
            q,
            dateFrom,
            dateTo,
            outcome,
          });
          const res = await postReportsFilter(body, limit, pageArg);
          const rows = Array.isArray(res?.data) ? res.data : [];
          setData(rows);
          setHisob((res?.hisob as Hisob) ?? null);
          const fc = rows[0] && (rows[0] as { full_count?: string | number }).full_count;
          setTotalCount(fc != null ? Number(fc) : rows.length);
        } else {
          const res = await getReportsList(limit, pageArg);
          const rows = Array.isArray(res?.data) ? res.data : [];
          setData(rows);
          setHisob((res?.hisob as Hisob) ?? null);
          const fc = rows[0] && (rows[0] as { full_count?: string | number }).full_count;
          setTotalCount(fc != null ? Number(fc) : rows.length);
        }
        setPage(pageArg);
      } catch (e) {
        setErr(unwrapError(e));
        setData([]);
        setHisob(null);
        setTotalCount(0);
      }
      setLoading(false);
    },
    [store, deliver, client, seller, q, dateFrom, dateTo, outcome, limit]
  );

  useEffect(() => {
    const loadRef = async () => {
      try {
        const [a, b, c, d] = await Promise.all([
          api.get<StoreRow[] | unknown>(`store/store-list`),
          api.get<DeliverRow[] | unknown>(`deliver/deliver-list`),
          api.get<ClientRow[] | unknown>(`clients/clients-list`),
          api.get<EmployeeRow[] | unknown>(`users/users-list`),
        ]);
        setStores(Array.isArray(a.data) ? a.data : []);
        setDelivers(Array.isArray(b.data) ? b.data : []);
        setClients(
          Array.isArray(c.data) ? c.data.filter((x) => !x.isdelete) : []
        );
        setUsers(Array.isArray(d.data) ? d.data : []);
      } catch {
        // ref data ixtiyoriy
      }
    };
    void loadRef();
  }, []);

  const firstLoad = useRef(true);
  useEffect(() => {
    if (!firstLoad.current) return;
    firstLoad.current = false;
    void (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getReportsList(limit, 1);
        const rows = Array.isArray(res?.data) ? res.data : [];
        setData(rows);
        setHisob((res?.hisob as Hisob) ?? null);
        const fc =
          rows[0] && (rows[0] as { full_count?: string | number }).full_count;
        setTotalCount(fc != null ? Number(fc) : rows.length);
        setPage(1);
      } catch (e) {
        setErr(unwrapError(e));
        setData([]);
        setTotalCount(0);
      }
      setLoading(false);
    })();
  }, [limit]);

  const onApply = () => {
    setUseFilters(true);
    void fetchList(1, true);
  };
  const onClear = () => {
    setUseFilters(false);
    setOutcome("all");
    setStore("");
    setDeliver("");
    setClient("");
    setSeller("");
    setQ("");
    setDateFrom("");
    setDateTo("");
    void fetchList(1, false);
  };
  const onRefresh = () => {
    void fetchList(page, useFilters);
  };

  const maxPage = Math.max(1, Math.ceil(totalCount / limit) || 1);
  const isEnterVal = (row: JsonObject): boolean | null => {
    const v = row.isenter;
    if (typeof v === "boolean") return v;
    if (v === "true" || v === 1) return true;
    if (v === "false" || v === 0) return false;
    return null;
  };

  return (
    <div className="page">
      <SectionHeader
        title="Hisobotlar"
        action={
          <button
            className="btn btn--sm btn--secondary"
            type="button"
            onClick={() => void onRefresh()}
          >
            Yangilash
          </button>
        }
      />

      <div className="m-filters">
        <button
          type="button"
          className="btn btn--sm btn--secondary"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? "Filtrni yig‘ish" : "Filtrlarni ochish"}
        </button>
        {filtersOpen ? (
          <>
            <div className="m-filters__row">
              <label>
                <span>Turi (kirim/chiqim)</span>
                <select
                  className="input"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value as Outcome)}
                >
                  <option value="all">Hammasi</option>
                  <option value="income">Kirim (omborga)</option>
                  <option value="outcome">Chiqim (sotish)</option>
                </select>
              </label>
              <label>
                <span>Doʻkon (ombor)</span>
                <select
                  className="input"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {stores.map((s) => (
                    <option key={s.store_id} value={s.store_name ?? ""}>
                      {s.store_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="m-filters__row">
              <label>
                <span>Yetkazib beruvchi</span>
                <select
                  className="input"
                  value={deliver}
                  onChange={(e) => setDeliver(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {delivers.map((d) => (
                    <option key={d.deliver_id} value={d.deliver_name ?? ""}>
                      {d.deliver_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Mijoz</span>
                <select
                  className="input"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {clients.map((c) => (
                    <option
                      key={c.clients_id}
                      value={c.clients_name}
                    >
                      {c.clients_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="m-filters__row">
              <label>
                <span>Xodim</span>
                <select
                  className="input"
                  value={seller}
                  onChange={(e) => setSeller(e.target.value)}
                >
                  <option value="">Barcha</option>
                  {users.map((u) => (
                    <option key={u.user_id} value={u.user_name}>
                      {u.user_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Qidiruv (mahsulot)</span>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Nom yoki kod"
                />
              </label>
            </div>
            <div className="m-filters__row">
              <label>
                <span>Sana (dan)</span>
                <input
                  type="date"
                  className="input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </label>
              <label>
                <span>Sana (gacha)</span>
                <input
                  type="date"
                  className="input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </label>
            </div>
            <div className="m-filters__row" style={{ marginTop: "0.25rem" }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={() => void onApply()}
              >
                Qo‘llash
              </button>
              <button
                type="button"
                className="btn btn--sm btn--secondary"
                onClick={() => void onClear()}
              >
                Tozalash
              </button>
            </div>
          </>
        ) : null}
      </div>

      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {hisob && Object.keys(hisob).length > 0 ? (
        <div className="m-chiprow">
          {Object.entries(hisob).map(([k, v]) => (
            <div key={k} className="m-chip">
              <b>{REPORT_LABELS[k] ?? k}</b>
              <span>
                {typeof v === "number" ? formatNumber(v) : String(v ?? "—")}
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="m-pager">
        <button
          type="button"
          className="btn btn--sm"
          disabled={page <= 1}
          onClick={() => void fetchList(page - 1, useFilters)}
        >
          Orqaga
        </button>
        <span className="muted">
          Sahifa {page} / {maxPage} · jami: {formatNumber(totalCount)}
        </span>
        <button
          type="button"
          className="btn btn--sm"
          disabled={page >= maxPage}
          onClick={() => void fetchList(page + 1, useFilters)}
        >
          Keyingi
        </button>
      </div>

      {data.length === 0 && !loading ? (
        <EmptyState
          text="Hisobot topilmadi"
          hint="Filtrni o‘zgartirib, «Qo‘llash» ni bosing"
        />
      ) : null}
      {data.map((row, i) => {
        const pairs = pickReportRowFields(row as Record<string, unknown>);
        const e = isEnterVal(row);
        const id = (row as { reports_id?: string }).reports_id;
        return (
          <MobileCard key={id || String(i)}>
            <div className="m-report-head">
              {e !== null ? (
                <span
                  className={
                    e ? "m-badge m-badge--in" : "m-badge m-badge--out"
                  }
                >
                  {e ? "Kirim" : "Chiqim"}
                </span>
              ) : null}
              {id ? (
                <button
                  type="button"
                  className="btn btn--sm btn--danger"
                  onClick={() => {
                    if (!window.confirm("Hisobot o‘chirilsinmi?")) return;
                    void (async () => {
                      try {
                        await deleteReport(String(id));
                        setData((prev) =>
                          prev.filter(
                            (r) => (r as { reports_id?: string }).reports_id !== id
                          )
                        );
                      } catch (er) {
                        setErr(unwrapError(er));
                      }
                    })();
                  }}
                >
                  O‘chir
                </button>
              ) : null}
            </div>
            {pairs.map((p) => (
              <div key={p.key} className="m-statrow m-statrow--plain">
                <span className="m-statrow__label">{p.label}</span>
                <span className="m-statrow__val">{p.value}</span>
              </div>
            ))}
          </MobileCard>
        );
      })}
    </div>
  );
}
