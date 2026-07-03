import { useCallback, useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListadoToolbar from "./ListadoToolbar";
import DialogExportarListado from "./DialogExportarListado";
import useNombreImpresion from "@shared/hooks/useNombreImpresion";
import {
  exportarTablaPDF,
  exportarTablaExcel,
  calcularRangoFechas,
} from "@shared/utils/exportarTabla";
import { toInputDate } from "@shared/utils/formatters";

function filtrarFilas(rows, query, searchKeys, filtrar) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  if (typeof filtrar === "function") return rows.filter((row) => filtrar(row, q));
  if (!searchKeys?.length) return rows;
  return rows.filter((row) =>
    searchKeys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
  );
}

function filtrarFilasPorFecha(rows, fechas, campoFecha) {
  const { desde, hasta } = fechas || {};
  if (!desde && !hasta) return rows;

  return rows.filter((row) => {
    const iso = toInputDate(row[campoFecha]);
    if (!iso) return false;
    if (desde && iso < desde) return false;
    if (hasta && iso > hasta) return false;
    return true;
  });
}

const resolverColumnas = (exportar) =>
  exportar
    ? typeof exportar.columnas === "function"
      ? exportar.columnas()
      : exportar.columnas
    : null;

const rangoFechasDesdeSeleccion = (fechas) => {
  if (!fechas?.desde && !fechas?.hasta) return null;
  return {
    desde: fechas.desde || null,
    hasta: fechas.hasta || null,
  };
};

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
  filtroFecha,
  campoFecha,
}) {
  const [busqueda, setBusqueda] = useState("");
  const [fechasVista, setFechasVista] = useState({ desde: "", hasta: "" });
  const [modalExport, setModalExport] = useState({ open: false, formato: "pdf" });
  const impresoPor = useNombreImpresion();

  const filas = useMemo(() => {
    let result = rows;
    if (buscar) {
      result = filtrarFilas(result, busqueda, searchKeys, filtrar);
    }
    if (filtroFecha) {
      result = filtrarFilasPorFecha(result, fechasVista, campoFecha);
    }
    return result;
  }, [rows, buscar, busqueda, searchKeys, filtrar, filtroFecha, fechasVista, campoFecha]);

  const filasBaseExportacion = useMemo(() => {
    if (!buscar) return rows;
    return filtrarFilas(rows, busqueda, searchKeys, filtrar);
  }, [rows, buscar, busqueda, searchKeys, filtrar]);

  const rangoDatosDisponibles = useMemo(
    () => calcularRangoFechas(rows, campoFecha),
    [rows, campoFecha],
  );

  const total = rows.length;
  const visibles = filas.length;
  const hayBusqueda = buscar && busqueda.trim().length > 0;
  const hayFiltroFecha = filtroFecha && (fechasVista.desde || fechasVista.hasta);
  const hayFiltroActivo = hayBusqueda || hayFiltroFecha;
  const conteoLabel = hayFiltroActivo
    ? `${visibles} de ${total}`
    : `${total} ${total === 1 ? "registro" : "registros"}`;

  const color = getColor ? getColor(value) : undefined;
  const logo = getLogo ? getLogo(value) : undefined;

  const fechasInicialesModal = useMemo(() => {
    if (hayFiltroFecha) {
      return { desde: fechasVista.desde, hasta: fechasVista.hasta };
    }
    return { desde: "", hasta: "" };
  }, [hayFiltroFecha, fechasVista.desde, fechasVista.hasta]);

  const contarFilasExportacion = useCallback(
    (fechasExportacion) =>
      filtrarFilasPorFecha(filasBaseExportacion, fechasExportacion, campoFecha).length,
    [filasBaseExportacion, campoFecha],
  );

  const ejecutarExportacion = useCallback(
    (formato, fechasExportacion) => {
      const columnas = resolverColumnas(exportar);
      if (!columnas) return;

      const filasExport = filtrarFilasPorFecha(
        filasBaseExportacion,
        fechasExportacion,
        campoFecha,
      );
      const rangoFechas = rangoFechasDesdeSeleccion(fechasExportacion);
      const opciones = { impresoPor, rangoFechas };

      if (formato === "excel") {
        exportarTablaExcel({
          columnas,
          filas: filasExport,
          nombreHoja: label,
          nombreArchivo: `${exportar.nombreArchivo}_${label}`,
          color,
          ...opciones,
        });
      } else {
        exportarTablaPDF({
          columnas,
          filas: filasExport,
          titulo: exportar.titulo ? `${exportar.titulo} — ${label}` : label,
          subtitulo: exportar.subtitulo,
          logo,
          color,
          nombreArchivo: `${exportar.nombreArchivo}_${label}`,
          ...opciones,
        });
      }

      setModalExport({ open: false, formato: "pdf" });
    },
    [exportar, filasBaseExportacion, campoFecha, impresoPor, label, color, logo],
  );

  const abrirModalExport = (formato) => {
    setModalExport({ open: true, formato });
  };

  const handleConfirmExport = (fechasExportacion) => {
    ejecutarExportacion(modalExport.formato, fechasExportacion);
  };

  const cerrarModalExport = () => {
    setModalExport((prev) => ({ ...prev, open: false }));
  };

  const mostrarToolbar = Boolean(buscar || exportar || filtroFecha);

  return (
    <>
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
              fechas={fechasVista}
              onFechas={setFechasVista}
              mostrarFechas={Boolean(filtroFecha)}
              mostrarExportar={Boolean(exportar)}
              onExportarExcel={() => abrirModalExport("excel")}
              onExportarPDF={() => abrirModalExport("pdf")}
            />
          )}
          {renderTabla(filas)}
        </AccordionDetails>
      </Accordion>

      {exportar && (
        <DialogExportarListado
          open={modalExport.open}
          formato={modalExport.formato}
          fechasIniciales={fechasInicialesModal}
          onConfirm={handleConfirmExport}
          onClose={cerrarModalExport}
          contarFilas={contarFilasExportacion}
          rangoDatosDisponibles={rangoDatosDisponibles}
        />
      )}
    </>
  );
}

/**
 * Una tabla (renderTabla) por cada sede/granja, en acordeones (patrón Recambios).
 *
 * Props opcionales para homogeneizar listados:
 * - `buscar`: habilita la barra de búsqueda en cliente por listado.
 * - `searchKeys` / `filtrar`: campos a filtrar, o un predicado `(row, q) => bool`.
 * - `filtroFecha`: habilita filtro por rango de fechas en el toolbar.
 * - `campoFecha`: campo de fecha en cada fila (default `"fecha"`).
 * - `exportar`: `{ columnas, titulo, subtitulo, nombreArchivo, campoFecha? }`.
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
  filtroFecha = false,
  campoFecha = "fecha",
}) {
  if (!grupos?.length) return null;

  const campoFechaResuelto = exportar?.campoFecha || campoFecha;

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
      filtroFecha={filtroFecha}
      campoFecha={campoFechaResuelto}
    />
  ));
}
