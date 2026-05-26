import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/**
 * Registros periódicos del modelo `alevinaje` (historial en BD).
 * GET devuelve por defecto la vista actual (último registro por pileta);
 * use `?historial=true` para todos los registros.
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
