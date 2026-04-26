import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";

const Statistics = lazy(() => import("./pages/Statistics"));
const Products = lazy(() => import("./pages/Products"));
const Reports = lazy(() => import("./pages/Reports"));
const ReturnPage = lazy(() => import("./pages/ReturnPage"));
const StorePage = lazy(() => import("./pages/StorePage"));
const DeliverPage = lazy(() => import("./pages/DeliverPage"));
const DebtsPage = lazy(() => import("./pages/DebtsPage"));
const Currency = lazy(() => import("./pages/Currency"));
const Employees = lazy(() => import("./pages/Employees"));
const Clients = lazy(() => import("./pages/Clients"));
const Categories = lazy(() => import("./pages/Categories"));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/statistics" replace />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="reports" element={<Reports />} />
            <Route path="return" element={<ReturnPage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="deliver" element={<DeliverPage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="currency" element={<Currency />} />
            <Route path="users" element={<Employees />} />
            <Route path="clients" element={<Clients />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
