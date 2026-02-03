import axios from "axios";

const API_URL = "http://localhost:8080/admin";
const MODALITY_URL = "http://localhost:8080/modalities";
const DOCUMENT_URL = "http://localhost:8080/required-documents";
const STUDENT_URL = "http://localhost:8080/students";

// ==================== ROLES ====================
export const getAllRoles = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/getRoles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createRole = async (roleData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/createRole`, roleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateRole = async (id, roleData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${API_URL}/updateRole/${id}`, roleData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Cambiar esta función
export const assignRoleToUser = async (data) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/assignRole`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== PERMISSIONS ====================
export const getAllPermissions = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/getPermissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createPermission = async (permissionData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/createPermission`, permissionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== USERS ====================
export const getAllUsers = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${API_URL}/getUsers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const changeUserStatus = async (data) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${API_URL}/changeUserStatus`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== MODALITIES ====================
export const getAllModalities = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${MODALITY_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getModalitiesAdmin = async (status = null) => {
  const token = localStorage.getItem("token");
  let url = `${API_URL}/modalities`;
  
  if (status) {
    url += `?status=${status}`;
  }
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createModality = async (modalityData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${MODALITY_URL}/create`, modalityData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateModality = async (modalityId, modalityData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${MODALITY_URL}/update/${modalityId}`, modalityData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteModality = async (modalityId) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${MODALITY_URL}/delete/${modalityId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getModalityRequirements = async (modalityId, active = null) => {
  const token = localStorage.getItem("token");
  let url = `${MODALITY_URL}/${modalityId}/requirements`;
  
  if (active !== null) {
    url += `?active=${active}`;
  }
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createModalityRequirements = async (modalityId, requirements) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${MODALITY_URL}/requirements/create/${modalityId}`,
    requirements,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateModalityRequirements = async (modalityId, requirements) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(
    `${MODALITY_URL}/requirements/${modalityId}/update`,
    requirements,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteModalityRequirement = async (requirementId) => {
  const token = localStorage.getItem("token");
  const response = await axios.delete(
    `${MODALITY_URL}/requirements/delete/${requirementId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ==================== DOCUMENTS ====================
export const createRequiredDocument = async (documentData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(`${DOCUMENT_URL}/create`, documentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateRequiredDocument = async (documentId, documentData) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${DOCUMENT_URL}/update/${documentId}`, documentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const viewRequiredDocuments = async (modalityId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${DOCUMENT_URL}/view/${modalityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// 🆕 NUEVA FUNCIÓN PARA FILTRAR POR MODALIDAD Y ESTADO
export const getRequiredDocumentsByModalityAndStatus = async (modalityId, active = null) => {
  const token = localStorage.getItem("token");
  let url = `${DOCUMENT_URL}/modality/${modalityId}`;
  
  if (active !== null) {
    url += `/filter?active=${active}`;
  }
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// También agregar función para eliminar (desactivar) documentos
export const deleteRequiredDocument = async (documentId) => {
  const token = localStorage.getItem("token");
  const response = await axios.put(`${DOCUMENT_URL}/delete/${documentId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// ==================== STUDENT CANCELLATIONS ====================
export const uploadCancellationDocument = async (formData) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${STUDENT_URL}/uploadCancellationDocument`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const requestCancellationModality = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${STUDENT_URL}/requestCancellation`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ==================== COUNCIL CANCELLATIONS ====================
export const getPendingCancellations = async () => {
  const token = localStorage.getItem("token");
  const response = await axios.get(`${MODALITY_URL}/pendingCancellations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const viewCancellationDocument = async (studentModalityId) => {
  const token = localStorage.getItem("token");
  const response = await axios.get(
    `${MODALITY_URL}/viewCancellationDocument/${studentModalityId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    }
  );
  return response.data;
};

export const approveCancellation = async (studentModalityId) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${MODALITY_URL}/approveCancellation/${studentModalityId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const rejectCancellation = async (studentModalityId, reason) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${MODALITY_URL}/rejectCancellation/${studentModalityId}`,
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// ==================== SECRETARY - FILTERS ====================
export const getStudentsByFilters = async (statuses = [], searchName = "") => {
  const token = localStorage.getItem("token");
  
  let url = `${MODALITY_URL}/students?`;
  
  if (statuses.length > 0) {
    url += `statuses=${statuses.join(",")}&`;
  }
  
  if (searchName) {
    url += `name=${encodeURIComponent(searchName)}&`;
  }
  
  url = url.replace(/[&?]$/, "");
  
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};