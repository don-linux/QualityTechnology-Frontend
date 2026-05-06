import axios from "@shared/lib/axiosInstance";

// ── Biometrias ───────────────────────────────────────────────────────────────

export function listBiometrias() {
  return axios.get("/biometrias");
}

export function getBiometria(id) {
  return axios.get(`/biometrias/${id}`);
}

export function createBiometria(data) {
  return axios.post("/biometrias", data);
}

export function updateBiometria(id, data) {
  return axios.put(`/biometrias/${id}`, data);
}

export function removeBiometria(id) {
  return axios.delete(`/biometrias/${id}`);
}

// ── Observaciones ────────────────────────────────────────────────────────────

export function listObservaciones(params) {
  return axios.get("/observaciones", { params });
}

export function getObservacion(id) {
  return axios.get(`/observaciones/${id}`);
}

export function createObservacion(data) {
  return axios.post("/observaciones", data);
}

export function updateObservacion(id, data) {
  return axios.put(`/observaciones/${id}`, data);
}

export function removeObservacion(id) {
  return axios.delete(`/observaciones/${id}`);
}
