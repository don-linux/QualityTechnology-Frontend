import axiosInstance from "./axiosInstance";
import { ENDPOINTS } from "./endpoints";

export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

export const getUserRole = () => {
  return localStorage.getItem("rol");
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    try {
      await axiosInstance.post(ENDPOINTS.auth.logout, { refreshToken });
    } catch (err) {
      console.error("Error al cerrar sesión en servidor:", err);
    }
  }
  localStorage.clear();
  window.location.href = "/login";
};
