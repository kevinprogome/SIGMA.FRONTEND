import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin/AdminLayout.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1 className="admin-logo">SIGMA ADMIN</h1>
          <p className="admin-subtitle">Panel de Administración</p>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">
            <h3 className="admin-nav-title">Gestión de Accesos</h3>
            <NavLink to="/admin/roles" className="admin-nav-link">
              <span className="admin-nav-icon">👥</span>
              Roles
            </NavLink>
            <NavLink to="/admin/permissions" className="admin-nav-link">
              <span className="admin-nav-icon">🔑</span>
              Permisos
            </NavLink>
            <NavLink to="/admin/users" className="admin-nav-link">
              <span className="admin-nav-icon">👤</span>
              Usuarios
            </NavLink>
          </div>

          <div className="admin-nav-section">
            <h3 className="admin-nav-title">Modalidades de Grado</h3>
            <NavLink to="/admin/modalities" className="admin-nav-link">
              <span className="admin-nav-icon">📚</span>
              Modalidades
            </NavLink>
            <NavLink to="/admin/requirements" className="admin-nav-link">
              <span className="admin-nav-icon">✅</span>
              Requerimientos
            </NavLink>
            <NavLink to="/admin/documents" className="admin-nav-link">
              <span className="admin-nav-icon">📄</span>
              Documentos
            </NavLink>
          </div>
        </nav>

        <button onClick={handleLogout} className="admin-logout-btn">
          Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}