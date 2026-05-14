import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/* ============================================================================
   Engordas por granja (el backend ya no expone GET / ni GET /:id)
============================================================================ */

export function listEngordas(filtroUbicacion) {
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = ENDPOINTS.engorda.byGranja(nombre);
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  return axios.get(base, {
    params: Object.keys(params).length ? params : undefined,
  });
}

/**
 * Crea o actualiza una engorda.
 * El backend usa un único endpoint POST con `fi_engorda_id` opcional dentro
 * del body para diferenciar create de update.
 */
export function createEngorda(data) {
  return axios.post(ENDPOINTS.engorda.base, data);
}

export function removeEngorda(id) {
  return axios.delete(ENDPOINTS.engorda.byId(id));
}

/* ============================================================================
   Movimientos
============================================================================ */

export function listMovimientos(usuarioId) {
  return axios.get(ENDPOINTS.engorda.movimientos(usuarioId));
}

export function removeMovimiento(id) {
  return axios.delete(ENDPOINTS.engorda.deleteMovimiento(id));
}
