import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/routes";
import { unwrapError } from "../api/client";

const nav = [
  { to: "/statistics", label: "Stat" },
  { to: "/products", label: "Mahsulot" },
  { to: "/reports", label: "Hisobot" },
  { to: "/return", label: "Qayt." },
  { to: "/store", label: "Ombor" },
  { to: "/deliver", label: "Post." },
  { to: "/debts", label: "Qarz" },
  { to: "/currency", label: "Valyuta" },
  { to: "/users", label: "Xodim" },
  { to: "/clients", label: "Mijoz" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

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
          // eslint-disable-next-line no-console
          console.warn("auth-user-check:", unwrapError(e));
        }
      });
    return () => {
      c = false;
    };
  }, [pathname]);

  return (
    <div className="app-shell">
      <header className="top">
        <div>
          <strong>Melissa</strong>
          <div className="sub">
            {user?.user_name ?? "—"}{" "}
            {apiOk === null ? "…" : apiOk ? "" : ""}
            <span className="role">{user?.user_role ?? ""}</span>
          </div>
        </div>
        <button type="button" className="linkbtn" onClick={logout}>
          Chiqish
        </button>
      </header>

      <div className="content-scroll">
        <Outlet />
      </div>

      <nav className="bottomnav" aria-label="Asosiy">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              `navlink${isActive ? " navlink--on" : ""}`
            }
          >
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="tma-pad" />
    </div>
  );
}
