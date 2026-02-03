import axios from "../api/axios";

// ========================================
// 📋 OBTENER ESTUDIANTES PENDIENTES
// ========================================
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
  
  console.log("📡 Consejo llamando a:", url); // DEBUG
  
  const response = await axios.get(url);
  return response.data;
};

// ========================================
// 👤 OBTENER PERFIL DEL ESTUDIANTE
// ========================================
export const getStudentModalityProfile = async (studentModalityId) => {
  const response = await axios.get(
    `/modalities/students/${studentModalityId}`
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

export const reviewDocumentCouncil = async (studentDocumentId, data) => {
  const response = await axios.post(
    `/modalities/documents/${studentDocumentId}/review-council`,
    data
  );
  return response.data;
};

// ========================================
// ✅ APROBAR MODALIDAD (CONSEJO)
// ========================================
export const approveCouncil = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/approve-council`
  );
  return response.data;
};

// ========================================
// 👨‍🏫 ASIGNAR DIRECTOR DE PROYECTO
// ========================================
export const assignProjectDirector = async (studentModalityId, directorId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/assign-director/${directorId}`
  );
  return response.data;
};

// ========================================
// 📅 PROGRAMAR SUSTENTACIÓN
// ========================================
export const scheduleDefense = async (studentModalityId, data) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/schedule-defense`,
    data
  );
  return response.data;
};

// ========================================
// 📊 EVALUACIÓN FINAL DEL JURADO
// ========================================
export const registerFinalEvaluation = async (studentModalityId, data) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/final-evaluation`,
    data
  );
  return response.data;
};

// ========================================
// 🔍 OBTENER DETALLES DE LA MODALIDAD
// ========================================
export const getModalityDetails = async (modalityId) => {
  const response = await axios.get(`/modalities/${modalityId}`);
  return response.data;
};

// ========================================
// 📋 OBTENER LISTA DE DIRECTORES
// ========================================
export const getProjectDirectors = async () => {
  const response = await axios.get("/modalities/project-directors");
  return response.data;
};

// ========================================
// 🚫 SOLICITUDES DE CANCELACIÓN
// ========================================

// Obtener todas las solicitudes de cancelación
export const getCancellationRequests = async () => {
  const response = await axios.get("/modalities/cancellation-request");
  return response.data;
};

// Aprobar cancelación
export const approveCancellation = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/cancellation/approve`
  );
  return response.data;
};

// Rechazar cancelación
export const rejectCancellation = async (studentModalityId, reason) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/cancellation/reject`,
    { reason }  // ✅ Envía objeto { "reason": "motivo..." }
  );
  return response.data;
};

export const viewCancellationDocument = async (studentModalityId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `/modalities/cancellation/${studentModalityId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  return response.data;
};