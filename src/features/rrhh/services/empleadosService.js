import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEmpleados() {
  return axios.get(ENDPOINTS.empleados.base);
}

export function listDepartamentosActivos() {
  return axios.get(ENDPOINTS.departamentos.activos);
}

export function listPuestosActivos() {
  return axios.get(ENDPOINTS.puestos.activos);
}

export function updateEmpleado(id, data) {
  return axios.put(ENDPOINTS.empleados.byId(id), data);
}

export function createEmpleado(data) {
  return axios.post(ENDPOINTS.empleados.base, data);
}

export function toggleEmpleadoActivo(id, activate, data = {}) {
  const url = activate ? ENDPOINTS.empleados.activate(id) : ENDPOINTS.empleados.deactivate(id);
  return axios.patch(url, data);
}
