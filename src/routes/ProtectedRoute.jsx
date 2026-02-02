import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, role, token } = useAuth();

  // ⏳ Esperar a que el auth esté completamente listo
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Cargando...
      </div>
    );
  }

  // 🔐 No autenticado
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  // 🔄 Fallback: re-extraer rol del token si no está disponible
  let userRole = role;
  
  if (!userRole) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded?.role?.toUpperCase() || 
                 decoded?.authorities?.[0]?.replace("ROLE_", "").toUpperCase() ||
                 decoded?.authority?.replace("ROLE_", "").toUpperCase();
    } catch (error) {
      console.error("Error decodificando token:", error);
      return <Navigate to="/login" replace />;
    }
  }

  // 🚨 Si aún no hay rol, redirigir
  if (!userRole) {
    console.error("No se pudo determinar el rol del usuario");
    return <Navigate to="/login" replace />;
  }

  // 🧠 Validación por rol
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}