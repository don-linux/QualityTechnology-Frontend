import axios from "@shared/lib/axiosInstance";

export function listInstalacionesEngorda(granja) {
  return axios.get(`/instalaciones/tipo/Engorda/${granja}`);
}

export function listLotes(granja) {
  return axios.get(`/piletas/inventario/${granja}`);
}

export function listEngordas(granja) {
  return axios.get(`/engorda/granja/${granja}`);
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
