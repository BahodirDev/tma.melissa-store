import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Statistics from "./pages/Statistics";
import Products from "./pages/Products";
import Reports from "./pages/Reports";
import ReturnPage from "./pages/ReturnPage";
import StorePage from "./pages/StorePage";
import DeliverPage from "./pages/DeliverPage";
import DebtsPage from "./pages/DebtsPage";
import Currency from "./pages/Currency";
import Employees from "./pages/Employees";
import Clients from "./pages/Clients";

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
