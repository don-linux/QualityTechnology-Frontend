// src/utils/auth.js
import { API_URL } from "./api";

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
      await fetch(`${API_URL}/usuarios/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (err) {
      console.error("Error al cerrar sesión en servidor:", err);
    }
  }
  localStorage.clear();
  window.location.href = "/login";
};
