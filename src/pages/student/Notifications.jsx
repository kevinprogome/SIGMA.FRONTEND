import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getNotificationIcon,
  getRelativeTime,
} from "../../services/notificationService";
import {
  acceptInvitation,
  rejectInvitation,
  getMyPendingInvitation,
} from "../../services/ModalitiesGroupService";
import "../../styles/student/notifications.css";

export default function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [processingInvitation, setProcessingInvitation] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getMyNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Error al cargar notificaciones:", err);
      setMessage("Error al cargar las notificaciones");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log("🔄 Intentando marcar notificación como leída:", notificationId);
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
      
      setMessage("✅ Marcada como leída");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("❌ Error al marcar como leída:", err);
      const errorMsg = err.response?.data?.message || err.message || "Error al marcar como leída";
      setMessage(`❌ ${errorMsg}`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications
      .filter(n => !n.read)
      .map(n => n.id);

    if (unreadIds.length === 0) {
      setMessage("⚠️ No hay notificaciones sin leer");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    try {
      await markAllAsRead(unreadIds);
      await fetchNotifications();
      
      setMessage(`✅ ${unreadIds.length} marcadas como leídas`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  // ✅ Aceptar invitación
  const handleAcceptInvitation = async (notification) => {
    const invitationId = await getInvitationId(notification);
    
    if (!invitationId) {
      console.error("❌ No se encontró invitationId en la notificación:", notification);
      setMessage("❌ No se pudo obtener el ID de la invitación. Por favor, recarga la página e intenta de nuevo.");
      setTimeout(() => setMessage(""), 5000);
      return;
    }

    if (!window.confirm("¿Deseas aceptar esta invitación? Te unirás al grupo.")) {
      return;
    }

    try {
      setProcessingInvitation(invitationId);
      
      await acceptInvitation(invitationId);
      
      setMessage("✅ Invitación aceptada. ¡Bienvenido al grupo!");
      
      // Marcar notificación como leída
      await markNotificationAsRead(notification.id);
      
      // Recargar notificaciones
      await fetchNotifications();
      
      setTimeout(() => {
        setMessage("");
        navigate("/student/status");
      }, 2000);
    } catch (err) {
      console.error("Error al aceptar invitación:", err);
      setMessage(err.response?.data?.message || "❌ Error al aceptar invitación");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  // ✅ Rechazar invitación
  const handleRejectInvitation = async (notification) => {
    const invitationId = await getInvitationId(notification);
    
    if (!invitationId) {
      console.error("❌ No se encontró invitationId en la notificación:", notification);
      setMessage("❌ No se pudo obtener el ID de la invitación");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (!window.confirm("¿Estás seguro de rechazar esta invitación?")) {
      return;
    }

    try {
      setProcessingInvitation(invitationId);
      
      await rejectInvitation(invitationId);
      
      setMessage("Invitación rechazada");
      
      // Marcar notificación como leída
      await markNotificationAsRead(notification.id);
      
      // Recargar notificaciones
      await fetchNotifications();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al rechazar invitación:", err);
      setMessage(err.response?.data?.message || "❌ Error al rechazar invitación");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setProcessingInvitation(null);
    }
  };

  // Helper para verificar si es notificación de invitación
  const isInvitationNotification = (notification) => {
    // Múltiples formas de detectar invitaciones
    const isInvitationType = 
      notification.type === "MODALITY_INVITATION" || 
      notification.type === "MODALITY_INVITATION_SENT" ||
      notification.type?.includes("INVITATION");
    
    const isInvitationSubject = 
      notification.subject?.toLowerCase().includes("invitación") &&
      notification.subject?.toLowerCase().includes("grupal");
    
    const isInvitationMessage =
      notification.message?.toLowerCase().includes("invitación") &&
      notification.message?.toLowerCase().includes("unirte");
    
    return isInvitationType || isInvitationSubject || isInvitationMessage;
  };

  // Helper para extraer invitationId
  const getInvitationId = async (notification) => {
    // 1. Intentar obtenerlo directamente de la notificación
    if (notification.invitationId) {
      return notification.invitationId;
    }
    
    // 2. Intentar desde metadata
    if (notification.metadata?.invitationId) {
      return notification.metadata.invitationId;
    }
    
    // 3. ✅ NUEVO: Si tiene studentModalityId, buscar la invitación en el backend
    if (notification.studentModalityId) {
      try {
        console.log("🔍 Buscando invitación en backend para studentModalityId:", notification.studentModalityId);
        const invitationData = await getMyPendingInvitation(notification.studentModalityId);
        
        if (invitationData && invitationData.invitationId) {
          console.log("✅ Invitación encontrada:", invitationData.invitationId);
          return invitationData.invitationId;
        }
      } catch (err) {
        console.error("❌ Error al buscar invitación:", err);
      }
    }
    
    return null;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title-section">
          <h1>Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="unread-badge-header">{unreadCount} sin leer</span>
          )}
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn-mark-all">
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      {message && (
        <div className="notifications-alert">
          {message}
        </div>
      )}

      <div className="notifications-tabs">
        <button
          className={`tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Todas ({notifications.length})
        </button>
        <button
          className={`tab ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Sin leer ({unreadCount})
        </button>
      </div>

      <div className="notifications-list-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>
              {filter === "unread"
                ? "No tienes notificaciones sin leer"
                : "No tienes notificaciones"}
            </h3>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? "unread" : ""}`}
              >
                <div className="notification-main">
                  <div className="notification-icon-container">
                    <span className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  <div className="notification-body">
                    <div className="notification-top">
                      <h3 className="notification-title">
                        {notification.subject}
                      </h3>
                      {!notification.read && (
                        <span className="badge-nuevo">Nuevo</span>
                      )}
                    </div>

                    <p className="notification-text">
                      {notification.message}
                    </p>

                    {/* ✅ BOTONES DE INVITACIÓN */}
                    {isInvitationNotification(notification) && !notification.read && (
                      <div className="invitation-actions">
                        <button
                          className="btn-accept-invitation"
                          onClick={() => handleAcceptInvitation(notification)}
                          disabled={processingInvitation !== null}
                        >
                          {processingInvitation === getInvitationId(notification) ? "..." : "✓ Aceptar"}
                        </button>
                        <button
                          className="btn-reject-invitation"
                          onClick={() => handleRejectInvitation(notification)}
                          disabled={processingInvitation !== null}
                        >
                          {processingInvitation === getInvitationId(notification) ? "..." : "✕ Rechazar"}
                        </button>
                      </div>
                    )}

                    <div className="notification-bottom">
                      <span className="notification-time">
                        {getRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {!notification.read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Marcar como leída"
                  >
                    ✓
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}