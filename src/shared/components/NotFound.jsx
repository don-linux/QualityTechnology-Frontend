import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
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
      <Typography variant="h1" fontWeight="bold" color="text.secondary">
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Página no encontrada
      </Typography>
      <Button variant="contained" onClick={() => navigate("/")}>
        Volver al inicio
      </Button>
    </Box>
  );
}
