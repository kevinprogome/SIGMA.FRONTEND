import api from "../api/axios";

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
  return response.data;
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

// ✅ VER DOCUMENTO (BLOB/PDF) - Igual que councilService
export const getStudentDocumentBlob = async (studentDocumentId) => {
  console.log("🔍 Descargando documento ID:", studentDocumentId);

  try {
    const response = await api.get(
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