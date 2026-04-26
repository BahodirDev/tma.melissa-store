/** Shapes aligned with melissa-server JSON (nested json_build_object fields) */

export type JsonObject = Record<string, unknown>;

export type ProductNestedGood = {
  goods_name?: string;
  goods_code?: string;
  dead_limit?: string | number;
};

export type ProductNestedDeliver = { deliver_name?: string };
export type ProductNestedStore = { store_name?: string };
export type ProductNestedCurrency = { currency_name?: string; currency_amount?: string | number; currency_symbol?: string };

export type ProductListRow = {
  products_id?: string;
  img_url?: string | null;
  goods_id?: ProductNestedGood | string;
  deliver_id?: ProductNestedDeliver | string;
  store_id?: ProductNestedStore | string;
  currency_id?: ProductNestedCurrency | string;
  products_count?: string | number;
  products_count_price?: string | number;
  products_count_cost?: string | number;
  products_box_count?: string | number;
  each_box_count?: string | number;
  actual_count?: string | number;
  full_count?: string | number;
  products_updatedat?: string;
};

export type Hisob = {
  totalCount?: number;
  totalAmount?: number;
  totalPrice?: number;
  totalCost?: number;
  [k: string]: unknown;
};

export type ProductsListResponse = {
  data?: ProductListRow[];
  hisob?: Hisob;
};

export type StoreRow = {
  store_id?: string;
  store_name?: string;
  store_main?: boolean;
  store_createdat?: string;
};

export type DeliverRow = {
  deliver_id?: string;
  deliver_name?: string;
  deliver_nomer?: string;
  deliver_debts?: unknown[];
};

export type ReportListResponse = {
  data?: JsonObject[];
  hisob?: JsonObject;
};

export type ReturnListResponse = {
  data?: JsonObject[];
  return?: number;
};

export type GoodsRow = {
  goods_id?: string;
  goods_name?: string;
  goods_code?: string;
  dead_limit?: string | number;
  goods_createdat?: string;
};

export type DebtTransactionRow = {
  transaction_id?: string;
  transaction_money?: string | number;
  transaction_type?: string;
  transaction_summary?: string;
  transaction_created_at?: string;
  [k: string]: unknown;
};
