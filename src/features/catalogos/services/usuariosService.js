import axios from "@shared/lib/axiosInstance";

export function listUsuarios() {
  return axios.get("/usuarios");
}

export function listRoles() {
  return axios.get("/roles");
}

export function listDepartamentosActivos() {
  return axios.get("/departamentos/activos");
}

export function listPuestosActivos() {
  return axios.get("/puestos/activos");
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
