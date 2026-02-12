import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role, token } = useAuth();

  console.log("🔐 ProtectedRoute check:", { 
    isAuthenticated, 
    role, 
    allowedRoles, 
    loading 
  });

  // ⏳ Esperar a que el auth esté completamente listo
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  // 🔐 No autenticado
  if (!isAuthenticated || !token) {
    console.log("❌ Usuario no autenticado, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  // 🚨 Si no hay rol, redirigir
  if (!role) {
    console.error("❌ No hay rol disponible");
    return <Navigate to="/login" replace />;
  }

  // 🧠 Validación por rol
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.log("❌ Rol no autorizado:", role, "Roles permitidos:", allowedRoles);
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Acceso permitido para rol:", role);
  return <Outlet />;
}