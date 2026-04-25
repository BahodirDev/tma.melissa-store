import { api, unwrapError } from "./client";
import type {
  ClientRow,
  CurrencyRow,
  EmployeeRow,
  UserBrief,
  LoginResponse,
} from "../types/api";

const U = (path: string) => path.replace(/^\//, "");

/**
 * API paths mirror Flutter `api_service.dart` and melissa-front-dev `customHook/api`.
 * Base URL is `VITE_API_BASE` (e.g. https://host/api).
 */
export const authApi = {
  async login(
    user_login: string,
    user_password: string
  ): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(U("auth/auth-user"), {
      user_login,
      user_password,
    });
    return data;
  },
  async check() {
    const { data } = await api.get<{ ok: boolean }>(U("auth/auth-user-check"));
    return data;
  },
};

export const currencyApi = {
  list: () =>
    api.get<CurrencyRow[]>(U("currency/currency-list")).then((r) => r.data),
  search: (currency_name: string) =>
    api
      .post<CurrencyRow[]>(U("currency/currency-search"), { currency_name })
      .then((r) => r.data),
  create: (body: {
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
    currency_amount: number;
    name: string;
    flag: string;
  }) => api.post(U("currency/currency-post"), body).then((r) => r.status),
  update: (currency_id: string, body: Record<string, unknown>) =>
    api
      .patch(U(`currency/currency-patch/${currency_id}`), body)
      .then((r) => r.status),
  remove: (currency_id: string) =>
    api.delete(U(`currency/currency-delete/${currency_id}`)).then((r) => r.status),
};

export const userApi = {
  list: () => api.get<EmployeeRow[]>(U("users/users-list")).then((r) => r.data),
  search: (search: string) =>
    api.post<EmployeeRow[]>(U("users/users-search"), { search }).then((r) => r.data),
  create: (body: {
    user_name: string;
    user_password: string;
    user_login: string;
    user_nomer: string;
  }) => api.post(U("users/users-post"), body).then((r) => r.status),
  update: (user_id: string, body: Record<string, unknown>) =>
    api
      .patch(U(`users/users-patch/${user_id}`), body)
      .then((r) => r.status),
  remove: (id: string) =>
    api.delete(U(`users/users-delete/${id}`)).then((r) => r.status),
};

export const clientApi = {
  list: () => api.get<ClientRow[]>(U("clients/clients-list")).then((r) => r.data),
  search: (search: string) =>
    api
      .post<ClientRow[]>(U("clients/clients-search"), { search })
      .then((r) => r.data),
  create: (body: {
    clients_name: string;
    clients_nomer: string;
    clients_desc: string;
  }) => api.post(U("clients/clients-post"), body).then((r) => r.status),
  update: (clients_id: string, body: Record<string, unknown>) =>
    api
      .patch(U(`clients/clients-patch/${clients_id}`), body)
      .then((r) => r.status),
  remove: (id: string) =>
    api.delete(U(`clients/clients-delete/${id}`)).then((r) => r.status),
};

export { unwrapError };

export const USER_BRIEF_KEY = "melissa_tma_user_brief";

export function readUserBrief(): UserBrief | null {
  const raw = localStorage.getItem(USER_BRIEF_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserBrief;
  } catch {
    return null;
  }
}

export function storeUserBrief(u: UserBrief) {
  localStorage.setItem(USER_BRIEF_KEY, JSON.stringify(u));
}

export function clearUserBrief() {
  localStorage.removeItem(USER_BRIEF_KEY);
}
