import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@app/providers/AuthProvider";

const PrivateRoute = ({ modulo }) => {
  const { isAuthenticated, hasModulo } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (modulo && !hasModulo(modulo)) {
    return <Navigate to="/sin-acceso" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
