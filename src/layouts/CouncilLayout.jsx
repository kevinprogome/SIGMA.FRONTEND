//layouts/ConuncilLayout.jsx//
import { useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/council/layout.css";

export default function CouncilLayout() {
  console.log("🏛️ CouncilLayout montado");
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("CouncilLayout useEffect - usuario:", user);
    
    return () => {
      console.log("CouncilLayout desmontado");
    };
  }, [user]);

  const handleLogout = () => {
    console.log("Iniciando logout desde CouncilLayout");
    logout();
    navigate("/login");
  };

  return (
    <div className="council-layout">
      {/* Sidebar */}
      <aside className="council-sidebar">
        <div className="sidebar-header">
          <h2>Consejo de Facultad</h2>
          <p className="user-info">{user?.email || "Cargando..."}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/council"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">📋</span>
            Estudiantes Pendientes
          </NavLink>

          <NavLink
            to="/council/cancellations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            <span className="nav-icon">🚫</span>
            Solicitudes de Cancelación
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="council-main">
        <Outlet />
      </main>
    </div>
  );
}