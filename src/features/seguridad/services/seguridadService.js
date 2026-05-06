import axios from "@shared/lib/axiosInstance";

export function listRoles() {
  return axios.get("/roles");
}

export function listModulos() {
  return axios.get("/modulos");
}

export function listModulosByRol(rolId) {
  return axios.get(`/roles/${rolId}`);
}

export function updateModulosByRol(rolId, modulosIds) {
  return axios.put(`/roles/${rolId}/modulos`, { moduloIds: modulosIds });
}
