import { formatDate, formatNumber } from "./format";

const DATE_KEYS = new Set([
  "reports_createdat",
  "return_createdat",
  "store_createdat",
  "createdat",
]);

/** Qaytarish API — `return_list` qatori */
export const RETURN_LABELS: Record<string, string> = {
  return_name: "Mahsulot",
  return_count: "Miqdor",
  return_cost: "Narx / summa",
  return_store: "Ombor / joy",
  return_case: "Sabab / izoh",
  return_createdat: "Sana",
};

const RETURN_PREFERRED: string[] = [
  "return_name",
  "return_count",
  "return_cost",
  "return_store",
  "return_case",
  "return_createdat",
];

const RETURN_EXCLUDE_KEYS = new Set<string>(["return_id"]);

/** Hisobotlar `r.*` + join */
export const REPORT_LABELS: Record<string, string> = {
  current_goods_name: "Mahsulot",
  goods_name: "Eski yoki asl nom",
  goods_code: "Kod",
  current_goods_code: "Kod (hozirgi)",
  reports_createdat: "Sana",
  reports_count: "Miqdor",
  reports_count_price: "1 dona sotish narxi",
  reports_count_cost: "1 dona ombor narxi",
  reports_total_cost: "Jami summa",
  client: "Mijoz",
  store: "Doʻkon / ombor",
  deliver: "Yetkazib beruvchi",
  isenter: "Turi",
  user_info: "Tizimda",
  currency: "Valyuta",
  full_count: "Jami (filtr)",
  reports_id: "ID",
  totalCost: "Jami aylanma",
  totalProductCost: "Foyda",
  totalCostPilus: "Kirim (qiymat)",
  totalCostMinus: "Chiqim (qiymat)",
  totalInput: "Kirim (miqdor)",
  totalOuput: "Sotish (miqdor)",
};

const REPORT_PREFERRED: string[] = [
  "current_goods_name",
  "goods_name",
  "reports_createdat",
  "reports_count",
  "reports_count_price",
  "client",
  "store",
  "isenter",
];

const REPORT_EXCLUDE_KEYS = new Set<string>(["full_count", "reports_id", "goods_id"]);

function formatRowValue(k: string, v: unknown): string {
  if (k === "isenter") {
    if (typeof v === "boolean") {
      return v ? "Kirim (omborga)" : "Sotishdan (chiqim)";
    }
    if (v === "true" || v === 1) return "Kirim (omborga)";
    if (v === "false" || v === 0) return "Sotishdan (chiqim)";
  }
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Ha" : "Yo‘q";
  if (v instanceof Date) {
    return formatDate(v.toISOString());
  }
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return "—";
    }
  }
  if (typeof v === "number" && Number.isFinite(v)) {
    if (k.includes("price") || k.includes("cost") || k === "totalCost") {
      return formatNumber(v);
    }
    if (k.includes("count") || k === "reports_count") {
      return formatNumber(v);
    }
    return String(v);
  }
  if (typeof v === "string") {
    if (DATE_KEYS.has(k) && v.length > 4) {
      const t = Date.parse(v);
      if (!Number.isNaN(t)) return formatDate(v);
    }
    return v;
  }
  return String(v);
}

export type LabeledRowField = { key: string; label: string; value: string };

/**
 * 5–6 ta tushunarli maydon: avvalo `preferred`, keyin qolgani (alfavit bo‘yicha).
 */
export function pickLabeledRowFields(
  row: Record<string, unknown>,
  labels: Record<string, string>,
  preferred: string[],
  max = 6
): LabeledRowField[] {
  const keys = new Set(Object.keys(row));
  const out: LabeledRowField[] = [];
  for (const k of preferred) {
    if (!keys.has(k) || out.length >= max) continue;
    out.push({
      key: k,
      label: labels[k] ?? k,
      value: formatRowValue(k, row[k]),
    });
  }
  if (out.length < max) {
    const excl =
      labels === REPORT_LABELS
        ? REPORT_EXCLUDE_KEYS
        : labels === RETURN_LABELS
          ? RETURN_EXCLUDE_KEYS
          : null;
    const rest = Array.from(keys)
      .filter(
        (k) =>
          !out.some((p) => p.key === k) && (excl == null || !excl.has(k))
      )
      .sort();
    for (const k of rest) {
      if (out.length >= max) break;
      out.push({
        key: k,
        label: labels[k] ?? k,
        value: formatRowValue(k, row[k]),
      });
    }
  }
  return out;
}

export function pickReportRowFields(
  row: Record<string, unknown>
): LabeledRowField[] {
  return pickLabeledRowFields(row, REPORT_LABELS, REPORT_PREFERRED, 6);
}

export function pickReturnRowFields(
  row: Record<string, unknown>
): LabeledRowField[] {
  return pickLabeledRowFields(row, RETURN_LABELS, RETURN_PREFERRED, 6);
}
