import api from "../api/axios";

export const changeUserStatus = async (payload) => {
  const { data } = await api.post("/admin/changeUserStatus", payload);
  return data;
};
