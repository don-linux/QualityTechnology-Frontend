import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEstadosTrampa() {
  return axios.get(ENDPOINTS.estadosTrampa.base);
}

export function listEstadosTrampaActivos() {
  return axios.get(ENDPOINTS.estadosTrampa.activos);
}

export function createEstadoTrampa(nombre) {
  return axios.post(ENDPOINTS.estadosTrampa.base, { nombre });
}

export function updateEstadoTrampa(id, nombre) {
  return axios.put(ENDPOINTS.estadosTrampa.byId(id), { nombre });
}

export function activateEstadoTrampa(id) {
  return axios.patch(ENDPOINTS.estadosTrampa.activate(id));
}

export function deactivateEstadoTrampa(id) {
  return axios.patch(ENDPOINTS.estadosTrampa.deactivate(id));
}
