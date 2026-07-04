import { filtroBusqueda } from "./FiltroBusqueda";
import { filtroFechas } from "./FiltroFechas";

/**
 * Catalog of listado filters. Each entry exports:
 * id, Componente, valorVacio, estaActivo, aplicar, enExportacion.
 *
 * To add a new filter:
 * 1. Create filtros/FiltroX.jsx with UI + definition object.
 * 2. Register it in REGISTRO_FILTROS below.
 * 3. Enable per table: filtros={["busqueda", "x"]} + filtroConfig.x in TablasPorUbicacionGranja.
 */
export const REGISTRO_FILTROS = {
  [filtroBusqueda.id]: filtroBusqueda,
  [filtroFechas.id]: filtroFechas,
};

export function valoresIniciales(filtros = []) {
  return filtros.reduce((acc, id) => {
    const def = REGISTRO_FILTROS[id];
    if (def) acc[id] = structuredClone(def.valorVacio);
    return acc;
  }, {});
}

export function aplicarFiltros(rows, filtros = [], valores = {}, config = {}, ids = filtros) {
  return ids.reduce((acc, id) => {
    const def = REGISTRO_FILTROS[id];
    if (!def) return acc;
    return def.aplicar(acc, valores[id], config[id] ?? {});
  }, rows);
}

export function hayFiltroActivo(filtros = [], valores = {}) {
  return filtros.some((id) => {
    const def = REGISTRO_FILTROS[id];
    return def?.estaActivo(valores[id]);
  });
}

export function filtrosExportacion(filtros = []) {
  return filtros.filter((id) => REGISTRO_FILTROS[id]?.enExportacion);
}

export function rangoFechasDesdeSeleccion(fechas) {
  if (!fechas?.desde && !fechas?.hasta) return null;
  return {
    desde: fechas.desde || null,
    hasta: fechas.hasta || null,
  };
}
