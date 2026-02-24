// src/components/PrivateRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const PrivateRoute = ({ rolesPermitidos, modulo }) => {
  const auth = isAuthenticated();
  const rol = (localStorage.getItem("rol") || "")
    .normalize("NFD") // elimina acentos
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  const modulos = JSON.parse(localStorage.getItem("modulos") || "[]");

  // Si no está autenticado → redirige a login
  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  // Si tiene rol pero no pertenece a la lista permitida → sin acceso
  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  // Validación por módulo
  if (modulo) {
    const tieneModulo = modulos.some(
      (m) => m.fc_nombre.trim() === modulo
    );

    if (!tieneModulo) {
      return <Navigate to="/sin-acceso" replace />;
    }
  }

  // Si todo está bien → muestra el contenido
  return <Outlet />;
};

export default PrivateRoute;
