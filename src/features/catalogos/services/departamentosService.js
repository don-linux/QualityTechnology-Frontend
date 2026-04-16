import axios from "@shared/lib/axiosInstance";

export function listDepartamentos() {
  return axios.get("/departamentos");
}

export function createDepartamento(fc_nombre) {
  return axios.post("/departamentos", { fc_nombre });
}

export function updateDepartamento(id, fc_nombre) {
  return axios.put(`/departamentos/${id}`, { fc_nombre, fb_activo: true });
}

export function deactivateDepartamento(id) {
  return axios.patch(`/departamentos/${id}/deactivate`);
}
