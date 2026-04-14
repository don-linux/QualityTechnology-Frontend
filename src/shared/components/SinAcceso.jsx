import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function SinAcceso() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="text.secondary">
        Acceso denegado
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={400}>
        No tienes permisos para acceder a este modulo. Contacta al administrador
        si crees que es un error.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </Box>
  );
}
