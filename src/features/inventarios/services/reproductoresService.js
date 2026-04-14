import axios from "@shared/lib/axiosInstance";

export function listByGranja(granja) {
  return axios.get(`/reproductores/granja/${granja}`);
}

export function getMovimientos(granja) {
  return axios.get(`/reproductores/movimientos/${granja}`);
}

export function createReproductor(data) {
  return axios.post("/reproductores", data);
}

export function updateReproductor(id, data) {
  return axios.put(`/reproductores/${id}`, data);
}

export function removeReproductor(id) {
  return axios.delete(`/reproductores/${id}`);
}
