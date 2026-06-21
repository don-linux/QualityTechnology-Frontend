import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listAlimentacion() {
  return axios.get(ENDPOINTS.bitacoras.alimentacion.base);
}

export function createAlimentacion(data) {
  return axios.post(ENDPOINTS.bitacoras.alimentacion.base, data);
}

export function updateAlimentacion(id, data) {
  return axios.put(ENDPOINTS.bitacoras.alimentacion.byId(id), data);
}

export function removeAlimentacion(id) {
  return axios.delete(ENDPOINTS.bitacoras.alimentacion.byId(id));
}

export function removeAllAlimentacion() {
  return axios.delete(ENDPOINTS.bitacoras.alimentacion.base);
}
