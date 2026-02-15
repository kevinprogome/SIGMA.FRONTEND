//directorService.js
import axios from "../api/axios";

// Función helper para extraer datos de respuestas del backend
const extractData = (response, fallback = []) => {
  const data = response;
  
  if (Array.isArray(data)) {
    return data;
  }
  
  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.students)) return data.students;
    
    const keys = Object.keys(data);
    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
      return data[keys[0]];
    }
  }
  
  console.warn("No se pudo extraer array de la respuesta:", data);
  return fallback;
};

// ==================== LISTAR ESTUDIANTES ====================
/**
 * Obtener lista de estudiantes asignados al director
 * @param {Object} filters - Filtros opcionales
 * @param {Array<string>} filters.statuses - Array de estados para filtrar
 * @param {string} filters.name - Nombre del estudiante para buscar
 * @returns {Promise<Array>} Lista de estudiantes
 */
export const getDirectorStudents = async (filters = {}) => {
  let url = "/modalities/students/director";
  const params = new URLSearchParams();
  
  if (filters.statuses && filters.statuses.length > 0) {
    params.append('statuses', filters.statuses.join(','));
  }
  if (filters.name && filters.name.trim()) {
    params.append('name', filters.name.trim());
  }
  
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  console.log("📡 Director llamando a:", url);
  
  const response = await axios.get(url);
  return extractData(response.data);
};

// ==================== DETALLE DE ESTUDIANTE ====================
/**
 * Obtener detalle completo de una modalidad de un estudiante
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @returns {Promise<Object>} Detalle del estudiante y su modalidad
 */
export const getDirectorStudentDetail = async (studentModalityId) => {
  console.log("🔍 Obteniendo detalle del estudiante:", studentModalityId);
  
  const response = await axios.get(
    `/modalities/students/${studentModalityId}/director`
  );
  
  return response.data;
};

// ==================== PROPONER SUSTENTACIÓN ====================
/**
 * Proponer fecha y lugar de sustentación (como director)
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @param {Object} defenseData - Datos de la sustentación
 * @param {string} defenseData.defenseDate - Fecha en formato ISO (YYYY-MM-DDTHH:mm:ss)
 * @param {string} defenseData.defenseLocation - Lugar de la sustentación
 * @returns {Promise<Object>} Respuesta con detalles de la propuesta
 */
export const proposeDefenseByDirector = async (studentModalityId, defenseData) => {
  console.log("📅 Proponiendo sustentación:", { studentModalityId, defenseData });
  
  const response = await axios.post(
    `/modalities/${studentModalityId}/propose-defense-director`,
    defenseData
  );
  
  return response.data;
};

// ==================== VER DOCUMENTO (BLOB/PDF) ====================
/**
 * Obtener documento como blob para visualización
 * @param {number} studentDocumentId - ID del documento del estudiante
 * @returns {Promise<string>} URL del blob
 */
export const getDocumentBlobUrl = async (studentDocumentId) => {
  console.log("🔍 Descargando documento ID:", studentDocumentId);

  try {
    const response = await axios.get(
      `/modalities/student/${studentDocumentId}/view`,
      {
        responseType: "blob",
      }
    );

    console.log("✅ PDF recibido, tamaño:", response.data.size);

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);

    return url;
  } catch (error) {
    console.error("❌ Error al descargar:", error);
    throw error;
  }
};

// ==================== GESTIÓN DE CANCELACIONES ====================

/**
 * Obtener solicitudes de cancelación pendientes para el director
 * @returns {Promise<Array>} Lista de solicitudes
 */
export const getDirectorCancellationRequests = async () => {
  console.log("📋 Obteniendo solicitudes de cancelación para director");
  
  const response = await axios.get("/modalities/cancellation-request/director");
  return extractData(response.data);
};

/**
 * Ver documento de justificación de cancelación
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @returns {Promise<Blob>} Documento en formato blob
 */
