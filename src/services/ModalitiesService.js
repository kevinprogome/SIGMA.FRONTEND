import axios from "axios";

const API_URL = "http://localhost:8080/modalities";

export const getAllModalities = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const getModalityById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

export const startModality = async (id) => {
  const res = await axios.post(`${API_URL}/${id}/start`);
  return res.data;
};
