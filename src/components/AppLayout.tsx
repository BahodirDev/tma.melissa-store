import { Suspense, useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/routes";
import { unwrapError } from "../api/client";
import { LoadingBlock } from "./m/LoadingBlock";
import SellModal from "./SellModal";

const NAV = [
  { to: "/statistics", label: "Statistika", icon: "▣" },
  { to: "/reports", label: "Hisobotlar", icon: "▤" },
  { to: "/products", label: "Mahsulotlar", icon: "▦" },
  { to: "/categories", label: "Kategoriyalar", icon: "▥" },
  { to: "/return", label: "Qaytgan mahsulotlar", icon: "↩" },
  { to: "/debts", label: "Qarzdorlik", icon: "◎" },
  { to: "/store", label: "Ombor", icon: "⌂" },
  { to: "/deliver", label: "Ta‘minotchi", icon: "⏚" },
  { to: "/clients", label: "Mijozlar", icon: "◎" },
  { to: "/users", label: "Xodimlar", icon: "◉" },
  { to: "/currency", label: "Pul birliklar", icon: "⟡" },
] as const;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  const closeDrawer = useCallback(() => setDrawer(false), []);
  const openDrawer = useCallback(() => setDrawer(true), []);

  useEffect(() => {
    // Marshrut o‘zgaganda (orqaga / link) yon menyu yopilishi.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bitta UI qadami: surib chiqilgan drawer
    setDrawer(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sotish modali bitta sahifada qoladi
    setSellOpen(false);
  }, [pathname]);

  useEffect(() => {
    let c = true;
    authApi
      .check()
      .then(() => {
        if (c) setApiOk(true);
      })
      .catch((e) => {
        if (c) {
          setApiOk(false);
          if (import.meta.env.DEV) {
            console.warn("auth-user-check:", unwrapError(e));
          }
        }
      });
    return () => {
      c = false;
    };
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const initials = (user?.user_name || "?").slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <div className="m-appbar-wrap">
        <div
          className={`m-appbar${apiOk === false ? " m-appbar--warn" : ""}`.trim()}
        >
          <button
            type="button"
            className="m-appbar__menu"
            aria-label="Menyu"
            onClick={openDrawer}
          >
            ☰
          </button>
          <div className="m-appbar__spacer" />
          <div className="m-appbar__user">
            <div className="m-appbar__name">{user?.user_name ?? "—"}</div>
            <div className="m-appbar__role">{user?.user_role ?? ""}</div>
          </div>
          <div className="m-appbar__avatar" aria-hidden>
            {initials}
          </div>
        </div>
      </div>

      {drawer ? (
        <div
          className="m-drawer-backdrop"
          role="presentation"
          onClick={closeDrawer}
        />
      ) : null}
      <aside
        className={`m-drawer${drawer ? " m-drawer--open" : ""}`}
        aria-hidden={!drawer}
        inert={!drawer ? true : undefined}
        aria-label="Yon menyu"
      >
        <div className="m-drawer__head">
          <span>Melissa-Store</span>
          <button type="button" onClick={closeDrawer} aria-label="Yopish">
            ×
          </button>
        </div>
        <nav className="m-drawer__nav" aria-label="Asosiy menyu">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `m-drawer__link${isActive ? " m-drawer__link--active" : ""}`
              }
              onClick={closeDrawer}
            >
              <span className="m-drawer__ic" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="m-drawer__foot">
          <button
            type="button"
            className="m-drawer__link m-drawer__logout"
            onClick={() => {
              closeDrawer();
              logout();
            }}
          >
            <span className="m-drawer__ic" aria-hidden>
              ⎋
            </span>
            Chiqish
          </button>
        </div>
      </aside>

      <div className="content-scroll">
        <Suspense
          fallback={
            <div className="page">
              <LoadingBlock />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </div>
      <SellModal open={sellOpen} onOpenChange={setSellOpen} />
    </div>
  );
}
