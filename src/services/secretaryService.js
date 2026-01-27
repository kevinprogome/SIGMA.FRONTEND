import axios from "../api/axios";

export const getStudentsPendingModalities = async () => {
  const response = await axios.get("/modalities/students");
  return response.data;
};

export const getStudentModalityProfile = async (studentModalityId) => {
  const response = await axios.get(
    `/modalities/students/${studentModalityId}`
  );
  return response.data;
};

// ✅ CORRECTO: Usar el endpoint que devuelve el PDF
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

export const approveSecretary = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/approve-secretary`
  );
  return response.data;
};