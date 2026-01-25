import api from "../api/axios";

export const register = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data; // token
};

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data; // token
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return res.data;
};

export const logout = async () => {
  return api.post("/auth/logout");
};
