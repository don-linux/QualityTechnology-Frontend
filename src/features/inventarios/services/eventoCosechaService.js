import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** Cosecha e incubación (flujo unificado en la tabla `incubacion`). */
export function listIncubacion(filtroUbicacion, piletaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  if (opciones.historial) params.historial = true;
  return axios.get(ENDPOINTS.incubacion.base, { params });
}

export function createIncubacion(data) {
  return axios.post(ENDPOINTS.incubacion.base, data);
}

export function updateIncubacion(id, data) {
  return axios.put(ENDPOINTS.incubacion.byId(id), data);
}

export function removeIncubacion(id) {
  return axios.delete(ENDPOINTS.incubacion.byId(id));
}
