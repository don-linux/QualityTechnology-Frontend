import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEmpleadosInventarioInsumos() {
  return axios.get(ENDPOINTS.inventarioInsumos.empleados);
}

export function listInventarioInsumos(ubicacion) {
  return axios.get(ENDPOINTS.inventarioInsumos.base, { params: { ubicacion } });
}

export function createInventarioInsumo(data) {
  return axios.post(ENDPOINTS.inventarioInsumos.base, data);
}

export function updateInventarioInsumo(id, data) {
  return axios.put(ENDPOINTS.inventarioInsumos.byId(id), data);
}
