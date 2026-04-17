import axios from "@shared/lib/axiosInstance";

export function listPuestos() {
  return axios.get("/puestos");
}

export function createPuesto(fc_nombre) {
  return axios.post("/puestos", { fc_nombre });
}

export function updatePuesto(id, fc_nombre) {
  return axios.put(`/puestos/${id}`, { fc_nombre });
}

export function activatePuesto(id) {
  return axios.patch(`/puestos/${id}/activate`);
}

export function deactivatePuesto(id) {
  return axios.patch(`/puestos/${id}/deactivate`);
}
