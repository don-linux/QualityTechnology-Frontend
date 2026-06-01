import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** CRUD del modelo `control_reproductivo` (inventario periódico en piletas reproductoras). */

export function listControlReproductivo(filtroUbicacion, piletaId) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  return axios.get(ENDPOINTS.controlReproductivo.base, { params });
}

export function createControlReproductivo(data) {
  return axios.post(ENDPOINTS.controlReproductivo.base, data);
}

export function updateControlReproductivo(id, data) {
  return axios.put(ENDPOINTS.controlReproductivo.byId(id), data);
}

export function removeControlReproductivo(id) {
  return axios.delete(ENDPOINTS.controlReproductivo.byId(id));
}
