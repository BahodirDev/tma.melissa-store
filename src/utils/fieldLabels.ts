/**
 * Foydalanuvchiga ko‘rinadigan forma yorliqlari (server kalitlari yashiringan).
 */
export const currencyFormLabels = {
  currency_name: "Pul nomi (masalan, dollar)",
  currency_code: "Kod (USD, UZS...)",
  currency_symbol: "Belgi ($, soʻm...)",
  currency_amount: "1 birlikning soʻmdagi narx (kurs)",
  name: "Qisqacha eslatma (ichki nom)",
  flag: "Bayroq yoki yorliq (ixtiyoriy)",
} as const;

export const employeeFormLabels = {
  user_name: "Ism-familiya yoki nik",
  user_login: "Tizimga kirish (login)",
  user_password: "Parol",
  user_nomer: "Telefon raqami",
} as const;

export const clientFormLabels = {
  clients_name: "Mijoz nomi yoki do‘kon",
  clients_nomer: "Telefon raqami",
  clients_desc: "Izoh yoki manzil (ixtiyoriy)",
} as const;

/** Foydalanuvchi / xodim rollari (API qiymatlari). */
const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Menejer",
  sotuvchi: "Sotuvchi",
  ombor: "Ombor",
  kassir: "Kassir",
  user: "Foydalanuvchi",
  owner: "Egasi",
};

/**
 * Roldagi qiymatni tushunarli o‘zbekcha/oddiy so‘zga aylantiradi.
 */
export function formatUserRole(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = raw.trim().toLowerCase();
  return ROLE_LABELS[k] ?? raw;
}

/** Qarz operatsiyasi turi (API). */
const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  in: "Kirim",
  out: "Chiqim",
  credit: "Kredit",
  debit: "Debet",
  pay: "Toʻlov",
  payment: "Toʻlov",
  transfer: "Oʻtkazma",
};

/**
 * `transaction_type` uchun tushunarli sarlavha.
 */
export function formatTransactionType(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "—";
  const k = String(raw).trim().toLowerCase();
  return TRANSACTION_TYPE_LABELS[k] ?? String(raw);
}
