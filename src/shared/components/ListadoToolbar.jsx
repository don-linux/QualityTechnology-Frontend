import Box from "@mui/material/Box";
import ListadoFiltros from "./ListadoFiltros";
import BotonesExportar from "./BotonesExportar";

/**
 * Toolbar shown at the top of each listado: filters (search + date range)
 * plus Excel and PDF export buttons. Export buttons are disabled when there
 * are no rows to export.
 */
export default function ListadoToolbar({
  busqueda = "",
  onBuscar,
  placeholder = "Buscar...",
  mostrarBusqueda = true,
  fechas = { desde: "", hasta: "" },
  onFechas,
  mostrarFechas = false,
  onExportarExcel,
  onExportarPDF,
  exportDisabled = false,
  mostrarExportar = true,
}) {
  const mostrarFiltros = mostrarBusqueda || mostrarFechas;

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
      {mostrarFiltros && (
        <ListadoFiltros
          busqueda={busqueda}
          onBuscar={onBuscar}
          placeholder={placeholder}
          mostrarBusqueda={mostrarBusqueda}
          fechas={fechas}
          onFechas={onFechas}
          mostrarFechas={mostrarFechas}
        />
      )}

      <Box sx={{ flexGrow: 1 }} />

      {mostrarExportar && (
        <BotonesExportar
          onExportarExcel={onExportarExcel}
          onExportarPDF={onExportarPDF}
          exportDisabled={exportDisabled}
        />
      )}
    </Box>
  );
}
