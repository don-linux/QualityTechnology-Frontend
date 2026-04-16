import axios from "@shared/lib/axiosInstance";

export function listRoles() {
  return axios.get("/roles");
}

export function listModulos() {
  return axios.get("/modulos");
}

export function listModulosByRol(rolId) {
  return axios.get(`/roles-modulos/${rolId}/modulos`);
}

export function updateModulosByRol(rolId, modulosIds) {
  return axios.put(`/roles-modulos/${rolId}/modulos`, { modulosIds });
}
