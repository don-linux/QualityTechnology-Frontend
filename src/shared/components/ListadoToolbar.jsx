import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ExcelIcon from "./ExcelIcon";

/**
 * Toolbar shown at the top of each listado: client-side search box plus
 * Excel and PDF export buttons. Export buttons are disabled when there are
 * no rows to export.
 */
export default function ListadoToolbar({
  busqueda = "",
  onBuscar,
  placeholder = "Buscar...",
  onExportarExcel,
  onExportarPDF,
  exportDisabled = false,
  mostrarBusqueda = true,
  mostrarExportar = true,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
      }}
    >
      {mostrarBusqueda && (
        <TextField
          value={busqueda}
          onChange={(e) => onBuscar?.(e.target.value)}
          placeholder={placeholder}
          size="small"
          sx={{ flex: "1 1 240px", maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      <Box sx={{ flexGrow: 1 }} />

      {mostrarExportar && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<ExcelIcon />}
            onClick={onExportarExcel}
            disabled={exportDisabled}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Excel
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<PictureAsPdfRoundedIcon />}
            onClick={onExportarPDF}
            disabled={exportDisabled}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            PDF
          </Button>
        </Box>
      )}
    </Box>
  );
}
