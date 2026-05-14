import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listUsuarios() {
  return axios.get(ENDPOINTS.usuarios.base);
}

export function getUsuario(id) {
  return axios.get(ENDPOINTS.usuarios.byId(id));
}

export function listRoles() {
  return axios.get(ENDPOINTS.roles.base);
}

export function createUsuario(data) {
  return axios.post(ENDPOINTS.usuarios.base, data);
}

export function updateUsuario(id, data) {
  return axios.put(ENDPOINTS.usuarios.byId(id), data);
}

export function toggleUsuarioActivo(id, activate) {
  const url = activate ? ENDPOINTS.usuarios.activate(id) : ENDPOINTS.usuarios.deactivate(id);
  return axios.patch(url);
}
