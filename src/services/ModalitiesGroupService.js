import api from "../api/axios";

// ==========================================
// 👥 MODALIDADES GRUPALES
// ==========================================

/**
 * Iniciar una modalidad grupal
 * POST /modality-groups/{modalityId}/start-group
 */
export const startGroupModality = async (modalityId) => {
  console.log("🎓 Iniciando modalidad grupal:", modalityId);
  
  const response = await api.post(
    `/modality-groups/${modalityId}/start-group`
  );
  
  return response.data;
};

/**
 * Obtener estudiantes elegibles para invitar
 * GET /modality-groups/eligible-students?nameFilter=juan
 */
export const getEligibleStudents = async (nameFilter = "") => {
  console.log("🔍 Obteniendo estudiantes elegibles, filtro:", nameFilter);
  
  const params = nameFilter ? `?nameFilter=${encodeURIComponent(nameFilter)}` : "";
  const response = await api.get(`/modality-groups/eligible-students${params}`);
  
  return response.data;
};

/**
 * Invitar un estudiante a la modalidad grupal
 * POST /modality-groups/invite
 */
export const inviteStudent = async (studentModalityId, inviteeId) => {
  console.log("📤 Invitando estudiante:", { studentModalityId, inviteeId });
  
  const response = await api.post("/modality-groups/invite", {
    studentModalityId,
    inviteeId
  });
  
  return response.data;
};

/**
 * ✅ NUEVO: Obtener invitación pendiente por studentModalityId
 * Este endpoint permite al frontend obtener el invitationId
 * cuando el backend no lo incluye en la notificación
 */
export const getMyPendingInvitation = async (studentModalityId) => {
  console.log("🔍 Buscando invitación pendiente para modalidad:", studentModalityId);
  
  try {
    const response = await api.get(`/modality-groups/my-pending-invitation/${studentModalityId}`);
    return response.data;
  } catch (err) {
    console.error("❌ Error al buscar invitación:", err);
    return null;
  }
};

/**
 * Aceptar invitación a modalidad grupal
 * POST /modality-groups/invitations/{invitationId}/accept
 */
export const acceptInvitation = async (invitationId) => {
  console.log("✅ Aceptando invitación:", invitationId);
  
  const response = await api.post(
    `/modality-groups/invitations/${invitationId}/accept`
  );
  
  return response.data;
};

/**
 * Rechazar invitación a modalidad grupal
 * POST /modality-groups/invitations/{invitationId}/reject
 */
export const rejectInvitation = async (invitationId) => {
  console.log("❌ Rechazando invitación:", invitationId);
  
  const response = await api.post(
    `/modality-groups/invitations/${invitationId}/reject`
  );
  
  return response.data;
};