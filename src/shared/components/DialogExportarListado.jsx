import { useEffect, useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ExcelIcon from "./ExcelIcon";

const FECHAS_VACIAS = { desde: "", hasta: "" };

/**
 * Modal to confirm the date range for PDF/Excel export.
 * Export period is independent from the on-screen list filter.
 */
export default function DialogExportarListado({
  open,
  formato = "pdf",
  fechasIniciales = FECHAS_VACIAS,
  onConfirm,
  onClose,
  contarFilas,
  rangoDatosDisponibles = null,
}) {
  const [fechas, setFechas] = useState(FECHAS_VACIAS);

  useEffect(() => {
    if (!open) return;
    setFechas({
      desde: fechasIniciales?.desde ?? "",
      hasta: fechasIniciales?.hasta ?? "",
    });
  }, [open, fechasIniciales]);

  const rangoInvalido =
    Boolean(fechas.desde && fechas.hasta && fechas.desde > fechas.hasta);

  const conteo = useMemo(() => {
    if (typeof contarFilas !== "function") return null;
    return contarFilas(fechas);
  }, [contarFilas, fechas]);

  const handleConfirm = () => {
    if (rangoInvalido) return;
    onConfirm?.(fechas);
  };

  const esPdf = formato === "pdf";
  const tituloFormato = esPdf ? "PDF" : "Excel";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Exportar {tituloFormato}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Estas fechas definen el periodo del reporte y el pie de página.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={fechas.desde}
            onChange={(e) => setFechas((prev) => ({ ...prev, desde: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: "1 1 140px" }}
            error={rangoInvalido}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={fechas.hasta}
            onChange={(e) => setFechas((prev) => ({ ...prev, hasta: e.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: "1 1 140px" }}
            error={rangoInvalido}
          />
        </Box>

        {rangoInvalido && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
            La fecha inicial no puede ser posterior a la final.
          </Typography>
        )}

        {conteo !== null && !rangoInvalido && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {conteo === 0
              ? "No hay registros en el periodo seleccionado. Se exportará un reporte vacío."
              : `${conteo} ${conteo === 1 ? "registro" : "registros"} en el periodo seleccionado.`}
          </Typography>
        )}

        {rangoDatosDisponibles?.desde || rangoDatosDisponibles?.hasta ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Datos disponibles:{" "}
            {[rangoDatosDisponibles.desde, rangoDatosDisponibles.hasta]
              .filter(Boolean)
              .join(" — ") || "sin fechas"}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color={esPdf ? "error" : "success"}
          disabled={rangoInvalido}
          startIcon={esPdf ? <PictureAsPdfRoundedIcon /> : <ExcelIcon />}
          onClick={handleConfirm}
        >
          Exportar {tituloFormato}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
