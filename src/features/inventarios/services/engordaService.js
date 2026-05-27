import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/**
 * Registros periódicos del modelo `engorda` (historial en BD).
 * GET devuelve por defecto la vista actual (último registro por pileta);
 * use `?historial=true` para todos los registros.
 */

export function listEngordas(filtroUbicacion, piletaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  if (opciones.historial) params.historial = true;
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = nombre ? ENDPOINTS.engorda.byGranja(nombre) : ENDPOINTS.engorda.base;
  return axios.get(base, { params: Object.keys(params).length ? params : undefined });
}

/** Todos los registros periódicos de una pileta (incluye observaciones históricas). */
export function listEngordasHistorialPileta(piletaId, filtroUbicacion) {
  return listEngordas(filtroUbicacion, piletaId, { historial: true });
}

export function createEngorda(data) {
  return axios.post(ENDPOINTS.engorda.base, data);
}

export function updateEngorda(id, data) {
  return axios.put(ENDPOINTS.engorda.byId(id), data);
}

export function removeEngorda(id) {
  return axios.delete(ENDPOINTS.engorda.byId(id));
}
