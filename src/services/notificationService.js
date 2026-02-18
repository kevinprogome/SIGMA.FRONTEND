import api from "../api/axios";

// ==========================================
// 🔔 SISTEMA DE NOTIFICACIONES
// ==========================================

/**
 * Obtener todas las notificaciones del usuario actual
 * GET /notifications
 * @returns {Promise<Array>} Lista de notificaciones
 * @example
 * [
 *   {
 *     id: 1,
 *     type: "DOCUMENT_APPROVED",
 *     subject: "Documento aprobado",
 *     message: "Tu propuesta ha sido aprobada",
 *     createdAt: "2026-02-14T10:30:00",
 *     read: false,
 *     studentModalityId: 32
 *   }
 * ]
 */
export const getMyNotifications = async () => {
  console.log("🔔 Obteniendo notificaciones del usuario");
  const response = await api.get("/notifications");
  return response.data;
};

/**
 * Obtener contador de notificaciones no leídas
 * GET /notifications/unread-count
 * @returns {Promise<Object>} Objeto con el contador
 * @example
 * {
 *   unreadCount: 5
 * }
 */
export const getUnreadCount = async () => {
  console.log("🔢 Obteniendo contador de no leídas");
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

/**
 * Obtener detalle completo de una notificación
 * GET /notifications/{notificationId}
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} Detalle de la notificación
 */
export const getNotificationDetail = async (notificationId) => {
  console.log("📄 Obteniendo detalle de notificación:", notificationId);
  const response = await api.get(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Marcar una notificación como leída
 * PATCH /notifications/{notificationId}/read
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} Confirmación
 */
export const markNotificationAsRead = async (notificationId) => {
  console.log("✅ Marcando notificación como leída:", notificationId);
  
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    console.log("✅ Respuesta del servidor:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error detallado al marcar como leída:", {
      notificationId,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Marcar todas las notificaciones como leídas
 * (Esta función marca cada notificación individualmente)
 * @param {Array} notificationIds - Array de IDs de notificaciones
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (notificationIds) => {
  console.log("✅ Marcando todas como leídas:", notificationIds.length);
  
  const promises = notificationIds.map(id => 
    markNotificationAsRead(id).catch(err => {
      console.error(`Error marcando notificación ${id}:`, err);
      return null;
    })
  );
  
  await Promise.all(promises);
};

/**
 * Obtener icono según el tipo de notificación
 * @param {string} type - Tipo de notificación
 * @returns {string} Emoji del icono
 */
export const getNotificationIcon = (type) => {
  const icons = {
    DOCUMENT_APPROVED: "✅",
    DOCUMENT_REJECTED: "❌",
    DOCUMENT_CORRECTIONS: "🔄",
    MODALITY_APPROVED: "🎉",
    MODALITY_REJECTED: "⚠️",
    DIRECTOR_ASSIGNED: "👨‍🏫",
    DEFENSE_SCHEDULED: "📅",
    CANCELLATION_APPROVED: "🔒",
    CANCELLATION_REJECTED: "↩️",
    EXAMINER_ASSIGNED: "👨‍⚖️",
    GENERAL: "📬",
  };
  
  return icons[type] || "📬";
};

/**
 * Obtener clase CSS según el tipo de notificación
 * @param {string} type - Tipo de notificación
 * @returns {string} Nombre de clase CSS
 */
export const getNotificationTypeClass = (type) => {
  if (type?.includes("APPROVED")) return "success";
  if (type?.includes("REJECTED")) return "error";
  if (type?.includes("CORRECTIONS")) return "warning";
  return "info";
};

/**
 * Formatear fecha relativa (hace 2 horas, hace 1 día, etc.)
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;
  
  return date.toLocaleDateString("es-CO", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Extraer invitationId de una notificación de invitación grupal
 * @param {Object} notification - Notificación
 * @returns {number|null} ID de la invitación
 */
export const getInvitationIdFromNotification = (notification) => {
  // El backend puede enviar el invitationId en el tipo o en metadata
  if (notification.type?.includes("INVITATION")) {
    // Buscar en el mensaje o usar un campo específico del backend
    return notification.invitationId || null;
  }
  return null;
};