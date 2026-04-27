import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function listByGranja(granja) {
  return axios.get(`/instalaciones/granja/${pathSegment(granja)}`);
}

export function listByTipo(tipo, granja) {
  return axios.get(`/instalaciones/tipo/${tipo}/${pathSegment(granja)}`);
}

export function createInstalacion(data) {
  return axios.post("/instalaciones", data);
}

export function updateInstalacion(id, data) {
  return axios.put(`/instalaciones/${id}`, data);
}

export function removeInstalacion(id) {
  return axios.delete(`/instalaciones/${id}`);
}