export const viewCancellationDocument = async (studentModalityId) => {
  try {
    console.log("🔍 [1/2] Obteniendo detalle para studentModalityId:", studentModalityId);
    
    const profileResponse = await axios.get(
      `/modalities/students/${studentModalityId}/director`
    );
    
    console.log("📦 [1/2] Perfil recibido:", profileResponse.data);
    
    // Buscar el documento de cancelación
    const cancellationDoc = profileResponse.data.documents?.find(
      doc => doc.documentName === "Justificación de cancelación de modalidad de grado"
    );
    
    if (!cancellationDoc) {
      throw new Error("No se encontró el documento de justificación de cancelación");
    }
    
    if (!cancellationDoc.uploaded) {
      throw new Error("El estudiante aún no ha subido el documento de cancelación");
    }
    
    const studentDocumentId = cancellationDoc.studentDocumentId;
    console.log("✅ [1/2] Documento encontrado, ID:", studentDocumentId);
    
    // Descargar el documento
    console.log("🔍 [2/2] Descargando documento ID:", studentDocumentId);
    
    const response = await axios.get(
      `/modalities/student/${studentDocumentId}/view`,
      {
        responseType: "blob",
      }
    );

    console.log("✅ [2/2] PDF recibido, tamaño:", response.data.size);
    return response.data;
    
  } catch (error) {
    console.error("❌ Error al ver documento de cancelación:", error);
    throw error;
  }
};

/**
 * Aprobar solicitud de cancelación de modalidad (como director)
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @returns {Promise<Object>} Respuesta de confirmación
 */
export const approveModalityCancellationByDirector = async (studentModalityId) => {
  console.log("✅ Aprobando cancelación:", studentModalityId);
  
  const response = await axios.post(
    `/modalities/${studentModalityId}/cancellation/director/approve`
  );
  
  return response.data;
};

/**
 * Rechazar solicitud de cancelación de modalidad (como director)
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @param {string} reason - Motivo del rechazo
 * @returns {Promise<Object>} Respuesta de confirmación
 */
export const rejectModalityCancellationByDirector = async (studentModalityId, reason) => {
  if (!reason || reason.trim() === "") {
    throw new Error("El motivo del rechazo es obligatorio");
  }
  
  console.log("❌ Rechazando cancelación:", { studentModalityId, reason });
  
  const response = await axios.post(
    `/modalities/${studentModalityId}/cancellation/director/reject`,
    { reason }
  );
  
  return response.data;
};

// ==================== UTILIDADES ====================

/**
 * Obtener mensaje de error legible
 * @param {Error} error - Error capturado
 * @returns {string} Mensaje de error formateado
 */
export const getErrorMessage = (error) => {
  if (error.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
    return JSON.stringify(error.response.data);
  }
  if (error.message) {
    return error.message;
  }
  return 'Error desconocido';
};

/**
 * Estados disponibles para filtrado
 * Basados en el enum ModalityProcessStatus del backend
 */
export const DIRECTOR_STATUS_OPTIONS = [
  { value: "MODALITY_SELECTED", label: "Modalidad Seleccionada" },
  { value: "UNDER_REVIEW_PROGRAM_HEAD", label: "En Revisión por Jefe de Programa" },
  { value: "CORRECTIONS_REQUESTED_PROGRAM_HEAD", label: "Correcciones Solicitadas por Jefe" },
  { value: "CORRECTIONS_SUBMITTED", label: "Correcciones Enviadas" },
  { value: "CORRECTIONS_APPROVED", label: "Correcciones Aprobadas" },
  { value: "CORRECTIONS_REJECTED_FINAL", label: "Correcciones Rechazadas (Final)" },
  { value: "READY_FOR_PROGRAM_CURRICULUM_COMMITTEE", label: "Pendiente Comité de Currículo" },
  { value: "UNDER_REVIEW_PROGRAM_CURRICULUM_COMMITTEE", label: "En Revisión por Comité de Currículo" },
  { value: "CORRECTIONS_REQUESTED_PROGRAM_CURRICULUM_COMMITTEE", label: "Correcciones Solicitadas por Comité" },
  { value: "PROPOSAL_APPROVED", label: "Propuesta Aprobada" },
  { value: "DEFENSE_REQUESTED_BY_PROJECT_DIRECTOR", label: "Sustentación Propuesta por Director" },
  { value: "DEFENSE_SCHEDULED", label: "Sustentación Programada" },
  { value: "EXAMINERS_ASSIGNED", label: "Jueces Asignados" },
  { value: "CORRECTIONS_REQUESTED_EXAMINERS", label: "Correcciones Solicitadas por Jueces" },
  { value: "READY_FOR_DEFENSE", label: "Listo para Sustentación" },
  { value: "DEFENSE_COMPLETED", label: "Sustentación Completada" },
  { value: "UNDER_EVALUATION_PRIMARY_EXAMINERS", label: "En Evaluación por Jueces Principales" },
  { value: "DISAGREEMENT_REQUIRES_TIEBREAKER", label: "Desacuerdo - Requiere Tercer Juez" },
  { value: "UNDER_EVALUATION_TIEBREAKER", label: "En Evaluación por Tercer Juez" },
  { value: "EVALUATION_COMPLETED", label: "Evaluación Completada" },
  { value: "GRADED_APPROVED", label: "Aprobado" },
  { value: "GRADED_FAILED", label: "Reprobado" },
  { value: "MODALITY_CLOSED", label: "Modalidad Cerrada" },
  { value: "MODALITY_CANCELLED", label: "Modalidad Cancelada" },
  { value: "CANCELLATION_REQUESTED", label: "Cancelación Solicitada" },
  { value: "CANCELLATION_APPROVED_BY_PROJECT_DIRECTOR", label: "Cancelación Aprobada por Director" },
  { value: "CANCELLATION_REJECTED_BY_PROJECT_DIRECTOR", label: "Cancelación Rechazada por Director" },
  { value: "CANCELLED_WITHOUT_REPROVAL", label: "Cancelada sin Calificación" },
  { value: "CANCELLATION_REJECTED", label: "Cancelación Rechazada" },
  { value: "CANCELLED_BY_CORRECTION_TIMEOUT", label: "Cancelada por Timeout de Correcciones" },
];

