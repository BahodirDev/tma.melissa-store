/**
 * Telegram WebApp API from index.html: <script src="https://telegram.org/js/telegram-web-app.js" />
 * We use window.Telegram.WebApp only (not the @twa-dev/sdk default import) so Vite ESM + CJS
 * interop does not break at runtime (WebApp.ready is not a function).
 */
type WebAppInstance = {
  ready: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
};

function getWindowWebApp(): WebAppInstance | null {
  if (typeof window === "undefined") return null;
  const w = (
    window as unknown as { Telegram?: { WebApp?: unknown } }
  ).Telegram?.WebApp;
  if (w && typeof (w as WebAppInstance).ready === "function") {
    return w as WebAppInstance;
  }
  return null;
}

let didInit = false;

export function initTelegramWebApp() {
  if (didInit) return;
  didInit = true;
  const wa = getWindowWebApp();
  if (!wa) return;
  wa.ready();
  try {
    wa.expand();
  } catch {
    // ignore
  }
  if (wa.setHeaderColor) {
    wa.setHeaderColor("#0f172a");
  }
  if (wa.setBackgroundColor) {
    wa.setBackgroundColor("#f8fafc");
  }
}

export function isTelegramEnv() {
  return (
    typeof window !== "undefined" && Boolean(getWindowWebApp())
  );
}

/** Current Telegram WebApp, or null outside Telegram (e.g. local dev) */
export function getWebApp() {
  return getWindowWebApp();
}
