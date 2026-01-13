import { Stack, Button } from "@mui/material";
import { Home, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function PageHeader() {
  const navigate = useNavigate();

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Home />}
        onClick={() => navigate("/")}
        sx={{ borderRadius: 3, textTransform: "none", fontWeight: "bold" }}
      >
        Inicio
      </Button>

      <Button
        variant="outlined"
        color="secondary"
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ borderRadius: 3, textTransform: "none" }}
      >
        Regresar
      </Button>
    </Stack>
  );
}
