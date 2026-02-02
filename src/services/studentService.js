import api from "../api/axios";

/**
 * Dashboard del estudiante
 */
export const getStudentDashboard = async () => {
  const response = await api.get("/student/dashboard");
  return response.data;
};

/**
 * Estado de la modalidad de grado
 */
export const getStudentStatus = async () => {
  const response = await api.get("/student/status");
  return response.data;
};

/**
 * Modalidades disponibles
 */
export const getModalidades = async () => {
  const response = await api.get("/modalities");
  return response.data;
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


export const requestCancellation = async (studentId) => {
  const res = await api.post(`/students/${studentId}/request-cancellation`);
  return res.data;
};

export const getCurrentModalityStatus = async () => {
  const res = await api.get("/students/modality/current");
  return res.data;
};


export const getStudentProfile = async () => {
  const res = await api.get("/students/profile");
  return res.data;
};

export const saveStudentProfile = async (profile) => {
  const res = await api.post("/students/profile", profile);
  return res.data;
};

/**
 * Solicitar cancelación
 */
export const requestCancellationModality = async (studentModalityId) => {
  const res = await api.post(
    `/students/${studentModalityId}/request-cancellation`
  );
  return res.data;
};
// Corregir esta función
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

export const getModalityById = async (id) => {
  const res = await api.get(`/modalities/${id}`);
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