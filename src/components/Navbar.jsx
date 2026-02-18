import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  getUnreadCount, 
  getMyNotifications,
  markNotificationAsRead,
  getNotificationIcon,
  getRelativeTime,
  getNotificationTypeClass
} from "../services/notificationService";
import "../styles/navbar.css";

export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    fetchUnreadCount();
    
    // Actualizar contador cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error al obtener contador de notificaciones:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Marcar como leída si no lo está
      if (!notification.read) {
        console.log("🔄 Marcando notificación como leída:", notification.id);
        await markNotificationAsRead(notification.id);
        
        // ✅ Actualizar contador inmediatamente
        await fetchUnreadCount();
        
        // ✅ Recargar notificaciones para reflejar el cambio
        await fetchNotifications();
      }

      // Cerrar dropdown
      setShowDropdown(false);

      // Navegar si hay studentModalityId
      if (notification.studentModalityId) {
        navigate(`/student/status`);
      }
    } catch (err) {
      console.error("❌ Error al marcar notificación como leída:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error al procesar notificación";
      setNotificationError(errorMsg);
      setTimeout(() => setNotificationError(""), 5000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar-wrapper">
      <div className="navbar">
        <div className="navbar-brand">SIGMA</div>

        <ul className="navbar-links">
          <li><Link to="/student">Perfil</Link></li>
          <li><Link to="/student/modalities">Modalidades</Link></li>
          <li><Link to="/student/documents">Documentos</Link></li>
          <li><Link to="/student/status">Estado</Link></li>
          <li><Link to="/student/cancellation">Cancelar Modalidad</Link></li>
        </ul>

        <div className="navbar-actions">
          {/* Campanita de Notificaciones */}
          <div className="notification-container" ref={dropdownRef}>
            <button 
              className="notification-bell" 
              onClick={handleBellClick}
              aria-label="Notificaciones"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <h3>Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount} sin leer</span>
                  )}
                </div>

                {notificationError && (
                  <div style={{
                    padding: "0.75rem",
                    background: "#fee2e2",
                    color: "#991b1b",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid #fecaca"
                  }}>
                    ⚠️ {notificationError}
                  </div>
                )}

                <div className="notification-dropdown-body">
                  {loadingNotifications ? (
                    <div className="notification-loading">
                      <div className="spinner-small"></div>
                      <span>Cargando...</span>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="notification-empty">
                      <div className="notification-empty-icon">📭</div>
                      <p>No tienes notificaciones</p>
                    </div>
                  ) : (
                    <div className="notification-list">
                      {notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-item ${!notification.read ? "unread" : ""}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="notification-content">
                            <div className="notification-subject">
                              {notification.subject}
                            </div>
                            <div className="notification-message">
                              {notification.message}
                            </div>
                            <div className="notification-time">
                              {getRelativeTime(notification.createdAt)}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="notification-unread-dot"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="notification-dropdown-footer">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/student/notifications");
                      }}
                      className="view-all-btn"
                    >
                      Ver todas las notificaciones
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón Cerrar Sesión */}
          <button className="navbar-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}