import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function getFamiliaPorInstalacion(instalacionId) {
  return axios.get(`/lotes/familia-por-instalacion/${instalacionId}`);
}

export function listInstalaciones(granja) {
  return axios.get(`/lotes/instalaciones/${pathSegment(granja)}`);
}

export function listLotes(granja) {
  return axios.get(`/lotes/granja/${pathSegment(granja)}`);
}

export function createLote(data) {
  return axios.post("/lotes", data);
}

export function updateLote(id, data) {
  return axios.put(`/lotes/${id}`, data);
}

export function removeLote(id) {
  return axios.delete(`/lotes/${id}`);
}
