import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/**
 * CRUD del modelo `engorda` (etapa en piletas tipo "engorda").
 * Mismos campos operativos que alevinaje: cantidad_total, cantidad_alimento, peso, fecha_peso.
 */

export function listEngordas(filtroUbicacion, piletaId) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = nombre ? ENDPOINTS.engorda.byGranja(nombre) : ENDPOINTS.engorda.base;
  return axios.get(base, { params: Object.keys(params).length ? params : undefined });
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
