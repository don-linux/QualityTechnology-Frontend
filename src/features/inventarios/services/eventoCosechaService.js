import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** Cosecha, desove e ingreso a incubación (flujo unificado). */
export function listEventosCosecha(params = {}) {
  return axios.get(ENDPOINTS.eventosCosecha.base, { params });
}

/** Solo eventos aún no recibidos en incubación. Acepta filtro de sede como string o `{ granja, ubicacion_id }`. */
export function listEventosCosechaPendientes(filtroUbicacion) {
  const params = { pendiente_incubacion: "1" };
  filtrosUbicacionAParams(params, filtroUbicacion);
  return listEventosCosecha(params);
}

export function createEventoCosecha(data) {
  return axios.post(ENDPOINTS.eventosCosecha.base, data);
}

export function updateEventoCosecha(id, data) {
  return axios.put(ENDPOINTS.eventosCosecha.byId(id), data);
}

export function removeEventoCosecha(id) {
  return axios.delete(ENDPOINTS.eventosCosecha.byId(id));
}

/** Vista actual por pileta; use `opciones.historial` para el historial completo. */
export function listIncubacion(filtroUbicacion, piletaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  if (opciones.historial) params.historial = true;
  return axios.get(ENDPOINTS.incubacion.base, { params });
}

export function listIncubacionHistorialPileta(piletaId, filtroUbicacion) {
  return listIncubacion(filtroUbicacion, piletaId, { historial: true });
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
