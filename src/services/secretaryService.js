import axios from "../api/axios";

export const getStudentsPendingModalities = async () => {
  const response = await axios.get("/modalities/students");
  return response.data;
};

// ✅ CORREGIDO: ahora recibe studentModalityId
export const getStudentModalityProfile = async (studentModalityId) => {
  const response = await axios.get(
    `/modalities/students/${studentModalityId}`
  );
  return response.data;
};

export const reviewDocument = async (studentDocumentId, data) => {
  const response = await axios.put(
    `/modalities/documents/${studentDocumentId}/review`,
    data
  );
  return response.data;
};

export const approveSecretary = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/approve-secretary`
  );
  return response.data;
};