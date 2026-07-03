import Box from "@mui/material/Box";
import ListadoFiltros from "./ListadoFiltros";
import BotonesExportar from "./BotonesExportar";

/**
 * Toolbar at the top of each listado: registry-driven filters plus export buttons.
 */
export default function ListadoToolbar({
  filtros = [],
  config = {},
  valores = {},
  onFiltro,
  onExportarExcel,
  onExportarPDF,
  mostrarExportar = true,
}) {
  const mostrarFiltros = filtros.length > 0;

  if (!mostrarFiltros && !mostrarExportar) return null;

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
          filtros={filtros}
          config={config}
          valores={valores}
          onFiltro={onFiltro}
        />
      )}

      <Box sx={{ flexGrow: 1 }} />

      {mostrarExportar && (
        <BotonesExportar
          onExportarExcel={onExportarExcel}
          onExportarPDF={onExportarPDF}
        />
      )}
    </Box>
  );
}
