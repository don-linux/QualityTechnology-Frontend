import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function listInstalacionesEngorda(granja) {
  return axios.get(`/instalaciones/tipo/Engorda/${pathSegment(granja)}`);
}

export function listLotes(granja) {
  return axios.get(`/piletas/inventario/${pathSegment(granja)}`);
}

export function listEngordas(granja) {
  return axios.get(`/engorda/granja/${pathSegment(granja)}`);
}

export function listMovimientos(usuarioId) {
  return axios.get(`/engorda/movimientos/${usuarioId}`);
}

export function createEngorda(data) {
  return axios.post("/engorda", data);
}

export function removeEngorda(id) {
  return axios.delete(`/engorda/${id}`);
}

export function removeMovimiento(id) {
  return axios.delete(`/engorda/movimientos/${id}`);
}
