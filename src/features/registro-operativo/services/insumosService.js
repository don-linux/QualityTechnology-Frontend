import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listInsumos() {
  return axios.get(ENDPOINTS.bitacoras.insumos.base);
}

export function listEmpleadosInsumos() {
  return axios.get(ENDPOINTS.bitacoras.insumos.empleados);
}

export function createInsumo(data) {
  return axios.post(ENDPOINTS.bitacoras.insumos.base, data);
}

export function updateInsumo(id, data) {
  return axios.put(ENDPOINTS.bitacoras.insumos.byId(id), data);
}

export function removeInsumo(id) {
  return axios.delete(ENDPOINTS.bitacoras.insumos.byId(id));
}

export function removeAllInsumos() {
  return axios.delete(ENDPOINTS.bitacoras.insumos.base);
}
