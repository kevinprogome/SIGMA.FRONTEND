import axios from "../api/axios";

// ========================================
// 📋 OBTENER MIS ASIGNACIONES COMO JUEZ
// ========================================
/**
 * Obtener lista de modalidades asignadas al juez autenticado
 * @returns {Promise<Array>} Lista de modalidades
 */
export const getMyExaminerAssignments = async () => {
  console.log("📋 Obteniendo mis asignaciones como juez");
  const response = await axios.get("/modalities/examiner/my-assignments");
  return response.data;
};

// ========================================
// 👤 OBTENER PERFIL DEL ESTUDIANTE (JUEZ)
// ========================================
/**
 * Obtener detalle completo de una modalidad asignada al juez
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @returns {Promise<Object>} Detalle del estudiante y su modalidad
 */
export const getExaminerStudentProfile = async (studentModalityId) => {
  console.log("🔍 Obteniendo perfil del estudiante:", studentModalityId);
  const response = await axios.get(
    `/modalities/students/${studentModalityId}/examiner`
  );
  return response.data;
};

// ========================================
// 📄 VER DOCUMENTO (BLOB/PDF)
// ========================================
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

// ========================================
// 📝 REVISAR DOCUMENTO (JUEZ)
// ========================================
/**
 * Revisar documento como juez (aceptar, rechazar o solicitar correcciones)
 * @param {number} studentDocumentId - ID del documento del estudiante
 * @param {Object} data - Datos de la revisión
 * @param {string} data.status - Estado del documento (ACCEPTED_FOR_EXAMINER_REVIEW, REJECTED_FOR_EXAMINER_REVIEW, CORRECTIONS_REQUESTED_BY_EXAMINER)
 * @param {string} data.notes - Notas del juez
 * @returns {Promise<Object>} Respuesta de confirmación
 */
export const reviewDocumentExaminer = async (studentDocumentId, data) => {
  console.log("📝 Revisando documento:", { studentDocumentId, data });
  const response = await axios.put(
    `/modalities/documents/${studentDocumentId}/review-examiner`,
    data
  );
  return response.data;
};

// ========================================
// 📊 REGISTRAR EVALUACIÓN FINAL
// ========================================
/**
 * Registrar evaluación final de la sustentación
 * @param {number} studentModalityId - ID de la modalidad del estudiante
 * @param {Object} evaluationData - Datos de la evaluación
 * @param {number} evaluationData.grade - Calificación (0.0 - 5.0)
 * @param {string} evaluationData.decision - Decisión (APPROVED_NO_DISTINCTION, APPROVED_MERITORIOUS, APPROVED_LAUREATE, REJECTED)
 * @param {string} evaluationData.observations - Observaciones del juez
 * @returns {Promise<Object>} Respuesta con resultado (consenso, desacuerdo, etc.)
 */
export const registerEvaluation = async (studentModalityId, evaluationData) => {
  console.log("📊 Registrando evaluación:", { studentModalityId, evaluationData });
  const response = await axios.post(
    `/modalities/${studentModalityId}/final-evaluation/register`,
    evaluationData
  );
  return response.data;
};

// ========================================
// 🔍 UTILIDADES
// ========================================

/**
 * Estados de documentos para jueces
 */
export const EXAMINER_DOCUMENT_STATUS = {
  ACCEPTED: "ACCEPTED_FOR_EXAMINER_REVIEW",
  REJECTED: "REJECTED_FOR_EXAMINER_REVIEW",
  CORRECTIONS: "CORRECTIONS_REQUESTED_BY_EXAMINER",
};

/**
 * Decisiones de evaluación
 */
export const EXAMINER_DECISIONS = {
  REJECTED: "REJECTED",
  APPROVED_NO_DISTINCTION: "APPROVED_NO_DISTINCTION",
  APPROVED_MERITORIOUS: "APPROVED_MERITORIOUS",
  APPROVED_LAUREATE: "APPROVED_LAUREATE",
};

/**
 * Obtener clase CSS para badge de estado
 */
export const getStatusBadgeClass = (status) => {
  if (status?.includes("ACCEPTED")) return "success";
  if (status?.includes("REJECTED")) return "error";
  if (status?.includes("CORRECTIONS")) return "warning";
  return "inactive";
};

/**
 * Obtener etiqueta legible del estado
 */
export const getStatusLabel = (status) => {
  const statusMap = {
    EXAMINERS_ASSIGNED: "Jueces Asignados",
    READY_FOR_DEFENSE: "Listo para Sustentación",
    DEFENSE_COMPLETED: "Sustentación Completada",
    UNDER_EVALUATION_PRIMARY_EXAMINERS: "En Evaluación - Jueces Principales",
    UNDER_EVALUATION_TIEBREAKER: "En Evaluación - Juez de Desempate",
    DISAGREEMENT_REQUIRES_TIEBREAKER: "Desacuerdo - Requiere Desempate",
    GRADED_APPROVED: "Aprobado",
    GRADED_FAILED: "Reprobado",
    CORRECTIONS_REQUESTED_EXAMINERS: "Correcciones Solicitadas por Jueces",
  };
  return statusMap[status] || status;
};

/**
 * Formatear fecha a formato legible en español
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
 * Obtener mensaje de error legible
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
 * Validar consistencia entre calificación y decisión
 */
export const isGradeConsistentWithDecision = (grade, decision) => {
  const gradeNum = parseFloat(grade);
  
  switch (decision) {
    case EXAMINER_DECISIONS.REJECTED:
      return gradeNum < 3.0;
    case EXAMINER_DECISIONS.APPROVED_NO_DISTINCTION:
      return gradeNum >= 3.0 && gradeNum < 4.0;
    case EXAMINER_DECISIONS.APPROVED_MERITORIOUS:
      return gradeNum >= 4.0 && gradeNum < 4.5;
    case EXAMINER_DECISIONS.APPROVED_LAUREATE:
      return gradeNum >= 4.5 && gradeNum <= 5.0;
    default:
      return false;
  }
};

/**
 * Obtener sugerencia de decisión según calificación
 */
export const getSuggestedDecision = (grade) => {
  const gradeNum = parseFloat(grade);
  
  if (gradeNum < 3.0) return EXAMINER_DECISIONS.REJECTED;
  if (gradeNum < 4.0) return EXAMINER_DECISIONS.APPROVED_NO_DISTINCTION;
  if (gradeNum < 4.5) return EXAMINER_DECISIONS.APPROVED_MERITORIOUS;
  return EXAMINER_DECISIONS.APPROVED_LAUREATE;
};