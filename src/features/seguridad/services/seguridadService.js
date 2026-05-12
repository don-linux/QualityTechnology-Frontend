import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listRoles() {
  return axios.get(ENDPOINTS.roles.base);
}

export function listModulos() {
  return axios.get(ENDPOINTS.modulos.base);
}

export function listModulosByRol(rolId) {
  return axios.get(ENDPOINTS.rolesModulos.byRol(rolId));
}

export function updateModulosByRol(rolId, modulosIds) {
  return axios.put(ENDPOINTS.rolesModulos.byRol(rolId), { moduloIds: modulosIds });
}
