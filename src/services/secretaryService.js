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

export const approveSecretary = async (studentModalityId) => {
  const response = await axios.post(
    `/modalities/${studentModalityId}/approve-secretary`
  );
  return response.data;
};