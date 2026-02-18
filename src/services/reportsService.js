import api from "../api/axios";

// ==========================================
// 📊 SERVICIO DE REPORTES
// ==========================================

/**
 * Servicio completo para generación y descarga de reportes del sistema SIGMA
 * Endpoints disponibles para el comité de programa
 */

// ==========================================
// 🌍 REPORTES GLOBALES
// ==========================================

/**
 * Obtiene reporte global de modalidades activas
 * GET /reports/global/modalities
 */
export const getGlobalModalitiesReport = async () => {
  console.log("📊 Obteniendo reporte global de modalidades");
  const response = await api.get("/reports/global/modalities");
  return response.data;
};

/**
 * Descarga reporte global en PDF
 * GET /reports/global/modalities/pdf
 */
export const downloadGlobalModalitiesPDF = async () => {
  console.log("📥 Descargando reporte global en PDF");
  const response = await api.get("/reports/global/modalities/pdf", {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Global_Modalidades.pdf");
  return response.data;
};

// ==========================================
// 🎓 REPORTES DE ESTUDIANTES
// ==========================================

/**
 * Obtiene estudiantes por modalidad
 * GET /reports/students/by-modality?modalityType={type}
 */
export const getStudentsByModality = async (modalityType) => {
  console.log("📊 Obteniendo estudiantes por modalidad:", modalityType);
  const response = await api.get("/reports/students/by-modality", {
    params: { modalityType }
  });
  return response.data;
};

/**
 * Obtiene estudiantes por semestre
 * GET /reports/students/by-semester?year={year}&semester={semester}
 */
export const getStudentsBySemester = async (year, semester) => {
  console.log("📊 Obteniendo estudiantes por semestre:", year, semester);
  const response = await api.get("/reports/students/by-semester", {
    params: { year, semester }
  });
  return response.data;
};

/**
 * Obtiene listado completo de estudiantes con filtros
 * POST /reports/students/listing
 */
export const getStudentListingReport = async (filters) => {
  console.log("📊 Obteniendo listado de estudiantes con filtros:", filters);
  const response = await api.post("/reports/students/listing", filters);
  return response.data;
};

/**
 * Descarga listado de estudiantes en PDF
 * POST /reports/students/listing/pdf
 */
export const downloadStudentListingPDF = async (filters) => {
  console.log("📥 Descargando listado de estudiantes en PDF");
  const response = await api.post("/reports/students/listing/pdf", filters, {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Listado_Estudiantes.pdf");
  return response.data;
};

// ==========================================
// 👨‍🏫 REPORTES DE DIRECTORES
// ==========================================

/**
 * Obtiene directores por modalidad
 * GET /reports/directors/by-modality?modalityType={type}
 */
export const getDirectorsByModality = async (modalityType) => {
  console.log("📊 Obteniendo directores por modalidad:", modalityType);
  const response = await api.get("/reports/directors/by-modality", {
    params: { modalityType }
  });
  return response.data;
};

/**
 * Obtiene modalidades asignadas a directores
 * POST /reports/directors/assigned-modalities
 */
export const getDirectorAssignedModalities = async (filters) => {
  console.log("📊 Obteniendo modalidades asignadas a directores:", filters);
  const response = await api.post("/reports/directors/assigned-modalities", filters);
  return response.data;
};

/**
 * Descarga reporte de directores en PDF
 * POST /reports/directors/assigned-modalities/pdf
 */
export const downloadDirectorAssignedModalitiesPDF = async (filters) => {
  console.log("📥 Descargando reporte de directores en PDF");
  const response = await api.post("/reports/directors/assigned-modalities/pdf", filters, {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Directores_Modalidades.pdf");
  return response.data;
};

/**
 * Obtiene reporte de director específico
 * GET /reports/directors/{directorId}/modalities
 */
export const getSpecificDirectorReport = async (directorId) => {
  console.log("📊 Obteniendo reporte de director:", directorId);
  const response = await api.get(`/reports/directors/${directorId}/modalities`);
  return response.data;
};

/**
 * Descarga reporte de director específico en PDF
 * GET /reports/directors/{directorId}/modalities/pdf
 */
export const downloadSpecificDirectorPDF = async (directorId) => {
  console.log("📥 Descargando reporte de director en PDF");
  const response = await api.get(`/reports/directors/${directorId}/modalities/pdf`, {
    responseType: "blob"
  });
  
  downloadFile(response.data, `Reporte_Director_${directorId}.pdf`);
  return response.data;
};

// ==========================================
// 🔍 REPORTES FILTRADOS Y COMPARATIVOS
// ==========================================

/**
 * Obtiene reporte de modalidades con filtros
 * POST /reports/modalities/filtered
 */
export const getFilteredModalitiesReport = async (filters) => {
  console.log("📊 Obteniendo reporte filtrado de modalidades:", filters);
  const response = await api.post("/reports/modalities/filtered", filters);
  return response.data;
};

/**
 * Descarga reporte filtrado en PDF
 * POST /reports/modalities/filtered/pdf
 */
export const downloadFilteredModalitiesPDF = async (filters) => {
  console.log("📥 Descargando reporte filtrado en PDF");
  const response = await api.post("/reports/modalities/filtered/pdf", filters, {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Modalidades_Filtrado.pdf");
  return response.data;
};

/**
 * Obtiene reporte comparativo de modalidades por tipo
 * POST /reports/modalities/comparison
 */
export const getModalityTypeComparison = async (filters) => {
  console.log("📊 Obteniendo comparativa de modalidades:", filters);
  const response = await api.post("/reports/modalities/comparison", filters);
  return response.data;
};

/**
 * Descarga reporte comparativo en PDF
 * POST /reports/modalities/comparison/pdf
 */
export const downloadModalityComparisonPDF = async (filters) => {
  console.log("📥 Descargando reporte comparativo en PDF");
  const response = await api.post("/reports/modalities/comparison/pdf", filters, {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Comparativa_Modalidades.pdf");
  return response.data;
};

// ==========================================
// 📈 REPORTES HISTÓRICOS
// ==========================================

/**
 * Obtiene reporte histórico de una modalidad específica
 * GET /reports/modalities/{modalityTypeId}/historical?periods={periods}
 */
export const getModalityHistoricalReport = async (modalityTypeId, periods = 8) => {
  console.log("📊 Obteniendo reporte histórico de modalidad:", modalityTypeId);
  const response = await api.get(`/reports/modalities/${modalityTypeId}/historical`, {
    params: { periods }
  });
  return response.data;
};

/**
 * Descarga reporte histórico en PDF
 * GET /reports/modalities/{modalityTypeId}/historical/pdf?periods={periods}
 */
export const downloadModalityHistoricalPDF = async (modalityTypeId, periods = 8) => {
  console.log("📥 Descargando reporte histórico en PDF");
  const response = await api.get(`/reports/modalities/${modalityTypeId}/historical/pdf`, {
    params: { periods },
    responseType: "blob"
  });
  
  downloadFile(response.data, `Reporte_Historico_Modalidad_${modalityTypeId}.pdf`);
  return response.data;
};

// ==========================================
// ✅ REPORTES DE MODALIDADES COMPLETADAS
// ==========================================

/**
 * Obtiene reporte de modalidades completadas (exitosas y fallidas)
 * POST /reports/modalities/completed
 */
export const getCompletedModalitiesReport = async (filters) => {
  console.log("📊 Obteniendo reporte de modalidades completadas:", filters);
  const response = await api.post("/reports/modalities/completed", filters);
  return response.data;
};

/**
 * Descarga reporte de modalidades completadas en PDF
 * POST /reports/modalities/completed/pdf
 */
export const downloadCompletedModalitiesPDF = async (filters) => {
  console.log("📥 Descargando reporte de modalidades completadas en PDF");
  const response = await api.post("/reports/modalities/completed/pdf", filters, {
    responseType: "blob"
  });
  
  downloadFile(response.data, "Reporte_Modalidades_Completadas.pdf");
  return response.data;
};

// ==========================================
// 📅 REPORTE DE CALENDARIO DE SUSTENTACIONES
// ==========================================

/**
 * Obtiene calendario de sustentaciones
 * GET /reports/defense-calendar?startDate={date}&endDate={date}&includeCompleted={bool}
 */
export const getDefenseCalendarReport = async (startDate, endDate, includeCompleted = false) => {
  console.log("📊 Obteniendo calendario de sustentaciones");
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  params.includeCompleted = includeCompleted;
  
  const response = await api.get("/reports/defense-calendar", { params });
  return response.data;
};

/**
 * Descarga calendario de sustentaciones en PDF
 * GET /reports/defense-calendar/pdf
 */
export const downloadDefenseCalendarPDF = async (startDate, endDate, includeCompleted = false) => {
  console.log("📥 Descargando calendario de sustentaciones en PDF");
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  params.includeCompleted = includeCompleted;
  
  const response = await api.get("/reports/defense-calendar/pdf", {
    params,
    responseType: "blob"
  });
  
  downloadFile(response.data, "Calendario_Sustentaciones.pdf");
  return response.data;
};

// ==========================================
// ℹ️ INFORMACIÓN Y METADATOS
// ==========================================

/**
 * Obtiene lista de reportes disponibles
 * GET /reports/available
 */
export const getAvailableReports = async () => {
  console.log("📊 Obteniendo reportes disponibles");
  const response = await api.get("/reports/available");
  return response.data;
};

/**
 * Obtiene tipos de modalidad disponibles
 * GET /reports/modalities/types
 */
export const getAvailableModalityTypes = async () => {
  console.log("📊 Obteniendo tipos de modalidad disponibles");
  const response = await api.get("/reports/modalities/types");
  return response.data;
};

/**
 * Health check del servicio de reportes
 * GET /reports/health
 */
export const checkReportsHealth = async () => {
  console.log("🔍 Verificando estado del servicio de reportes");
  const response = await api.get("/reports/health");
  return response.data;
};

// ==========================================
// 🛠️ UTILIDADES
// ==========================================

/**
 * Descarga un archivo blob
 * @param {Blob} blob - Datos del archivo
 * @param {string} filename - Nombre del archivo
 */
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  console.log(`✅ Archivo descargado: ${filename}`);
};

/**
 * Formatea fecha para enviar al backend
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha en formato ISO
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;
  return date.toISOString();
};

/**
 * Obtiene año y semestre actual
 * @returns {Object} {year, semester}
 */
export const getCurrentPeriod = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  return {
    year: now.getFullYear(),
    semester: month <= 6 ? 1 : 2
  };
};

/**
 * Genera periodos académicos (últimos N semestres)
 * @param {number} count - Cantidad de periodos
 * @returns {Array} Lista de periodos
 */
export const generateAcademicPeriods = (count = 6) => {
  const periods = [];
  const { year, semester } = getCurrentPeriod();
  
  let currentYear = year;
  let currentSemester = semester;
  
  for (let i = 0; i < count; i++) {
    periods.push({
      year: currentYear,
      semester: currentSemester,
      label: `${currentYear}-${currentSemester}`
    });
    
    currentSemester--;
    if (currentSemester === 0) {
      currentSemester = 2;
      currentYear--;
    }
  }
  
  return periods;
};

// ==========================================
// 📋 CONSTANTES
// ==========================================

export const REPORT_TYPES = {
  GLOBAL: "GLOBAL_ACTIVE_MODALITIES",
  FILTERED: "FILTERED_MODALITIES",
  STUDENTS_BY_MODALITY: "STUDENTS_BY_MODALITY",
  STUDENTS_BY_SEMESTER: "STUDENTS_BY_SEMESTER",
  STUDENT_LISTING: "STUDENT_LISTING_FILTERED",
  DIRECTORS_BY_MODALITY: "DIRECTORS_BY_MODALITY",
  DIRECTOR_ASSIGNED: "DIRECTOR_ASSIGNED_MODALITIES",
  COMPARISON: "MODALITY_TYPE_COMPARISON",
  HISTORICAL: "MODALITY_HISTORICAL_ANALYSIS",
  COMPLETED: "COMPLETED_MODALITIES_REPORT",
  DEFENSE_CALENDAR: "DEFENSE_CALENDAR"
};

export const MODALITY_STATUSES = [
  "MODALITY_SELECTED",
  "UNDER_REVIEW_PROGRAM_HEAD",
  "READY_FOR_PROGRAM_CURRICULUM_COMMITTEE",
  "UNDER_REVIEW_PROGRAM_CURRICULUM_COMMITTEE",
  "PROPOSAL_APPROVED",
  "CORRECTIONS_SUBMITTED",
  "CORRECTIONS_APPROVED",
  "DEFENSE_SCHEDULED",
  "EXAMINERS_ASSIGNED",
  "DEFENSE_COMPLETED",
  "UNDER_EVALUATION_PRIMARY_EXAMINERS",
  "EVALUATION_COMPLETED",
  "GRADED_APPROVED",
  "GRADED_FAILED"
];

export const RESULT_TYPES = [
  { value: "SUCCESS", label: "Exitosas" },
  { value: "FAILED", label: "Fallidas" }
];

export const DISTINCTION_TYPES = [
  { value: "AGREED_MERITORIOUS", label: "Meritorio (Acuerdo)" },
  { value: "TIEBREAKER_MERITORIOUS", label: "Meritorio (Desempate)" },
  { value: "AGREED_LAUREATE", label: "Laureado (Acuerdo)" },
  { value: "TIEBREAKER_LAUREATE", label: "Laureado (Desempate)" }
];

export const TIMELINE_STATUSES = [
  { value: "ON_TIME", label: "A tiempo" },
  { value: "AT_RISK", label: "En riesgo" },
  { value: "DELAYED", label: "Retrasado" },
  { value: "COMPLETED", label: "Completado" }
];

export const SORT_OPTIONS = [
  { value: "NAME", label: "Nombre" },
  { value: "DATE", label: "Fecha" },
  { value: "STATUS", label: "Estado" },
  { value: "MODALITY", label: "Modalidad" },
  { value: "PROGRESS", label: "Progreso" },
  { value: "GRADE", label: "Calificación" },
  { value: "DURATION", label: "Duración" }
];