import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/** Eventos de cosecha / desove (módulo 2 del flujo reproductivo). */
export function listEventosCosecha(params = {}) {
  return axios.get(ENDPOINTS.eventosCosecha.base, { params });
}

export function listEventosCosechaPendientes(granja) {
  const params = { pendiente_incubacion: "1" };
  if (granja) params.granja = granja;
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
