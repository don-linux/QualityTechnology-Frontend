// src/utils/auth.js

// 🔹 Verifica si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token; // true si existe token válido
};

// 🔹 Obtiene el rol actual desde localStorage
export const getUserRole = () => {
  return localStorage.getItem("rol");
};

// 🔹 Cierra sesión (puede usarse desde cualquier componente)
export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};
