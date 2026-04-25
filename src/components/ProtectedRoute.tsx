import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredToken } from "../api/client";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const loc = useLocation();
  if (!getStoredToken()) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <>{children}</>;
}
