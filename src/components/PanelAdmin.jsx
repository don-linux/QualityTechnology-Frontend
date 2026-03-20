import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PanelAdmin = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel del Administrador
      </Typography>
      <Typography>
        Desde aquí puedes gestionar usuarios, roles, permisos y toda la administración.
      </Typography>
    </Box>
  );
};

export default PanelAdmin;
