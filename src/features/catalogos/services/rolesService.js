import axios from "@shared/lib/axiosInstance";

export function listRoles() {
  return axios.get("/roles");
}

export function createRol(nombre) {
  return axios.post("/roles", { nombre });
}

export function updateRol(id, nombre) {
  return axios.put(`/roles/${id}`, { nombre });
}

export function removeRol(id) {
  return axios.delete(`/roles/${id}`);
}
