import axios from "../api/axios";

// ✅ NUEVA FUNCIÓN con filtros
export const getStudentsPendingModalities = async (statuses = [], searchName = "") => {
  let url = "/modalities/students";
  const params = new URLSearchParams();
  
  // Agregar filtro de estados
  if (statuses && statuses.length > 0) {
    params.append("statuses", statuses.join(","));
  }
  
  // Agregar filtro de nombre
  if (searchName && searchName.trim()) {
    params.append("name", searchName.trim());
  }
  
  // Solo agregar ? si hay parámetros
  const queryString = params.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  console.log("📡 Llamando a:", url); // DEBUG
  
  const response = await axios.get(url);
  return response.data;
};

export const getStudentModalityProfile = async (studentModalityId) => {
  const response = await axios.get(
    `/modalities/students/${studentModalityId}`
  );
  return response.data;
};

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

export const reviewDocument = async (studentDocumentId, data) => {
  const response = await axios.put(
    `/modalities/documents/${studentDocumentId}/review`,
    data
  );
  return response.data;
};

export const approveProgramhead = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/approve-program-head`
  );
  return response.data;
};

// ========================================
// Traducciones de Estados de Modalidades
// ========================================

export const MODALITY_STATUS_OPTIONS = [
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
 * Obtener etiqueta legible del estado
 * @param {string} status - Estado de la modalidad
 * @returns {string} Etiqueta legible
 */
export const getStatusLabel = (status) => {
  const option = MODALITY_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

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