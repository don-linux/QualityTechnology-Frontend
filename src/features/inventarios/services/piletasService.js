import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/**
 * `@param filtros` objeto `{ granja?, ubicacion_id? }`, o legado: string nombre sede.
 * El backend usa `ubicacion_id` cuando existe (FK tabla `ubicacion`).
 */
export function filtrosUbicacionAParams(params, filtros) {
  if (filtros == null || filtros === "") return;
  if (typeof filtros === "object") {
    if (filtros.ubicacion_id != null && filtros.ubicacion_id !== "") {
      params.ubicacion_id = filtros.ubicacion_id;
    }
    const g = filtros.granja ?? filtros.nombre ?? filtros.fc_granja;
    if (g) params.granja = g;
    return;
  }
  params.granja = filtros;
}

export function listPiletas(filtroUbicacion, tipo) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (tipo) params.tipo = tipo;
  return axios.get(ENDPOINTS.piletas.base, { params });
}

export function createPileta(data) {
  return axios.post(ENDPOINTS.piletas.base, data);
}

export function updatePileta(id, data) {
  return axios.put(ENDPOINTS.piletas.byId(id), data);
}

export function removePileta(id) {
  return axios.delete(ENDPOINTS.piletas.byId(id));
}

/**
 * Historial de la tabla `observacion` para una pileta (incluye trazabilidad, registros periódicos, etc.).
 * @param {number|string} piletaId
 * @param {string[]} [procesos] ej. ['alevinaje','trazabilidad']
 */
export function listObservacionesPileta(piletaId, procesos) {
  const params = {};
  if (procesos?.length) params.proceso = procesos.join(",");
  return axios.get(ENDPOINTS.piletas.observaciones(piletaId), { params });
}
