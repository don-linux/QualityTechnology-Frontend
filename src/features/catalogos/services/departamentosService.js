import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listDepartamentos() {
  return axios.get(ENDPOINTS.departamentos.base);
}

export function createDepartamento(fc_nombre) {
  return axios.post(ENDPOINTS.departamentos.base, { fc_nombre });
}

export function updateDepartamento(id, fc_nombre) {
  return axios.put(ENDPOINTS.departamentos.byId(id), { fc_nombre });
}

export function activateDepartamento(id) {
  return axios.patch(ENDPOINTS.departamentos.activate(id));
}

export function deactivateDepartamento(id) {
  return axios.patch(ENDPOINTS.departamentos.deactivate(id));
}
