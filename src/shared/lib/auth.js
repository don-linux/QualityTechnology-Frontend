// src/utils/auth.js
import axiosInstance from "./axiosInstance";

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
      await axiosInstance.post("/usuarios/logout", { refreshToken });
    } catch (err) {
      console.error("Error al cerrar sesión en servidor:", err);
    }
  }
  localStorage.clear();
  window.location.href = "/login";
};
