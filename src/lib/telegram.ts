import WebApp from "@twa-dev/sdk";

let didInit = false;

export function initTelegramWebApp() {
  if (didInit) return;
  didInit = true;
  WebApp.ready();
  try {
    WebApp.expand();
  } catch {
    // ignore
  }
  if (WebApp.setHeaderColor) {
    WebApp.setHeaderColor("#0f172a");
  }
  if (WebApp.setBackgroundColor) {
    WebApp.setBackgroundColor("#f8fafc");
  }
}

export function isTelegramEnv() {
  return (
    typeof window !== "undefined" &&
    Boolean(
      (window as unknown as { Telegram?: { WebApp?: { initData?: string } } })
        .Telegram?.WebApp
    )
  );
}

export { WebApp };
