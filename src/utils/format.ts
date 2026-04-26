export function formatNumber(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const n = typeof v === "string" ? parseFloat(v) : v;
  if (Number.isNaN(n)) return String(v);
  return new Intl.NumberFormat("uz-UZ").format(n);
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const t = Date.parse(d);
  if (Number.isNaN(t)) return d;
  return new Intl.DateTimeFormat("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(t);
}

export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = (import.meta.env.VITE_ASSET_BASE || "").replace(/\/+$/, "");
  if (!base) return path;
  return `${base}/${path.replace(/^\//, "")}`;
}
