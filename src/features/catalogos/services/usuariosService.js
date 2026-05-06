import axios from "@shared/lib/axiosInstance";

export function listUsuarios() {
  return axios.get("/usuarios");
}

export function getUsuario(id) {
  return axios.get(`/usuarios/${id}`);
}

export function listRoles() {
  return axios.get("/roles");
}

export function createUsuario(data) {
  return axios.post("/usuarios", data);
}

export function updateUsuario(id, data) {
  return axios.put(`/usuarios/${id}`, data);
}

export function toggleUsuarioActivo(id, activate) {
  const endpoint = activate ? "activate" : "deactivate";
  return axios.patch(`/usuarios/${id}/${endpoint}`);
}