/**
 * Obtener clase CSS para badge de estado
 * @param {string} status - Estado de la modalidad
 * @returns {string} Clase CSS
 */
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    MODALITY_SELECTED: "info",
    UNDER_REVIEW_PROGRAM_HEAD: "warning",
    CORRECTIONS_REQUESTED_PROGRAM_HEAD: "error",
    CORRECTIONS_SUBMITTED: "info",
    CORRECTIONS_APPROVED: "success",
    CORRECTIONS_REJECTED_FINAL: "error",
    READY_FOR_PROGRAM_CURRICULUM_COMMITTEE: "warning",
    UNDER_REVIEW_PROGRAM_CURRICULUM_COMMITTEE: "warning",
    CORRECTIONS_REQUESTED_PROGRAM_CURRICULUM_COMMITTEE: "error",
    PROPOSAL_APPROVED: "success",
    DEFENSE_REQUESTED_BY_PROJECT_DIRECTOR: "info",
    DEFENSE_SCHEDULED: "success",
    EXAMINERS_ASSIGNED: "info",
    CORRECTIONS_REQUESTED_EXAMINERS: "error",
    READY_FOR_DEFENSE: "success",
    DEFENSE_COMPLETED: "success",
    UNDER_EVALUATION_PRIMARY_EXAMINERS: "warning",
    DISAGREEMENT_REQUIRES_TIEBREAKER: "warning",
    UNDER_EVALUATION_TIEBREAKER: "warning",
    EVALUATION_COMPLETED: "success",
    GRADED_APPROVED: "success",
    GRADED_FAILED: "error",
    MODALITY_CLOSED: "info",
    MODALITY_CANCELLED: "error",
    CANCELLATION_REQUESTED: "error",
    CANCELLATION_APPROVED_BY_PROJECT_DIRECTOR: "warning",
    CANCELLATION_REJECTED_BY_PROJECT_DIRECTOR: "error",
    CANCELLED_WITHOUT_REPROVAL: "error",
    CANCELLATION_REJECTED: "error",
    CANCELLED_BY_CORRECTION_TIMEOUT: "error",
  };
  return statusMap[status] || "inactive";
};

/**
 * Obtener etiqueta legible del estado
 * @param {string} status - Estado de la modalidad
 * @returns {string} Etiqueta legible
 */
export const getStatusLabel = (status) => {
  const option = DIRECTOR_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

/**
 * Formatear fecha a formato legible en español
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Fecha formateada
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  try {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

/**
 * Verificar si se puede proponer sustentación
 * @param {string} status - Estado actual de la modalidad
 * @returns {boolean} True si se puede proponer
 */
export const canProposeDefense = (status) => {
  return status === "PROPOSAL_APPROVED";
};

/**
 * Verificar si hay solicitud de cancelación pendiente
 * @param {string} status - Estado actual de la modalidad
 * @returns {boolean} True si hay solicitud pendiente
 */
export const hasCancellationRequest = (status) => {
  return status === "CANCELLATION_REQUESTED";
};

/**
 * Verificar si la modalidad está completada
 * @param {string} status - Estado actual de la modalidad
 * @returns {boolean} True si está completada
 */
export const isCompleted = (status) => {
  return status === "GRADED_APPROVED" || 
         status === "GRADED_FAILED" || 
         status === "MODALITY_CANCELLED";
};