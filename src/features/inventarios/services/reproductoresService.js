import axios from "@shared/lib/axiosInstance";

export function listReproductores() {
  return axios.get("/reproductores");
}

export function getReproductor(id) {
  return axios.get(`/reproductores/${id}`);
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
