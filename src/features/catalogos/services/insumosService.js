import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listInsumos() {
  return axios.get(ENDPOINTS.insumos.base);
}

export function listInsumosActivos() {
  return axios.get(ENDPOINTS.insumos.activos);
}

export function createInsumo(data) {
  return axios.post(ENDPOINTS.insumos.base, data);
}

export function updateInsumo(id, data) {
  return axios.put(ENDPOINTS.insumos.byId(id), data);
}

export function activateInsumo(id) {
  return axios.patch(ENDPOINTS.insumos.activate(id));
}

export function deactivateInsumo(id) {
  return axios.patch(ENDPOINTS.insumos.deactivate(id));
}
