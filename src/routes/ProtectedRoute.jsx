import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();

  // ⏳ Esperamos a que cargue el contexto
  if (loading) return null;

  // 🔐 No autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🧠 Validación por rol
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
