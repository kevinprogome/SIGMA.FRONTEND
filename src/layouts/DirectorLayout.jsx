import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin/AdminLayout.css";

export default function DirectorLayout() {
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
          <h1 className="admin-logo">SIGMA DIRECTOR</h1>
          <p className="admin-subtitle">Director de Proyecto</p>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">
            <h3 className="admin-nav-title">Estudiantes</h3>
            <NavLink to="/project-director" end className="admin-nav-link">
              <span className="admin-nav-icon">📊</span>
              Dashboard
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