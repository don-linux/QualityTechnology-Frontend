import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function listByGranja(granja) {
  return axios.get(`/caja-ahorro/${pathSegment(granja)}`);
}

export function createCategoria(data) {
  return axios.post("/caja-ahorro", data);
}

export function updateCampo(id, data) {
  return axios.put(`/caja-ahorro/${id}`, data);
}

export function removeRegistro(id) {
  return axios.delete(`/caja-ahorro/${id}`);
}

export function removeAllByGranja(granja) {
  return axios.delete("/caja-ahorro", { params: { granja } });
}
