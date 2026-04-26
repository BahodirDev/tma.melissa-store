import { useCallback, useEffect, useState } from "react";
import { api, unwrapError } from "../api/client";
import type { DeliverRow } from "../types/api-responses";
import { MobileCard } from "../components/m/MobileCard";
import { SectionHeader } from "../components/m/SectionHeader";
import { LoadingBlock } from "../components/m/LoadingBlock";
import { ErrorBanner } from "../components/m/ErrorBanner";
import { EmptyState } from "../components/m/EmptyState";
import { formatNumber } from "../utils/format";

export default function DeliverPage() {
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DeliverRow[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await api.get<DeliverRow[] | unknown>("deliver/deliver-list");
      setRows(Array.isArray(r.data) ? (r.data as DeliverRow[]) : []);
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
      <SectionHeader
        title="Ta‘minotchi"
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
      {err ? <ErrorBanner message={err} /> : null}
      {loading ? <LoadingBlock /> : null}
      {rows.length === 0 && !loading ? <EmptyState text="Ro‘yxat bo‘sh" /> : null}
      {rows.map((d) => {
        const debts = Array.isArray(d.deliver_debts) ? d.deliver_debts : [];
        const more = Math.max(0, debts.length - 3);
        return (
          <MobileCard key={String(d.deliver_id)}>
            <h3 className="m-list-item__title">{d.deliver_name || "—"}</h3>
            {d.deliver_nomer ? (
              <p className="m-list-item__meta">{d.deliver_nomer}</p>
            ) : null}
            {debts.length > 0 ? (
              <div className="m-deliver-debts">
                <p className="m-deliver-debts__title">Qarzdor bo‘lgan tovarlar</p>
                {debts.slice(0, 3).map((b, j) => {
                  const name =
                    typeof b === "object" && b !== null && "goods" in b
                      ? String(
                          (b as { goods?: { goods_name?: string } }).goods
                            ?.goods_name ?? "—"
                        )
                      : "—";
                  const sum =
                    typeof b === "object" && b !== null && "deliver_debt_amount" in b
                      ? formatNumber(
                          (b as { deliver_debt_amount?: number }).deliver_debt_amount
                        )
                      : "—";
                  return (
                    <div key={j} className="m-deliver-debts__row">
                      <span>{name}</span>
                      <span className="m-deliver-debts__sum">{sum}</span>
                    </div>
                  );
                })}
                {more > 0 ? (
                  <p className="m-deliver-debts__more">+yana {more} ta koʻrinmayapti</p>
                ) : null}
              </div>
            ) : null}
          </MobileCard>
        );
      })}
    </div>
  );
}
