import { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function useConfirm() {
  const [estado, setEstado] = useState({
    open: false,
    mensaje: "",
    titulo: "Confirmar",
    resolve: null,
  });

  const confirm = useCallback((mensaje, titulo = "Confirmar") => {
    return new Promise((resolve) => {
      setEstado({ open: true, mensaje, titulo, resolve });
    });
  }, []);

  const cerrar = (resultado) => {
    setEstado((prev) => {
      prev.resolve?.(resultado);
      return { open: false, mensaje: "", titulo: "Confirmar", resolve: null };
    });
  };

  const ConfirmModal = (
    <Dialog open={estado.open} onClose={() => cerrar(false)}>
      <DialogTitle>{estado.titulo}</DialogTitle>
      <DialogContent>
        <Typography sx={{ pt: 1 }}>{estado.mensaje}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => cerrar(false)}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={() => cerrar(true)}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { confirm, ConfirmModal };
}
