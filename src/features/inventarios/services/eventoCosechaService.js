import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** Eventos de cosecha / desove (módulo 2 del flujo reproductivo). */
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
