import { useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListadoToolbar from "./ListadoToolbar";
import { exportarTablaPDF, exportarTablaExcel } from "@shared/utils/exportarTabla";

function filtrarFilas(rows, query, searchKeys, filtrar) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  if (typeof filtrar === "function") return rows.filter((row) => filtrar(row, q));
  if (!searchKeys?.length) return rows;
  return rows.filter((row) =>
    searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
  );
}

const resolverColumnas = (exportar) =>
  exportar
    ? typeof exportar.columnas === "function"
      ? exportar.columnas()
      : exportar.columnas
    : null;

/**
 * Un listado (acordeón) por sede/granja: muestra el conteo de registros en el
 * resumen y, opcionalmente, una barra con búsqueda en cliente + exportación
 * (Excel/PDF) que actúa solo sobre las filas de ESE listado.
 */
function ListadoUbicacionItem({
  value,
  label,
  rows,
  renderTabla,
  defaultExpanded,
  accordionSx,
  detailsSx,
  buscar,
  searchKeys,
  filtrar,
  placeholderBusqueda,
  exportar,
  getLogo,
  getColor,
  mostrarConteo,
}) {
  const [busqueda, setBusqueda] = useState("");

  const filas = useMemo(
    () => (buscar ? filtrarFilas(rows, busqueda, searchKeys, filtrar) : rows),
    [buscar, rows, busqueda, searchKeys, filtrar],
  );

  const total = rows.length;
  const visibles = filas.length;
  const hayBusqueda = buscar && busqueda.trim().length > 0;
  const conteoLabel = hayBusqueda
    ? `${visibles} de ${total}`
    : `${total} ${total === 1 ? "registro" : "registros"}`;

  const color = getColor ? getColor(value) : undefined;
  const logo = getLogo ? getLogo(value) : undefined;

  const handleExcel = () => {
    const columnas = resolverColumnas(exportar);
    if (!columnas) return;
    exportarTablaExcel({
      columnas,
      filas,
      nombreHoja: label,
      nombreArchivo: `${exportar.nombreArchivo}_${label}`,
      color,
    });
  };

  const handlePDF = () => {
    const columnas = resolverColumnas(exportar);
    if (!columnas) return;
    exportarTablaPDF({
      columnas,
      filas,
      titulo: exportar.titulo ? `${exportar.titulo} — ${label}` : label,
      subtitulo: exportar.subtitulo,
      logo,
      color,
      nombreArchivo: `${exportar.nombreArchivo}_${label}`,
    });
  };

  const mostrarToolbar = Boolean(buscar || exportar);

  return (
    <Accordion defaultExpanded={defaultExpanded} sx={{ mt: 1, mb: 2, ...accordionSx }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
          <Typography fontWeight="bold">{label}</Typography>
          {mostrarConteo && (
            <Chip
              size="small"
              label={conteoLabel}
              sx={{
                fontWeight: 600,
                color: "#fff",
                bgcolor: Array.isArray(color) ? `rgb(${color.join(",")})` : "primary.main",
              }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, ...detailsSx }}>
        {mostrarToolbar && (
          <ListadoToolbar
            busqueda={busqueda}
            onBuscar={setBusqueda}
            placeholder={placeholderBusqueda}
            mostrarBusqueda={Boolean(buscar)}
            mostrarExportar={Boolean(exportar)}
            onExportarExcel={handleExcel}
            onExportarPDF={handlePDF}
            exportDisabled={visibles === 0}
          />
        )}
        {renderTabla(filas)}
      </AccordionDetails>
    </Accordion>
  );
}

/**
 * Una tabla (renderTabla) por cada sede/granja, en acordeones (patrón Recambios).
 *
 * Props opcionales para homogeneizar listados:
 * - `buscar`: habilita la barra de búsqueda en cliente por listado.
 * - `searchKeys` / `filtrar`: campos a filtrar, o un predicado `(row, q) => bool`.
 * - `exportar`: `{ columnas, titulo, subtitulo, nombreArchivo }` para Excel/PDF.
 * - `getLogo` / `getColor`: resuelven logo y color por ubicación (`value`).
 */
export default function TablasPorUbicacionGranja({
  grupos,
  renderTabla,
  defaultExpanded = false,
  accordionSx,
  detailsSx,
  buscar = false,
  searchKeys,
  filtrar,
  placeholderBusqueda = "Buscar...",
  exportar,
  getLogo,
  getColor,
  mostrarConteo = true,
}) {
  if (!grupos?.length) return null;

  return grupos.map(({ value, label, rows }) => (
    <ListadoUbicacionItem
      key={value || label}
      value={value}
      label={label}
      rows={rows}
      renderTabla={renderTabla}
      defaultExpanded={defaultExpanded}
      accordionSx={accordionSx}
      detailsSx={detailsSx}
      buscar={buscar}
      searchKeys={searchKeys}
      filtrar={filtrar}
      placeholderBusqueda={placeholderBusqueda}
      exportar={exportar}
      getLogo={getLogo}
      getColor={getColor}
      mostrarConteo={mostrarConteo}
    />
  ));
}
