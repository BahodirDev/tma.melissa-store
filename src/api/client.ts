import axios, { type AxiosError } from "axios";

const TOKEN_KEY = "melissa_tma_user";

export function getStoredToken(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function baseUrl(): string {
  return (import.meta.env.VITE_API_BASE || "").replace(/\/+$/, "");
}

export const api = axios.create({
  baseURL: baseUrl() || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) {
    config.headers.Authorization = t;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearStoredToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("melissa:logout"));
      }
    }
    return Promise.reject(err);
  }
);

export function unwrapError(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as
      | { message?: string; error?: string }
      | undefined;
    if (data?.message) return String(data.message);
    if (data?.error) return String(data.error);
    return e.message || "Tarmoq xatosi";
  }
  if (e instanceof Error) return e.message;
  return "Noma’lum xatolik";
}
