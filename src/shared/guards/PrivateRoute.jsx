import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@app/providers/AuthProvider";

const PrivateRoute = ({ rolesPermitidos, modulo }) => {
  const { isAuthenticated, rol, hasModulo } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos) {
    const normalizedRol = (rol || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
    if (!rolesPermitidos.includes(normalizedRol)) {
      return <Navigate to="/sin-acceso" replace />;
    }
  }

  if (modulo && !hasModulo(modulo)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
