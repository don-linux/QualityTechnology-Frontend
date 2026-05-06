import axios from "@shared/lib/axiosInstance";

export function listPiletas(params) {
  return axios.get("/piletas", { params });
}

export function getPileta(id) {
  return axios.get(`/piletas/${id}`);
}

export function createPileta(data) {
  return axios.post("/piletas", data);
}

export function updatePileta(id, data) {
  return axios.put(`/piletas/${id}`, data);
}

export function removePileta(id) {
  return axios.delete(`/piletas/${id}`);
}

// ── Siembra ─────────────────────────────────────────────────────────────────

export function listSiembra() {
  return axios.get("/siembra");
}

export function getSiembra(id) {
  return axios.get(`/siembra/${id}`);
}

export function registrarSiembra(data) {
  return axios.post("/siembra", data);
}

export function updateSiembra(id, data) {
  return axios.put(`/siembra/${id}`, data);
}

export function removeSiembra(id) {
  return axios.delete(`/siembra/${id}`);
}
