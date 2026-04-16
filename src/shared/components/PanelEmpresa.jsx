import React, { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import useAuth from "@app/providers/AuthProvider";

const EMPRESAS = { "1": "Granja Acuícola Medellín", "2": "Granja Acuícola La Ceiba" };

const PanelEmpresa = () => {
  const { empresaId, logout } = useAuth();
  const nombreGranja = useMemo(() => EMPRESAS[empresaId] || "Granja desconocida", [empresaId]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" mb={2}>
        Panel del Jefe de Empresa
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        {nombreGranja}
      </Typography>

      <Button variant="contained" color="error" onClick={logout}>
        Cerrar sesión
      </Button>
    </Box>
  );
};

export default PanelEmpresa;
