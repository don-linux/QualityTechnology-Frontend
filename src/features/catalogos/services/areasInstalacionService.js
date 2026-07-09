import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listAreasInstalacion() {
  return axios.get(ENDPOINTS.areasInstalacion.base);
}

export function listAreasInstalacionActivos() {
  return axios.get(ENDPOINTS.areasInstalacion.activos);
}

export function createAreaInstalacion(nombre) {
  return axios.post(ENDPOINTS.areasInstalacion.base, { nombre });
}

export function updateAreaInstalacion(id, nombre) {
  return axios.put(ENDPOINTS.areasInstalacion.byId(id), { nombre });
}

export function activateAreaInstalacion(id) {
  return axios.patch(ENDPOINTS.areasInstalacion.activate(id));
}

export function deactivateAreaInstalacion(id) {
  return axios.patch(ENDPOINTS.areasInstalacion.deactivate(id));
}
