import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listRoles() {
  return axios.get(ENDPOINTS.roles.base);
}

export function createRol(nombre) {
  return axios.post(ENDPOINTS.roles.base, { nombre });
}

export function updateRol(id, nombre) {
  return axios.put(ENDPOINTS.roles.byId(id), { nombre });
}

export function removeRol(id) {
  return axios.delete(ENDPOINTS.roles.byId(id));
}
