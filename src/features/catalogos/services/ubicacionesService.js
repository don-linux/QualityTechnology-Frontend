import axios from "@shared/lib/axiosInstance";

export function listUbicaciones() {
  return axios.get("/ubicaciones");
}

export function getUbicacion(id) {
  return axios.get(`/ubicaciones/${id}`);
}

export function createUbicacion(data) {
  return axios.post("/ubicaciones", data);
}

export function updateUbicacion(id, data) {
  return axios.put(`/ubicaciones/${id}`, data);
}

export function removeUbicacion(id) {
  return axios.delete(`/ubicaciones/${id}`);
}
