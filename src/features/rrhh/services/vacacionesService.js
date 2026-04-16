import axios from "@shared/lib/axiosInstance";

export function listVacaciones() {
  return axios.get("/vacaciones");
}

export function createVacaciones(data) {
  return axios.post("/vacaciones", data);
}

export function updateVacaciones(id, data) {
  return axios.put(`/vacaciones/${id}`, data);
}

export function removeVacaciones(id) {
  return axios.delete(`/vacaciones/${id}`);
}

export function removeAllVacaciones() {
  return axios.delete("/vacaciones");
}
