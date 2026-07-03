import { useCallback, useMemo, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ListadoToolbar from "./listado/ListadoToolbar";
import DialogExportarListado from "./listado/DialogExportarListado";
import useFiltrosListado from "./listado/useFiltrosListado";
import useNombreImpresion from "@shared/hooks/useNombreImpresion";
import {
  exportarTablaPDF,
  exportarTablaExcel,
  calcularRangoFechas,
} from "@shared/utils/exportarTabla";
import {
  REGISTRO_FILTROS,
  rangoFechasDesdeSeleccion,
} from "./listado/filtros/registroFiltros";

const resolverColumnas = (exportar) =>
  exportar
    ? typeof exportar.columnas === "function"
      ? exportar.columnas()
      : exportar.columnas
    : null;

function resolverConfigFiltros(filtros, filtroConfig, campoFecha) {
  const config = { ...filtroConfig };

  if (filtros.includes("fechas")) {
    config.fechas = {
      ...(filtroConfig?.fechas ?? {}),
      campo: filtroConfig?.fechas?.campo ?? campoFecha,
    };
  }

  return config;
}

function ListadoUbicacionItem({
  value,
  label,
  rows,
  renderTabla,
  defaultExpanded,
  accordionSx,
  detailsSx,
  filtros,
  filtroConfig,
  campoFecha,
  exportar,
  getLogo,
  getColor,
}) {
  const config = useMemo(
    () => resolverConfigFiltros(filtros, filtroConfig, campoFecha),
    [filtros, filtroConfig, campoFecha],
  );

  const { valores, setFiltro, filas, filasExportacion, hayFiltroActivo } = useFiltrosListado({
    rows,
    filtros,
    config,
  });

  const [modalExport, setModalExport] = useState({ open: false, formato: "pdf" });
  const impresoPor = useNombreImpresion();

  const rangoDatosDisponibles = useMemo(
    () => calcularRangoFechas(rows, campoFecha),
    [rows, campoFecha],
  );

  const total = rows.length;
  const visibles = filas.length;
  const conteoLabel = hayFiltroActivo
    ? `${visibles} de ${total}`
    : `${total} ${total === 1 ? "registro" : "registros"}`;

  const color = getColor ? getColor(value) : undefined;
  const logo = getLogo ? getLogo(value) : undefined;

  const fechasInicialesModal = useMemo(() => {
    const fechasVista = valores.fechas;
    if (fechasVista?.desde || fechasVista?.hasta) {
      return { desde: fechasVista.desde, hasta: fechasVista.hasta };
    }
    return { desde: "", hasta: "" };
  }, [valores.fechas]);

  const contarFilasExportacion = useCallback(
    (fechasExportacion) => {
      const filtroFechas = REGISTRO_FILTROS.fechas;
      if (!filtroFechas) return filasExportacion.length;
      return filtroFechas.aplicar(filasExportacion, fechasExportacion, config.fechas ?? {}).length;
    },
    [filasExportacion, config.fechas],
  );

  const ejecutarExportacion = useCallback(
    (formato, fechasExportacion) => {
      const columnas = resolverColumnas(exportar);
      if (!columnas) return;

      const filtroFechas = REGISTRO_FILTROS.fechas;
      const filasExport = filtroFechas
        ? filtroFechas.aplicar(filasExportacion, fechasExportacion, config.fechas ?? {})
        : filasExportacion;

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
    [exportar, filasExportacion, config.fechas, impresoPor, label, color, logo],
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

  const mostrarToolbar = filtros.length > 0 || Boolean(exportar);

  return (
    <>
      <Accordion defaultExpanded={defaultExpanded} sx={{ mt: 1, mb: 2, ...accordionSx }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
            <Typography fontWeight="bold">{label}</Typography>
            <Chip
              size="small"
              label={conteoLabel}
              sx={{
                fontWeight: 600,
                color: "#fff",
                bgcolor: Array.isArray(color) ? `rgb(${color.join(",")})` : "primary.main",
              }}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, ...detailsSx }}>
          {mostrarToolbar && (
            <ListadoToolbar
              filtros={filtros}
              config={config}
              valores={valores}
              onFiltro={setFiltro}
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
 * - `filtros`: ids activos del registry, ej. `["busqueda", "fechas"]`.
 * - `filtroConfig`: config por id, ej. `{ busqueda: { keys, placeholder } }`.
 * - `campoFecha`: campo de fecha en cada fila (default `"fecha"`).
 * - `exportar`: `{ columnas, titulo, subtitulo, nombreArchivo }`.
 * - `getLogo` / `getColor`: resuelven logo y color por ubicación (`value`).
 */
export default function TablasPorUbicacionGranja({
  grupos,
  renderTabla,
  defaultExpanded = false,
  accordionSx,
  detailsSx,
  filtros = [],
  filtroConfig = {},
  exportar,
  getLogo,
  getColor,
  campoFecha = "fecha",
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
      filtros={filtros}
      filtroConfig={filtroConfig}
      exportar={exportar}
      getLogo={getLogo}
      getColor={getColor}
      campoFecha={campoFecha}
    />
  ));
}
