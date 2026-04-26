import type { ProductListRow, ProductNestedGood } from "../types/api-responses";

export function goodName(row: ProductListRow): string {
  const g = row.goods_id;
  if (g && typeof g === "object" && "goods_name" in g) {
    return String((g as ProductNestedGood).goods_name ?? "—");
  }
  return "—";
}

export function goodCode(row: ProductListRow): string {
  const g = row.goods_id;
  if (g && typeof g === "object" && "goods_code" in g) {
    return String((g as ProductNestedGood).goods_code ?? "");
  }
  return "";
}

export function storeName(row: ProductListRow): string {
  const s = row.store_id;
  if (s && typeof s === "object" && "store_name" in s) {
    return String((s as { store_name?: string }).store_name ?? "—");
  }
  return "—";
}

export function deliverName(row: ProductListRow): string {
  const d = row.deliver_id;
  if (d && typeof d === "object" && "deliver_name" in d) {
    return String((d as { deliver_name?: string }).deliver_name ?? "—");
  }
  return "—";
}

export function totalCountFromRow(rows: ProductListRow[] | undefined): number {
  const f = rows?.[0]?.full_count;
  if (f == null) return 0;
  return typeof f === "string" ? parseInt(f, 10) : Number(f);
}
