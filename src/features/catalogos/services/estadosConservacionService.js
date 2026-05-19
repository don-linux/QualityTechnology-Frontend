import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEstadosConservacion() {
  return axios.get(ENDPOINTS.estadosConservacion.base);
}

export function listEstadosConservacionActivos() {
  return axios.get(ENDPOINTS.estadosConservacion.activos);
}

export function createEstadoConservacion(nombre) {
  return axios.post(ENDPOINTS.estadosConservacion.base, { nombre });
}

export function updateEstadoConservacion(id, nombre) {
  return axios.put(ENDPOINTS.estadosConservacion.byId(id), { nombre });
}

export function activateEstadoConservacion(id) {
  return axios.patch(ENDPOINTS.estadosConservacion.activate(id));
}

export function deactivateEstadoConservacion(id) {
  return axios.patch(ENDPOINTS.estadosConservacion.deactivate(id));
}
