import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

function normalizarFiltrosUbicacion(filtros) {
  const obj =
    typeof filtros === "object" && filtros != null ? filtros : { granja: filtros ?? "" };
  const granjaPath = String(obj.granja ?? obj.nombre ?? "").trim();
  const params = {};
  filtrosUbicacionAParams(params, obj);
  return { granjaPath, params };
}

/**
 * CRUD del modelo `alevinaje` (etapa cría en piletas tipo "alevinaje").
 * Backend persiste la observación con pileta_id + proceso "alevinaje" para
 * que aparezca como "última observación" al consultar la pileta.
 */

export function listAlevinaje(filtroUbicacion, piletaId) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  return axios.get(ENDPOINTS.alevinaje.base, { params });
}

/** Piletas tipo reproductores, estado ocupada (selector en control reproductivo). */
export function listReproductoresOcupadas(filtros) {
  const { granjaPath, params } = normalizarFiltrosUbicacion(filtros);
  return axios.get(ENDPOINTS.alevinaje.reproductoresOcupadas(granjaPath), {
    params: Object.keys(params).length ? params : undefined,
  });
}

/** Familia asociada a la pileta (reproductor o último registro `alevinaje`). */
export function getFamiliaPorPileta(piletaId) {
  return axios.get(ENDPOINTS.alevinaje.familiaPorPileta(piletaId));
}

export function createAlevinaje(data) {
  return axios.post(ENDPOINTS.alevinaje.base, data);
}

export function updateAlevinaje(id, data) {
  return axios.put(ENDPOINTS.alevinaje.byId(id), data);
}

export function removeAlevinaje(id) {
  return axios.delete(ENDPOINTS.alevinaje.byId(id));
}
