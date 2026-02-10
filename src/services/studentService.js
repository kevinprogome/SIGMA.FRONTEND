import api from "../api/axios";

// ========================================
// 🔧 HELPER FUNCTION
// ========================================
const extractData = (response, fallback = []) => {
  const data = response;
  
  // Si ya es un array, retornarlo directamente
  if (Array.isArray(data)) {
    return data;
  }
  
  // Si es un objeto, buscar el array en propiedades comunes
  if (typeof data === 'object' && data !== null) {
    // Intentar propiedades comunes
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.faculties)) return data.faculties;
    if (Array.isArray(data.programs)) return data.programs;
    if (Array.isArray(data.modalities)) return data.modalities;
    
    // Si tiene solo una propiedad y es un array, retornarla
    const keys = Object.keys(data);
    if (keys.length === 1 && Array.isArray(data[keys[0]])) {
      return data[keys[0]];
    }
  }
  
  console.warn("No se pudo extraer array de la respuesta:", data);
  return fallback;
};

// ========================================
// 📊 DASHBOARD
// ========================================
export const getStudentDashboard = async () => {
  const response = await api.get("/student/dashboard");
  return response.data;
};

// ========================================
// 📋 ESTADO DE LA MODALIDAD
// ========================================
export const getStudentStatus = async () => {
  const response = await api.get("/student/status");
  return response.data;
};

export const getCurrentModalityStatus = async () => {
  const res = await api.get("/students/modality/current");
  return res.data;
};

// ========================================
// 🎓 MODALIDADES
// ========================================
export const getModalidades = async () => {
  const response = await api.get("/modalities");
  return extractData(response.data);
};

export const getModalityById = async (id) => {
  const res = await api.get(`/modalities/${id}`);
  return res.data;
};

export const startModality = async (modalityId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post(
    `/modalities/${modalityId}/start`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

// ========================================
// 👤 PERFIL DEL ESTUDIANTE
// ========================================
export const getStudentProfile = async () => {
  const res = await api.get("/students/profile");
  return res.data;
};

export const saveStudentProfile = async (profile) => {
  const res = await api.post("/students/profile", profile);
  return res.data;
};

// ========================================
// 📄 DOCUMENTOS
// ========================================
export const getMyDocuments = async () => {
  const res = await api.get("/students/my-documents");
  return res.data;
};

export const uploadStudentDocument = async (
  studentModalityId,
  documentId,
  file
) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(
    `/modalities/${studentModalityId}/documents/${documentId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

// ✅ VER DOCUMENTO (BLOB/PDF) - ENDPOINT PARA ESTUDIANTES
export const getStudentDocumentBlob = async (studentDocumentId) => {
  console.log("🔍 [ESTUDIANTE] Descargando documento ID:", studentDocumentId);

  try {
    const response = await api.get(
      `/students/documents/${studentDocumentId}/view`,
      {
        responseType: "blob",
      }
    );

    console.log("✅ PDF recibido, tamaño:", response.data.size);

    const blob = response.data;
    const url = window.URL.createObjectURL(blob);

    return url;
  } catch (error) {
    console.error("❌ Error al descargar documento:", error);
    console.error("❌ Status:", error.response?.status);
    console.error("❌ Mensaje:", error.response?.data);
    
    if (error.response?.status === 403) {
      throw new Error("No tienes permiso para ver este documento");
    } else if (error.response?.status === 404) {
      throw new Error("Documento no encontrado");
    } else {
      throw new Error("Error al cargar el documento. Intenta nuevamente.");
    }
  }
};

// ========================================
// 🚫 CANCELACIÓN DE MODALIDAD
// ========================================
export const requestCancellation = async (studentId) => {
  const res = await api.post(`/students/${studentId}/request-cancellation`);
  return res.data;
};

export const requestCancellationModality = async (studentModalityId) => {
  const res = await api.post(
    `/students/${studentModalityId}/request-cancellation`
  );
  return res.data;
};

export const uploadCancellationDocument = async (studentModalityId, formData) => {
  const response = await api.post(
    `/students/cancellation-document/${studentModalityId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// ========================================
// 🎓 FACULTADES Y PROGRAMAS (ESTUDIANTE)
// ========================================
export const getActiveFacultiesStudent = async () => {
  const res = await api.get("/faculties/active");
  return extractData(res.data);
};

export const getActiveProgramsStudent = async () => {
  const res = await api.get("/academic-programs/active");
  return extractData(res.data);
};