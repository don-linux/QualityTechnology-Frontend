import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";

const PanelEmpresa = () => {
  const [nombreGranja, setNombreGranja] = useState("");

  useEffect(() => {
    const empresaId = localStorage.getItem("empresa_id");

    // Muestra el nombre según el ID de la empresa
    if (empresaId === "1") {
      setNombreGranja("Granja Acuícola Medellín");
    } else if (empresaId === "2") {
      setNombreGranja("Granja Acuícola La Ceiba");
    } else {
      setNombreGranja("Granja desconocida");
    }
  }, []);

  const handleCerrarSesion = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h4" mb={2}>
        Panel del Jefe de Empresa
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={4}>
        {nombreGranja}
      </Typography>

      <Button variant="contained" color="error" onClick={handleCerrarSesion}>
        Cerrar sesión
      </Button>
    </Box>
  );
};

export default PanelEmpresa;
