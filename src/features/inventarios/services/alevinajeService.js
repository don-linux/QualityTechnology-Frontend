import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

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

export function createAlevinaje(data) {
  return axios.post(ENDPOINTS.alevinaje.base, data);
}

export function updateAlevinaje(id, data) {
  return axios.put(ENDPOINTS.alevinaje.byId(id), data);
}

export function removeAlevinaje(id) {
  return axios.delete(ENDPOINTS.alevinaje.byId(id));
}
