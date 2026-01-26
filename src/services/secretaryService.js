import axios from "../api/axios";


export const getStudentsPendingModalities = async () => {
  const response = await axios.get("/modalities/students");
  return response.data;
};
