import { api } from "./client";
import type {
  GoodsRow,
  JsonObject,
  ProductsListResponse,
  ReportListResponse,
} from "../types/api-responses";

const U = (path: string) => path.replace(/^\//, "");

/** Sana: `YYYY-MM-DD` (input) -> `YYYY/MM/DD` (server / front-dev) */
export function toReportDateParam(isoDate: string): string {
  return isoDate.replaceAll("-", "/");
}

export type ReportFilterBody = {
  store?: string;
  deliver?: string;
  client?: string;
  seller?: string;
  search?: string;
  selectedDate?: string | null;
  finishedDate?: string | null;
  isEnter?: boolean;
  goods_id?: string;
  id?: string | null;
};

export async function postReportsFilter(
  body: ReportFilterBody,
  limit: number,
  page: number
): Promise<ReportListResponse> {
  const { data } = await api.post<ReportListResponse>(
    U(`reports/reports-filter?limit=${limit}&page=${page}`),
    body
  );
  return data;
}

export async function getReportsList(
  limit: number,
  page: number
): Promise<ReportListResponse> {
  const { data } = await api.get<ReportListResponse>(
    U(`reports/reports-list?limit=${limit}&page=${page}`)
  );
  return data;
}

export async function deleteReport(reportsId: string): Promise<void> {
  await api.delete(U(`reports/reports-delete/${reportsId}`));
}

export type ProductsFilterBody = {
  search: string;
  store_id?: string | null;
  deliver_id?: string | null;
};

export async function postProductsFilter(
  body: ProductsFilterBody,
  query: { limit: number; page: number; date?: string | null; price?: string | null }
): Promise<ProductsListResponse> {
  const q = new URLSearchParams();
  q.set("limit", String(query.limit));
  q.set("page", String(query.page));
  if (query.date) q.set("date", query.date);
  if (query.price) q.set("price", query.price);
  const { data } = await api.post<ProductsListResponse>(
    U(`products/products-filter?${q.toString()}`),
    body
  );
  return data;
}

export async function getProductsList(
  limit: number,
  page: number
): Promise<ProductsListResponse> {
  const { data } = await api.get<ProductsListResponse>(
    U(`products/products-list?limit=${limit}&page=${page}`)
  );
  return data;
}

export type LowStockQuery = {
  store_id?: string;
  deliver_id?: string;
  search?: string;
  limit?: string;
  page?: string;
};

export async function getProductsLowStock(
  q: LowStockQuery
): Promise<unknown> {
  const p = new URLSearchParams();
  if (q.store_id) p.set("store_id", q.store_id);
  if (q.deliver_id) p.set("deliver_id", q.deliver_id);
  if (q.search != null && q.search !== "") p.set("search", q.search);
  if (q.limit) p.set("limit", q.limit);
  if (q.page) p.set("page", q.page);
  const path =
    p.toString() === ""
      ? U("products/products-low-stock")
      : U(`products/products-low-stock?${p.toString()}`);
  const { data } = await api.get(path);
  return data;
}

export async function postReturnFilter(search: string): Promise<{
  data?: JsonObject[];
  count?: number;
}> {
  const s = search.trim() === "" ? " " : search;
  const { data } = await api.post(U("return/return-filter"), { search: s });
  return data as { data?: JsonObject[]; count?: number };
}

export async function getReturnList(): Promise<{
  data?: JsonObject[];
  return?: number;
}> {
  const { data } = await api.get(U("return/return-list"));
  return data as { data?: JsonObject[]; return?: number };
}

export type GoodsSearchBody = {
  search: string;
  deliver_id?: string | null;
};

export async function postGoodsSearch(
  body: GoodsSearchBody,
  limit: number,
  page: number
): Promise<GoodsRow[]> {
  const s = body.search.trim() === "" ? " " : body.search;
  const { data } = await api.post<GoodsRow[]>(
    U(`goods/goods-search?limit=${limit}&page=${page}`),
    { ...body, search: s }
  );
  return Array.isArray(data) ? data : [];
}
