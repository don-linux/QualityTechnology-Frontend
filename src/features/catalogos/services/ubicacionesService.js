import axios from "@shared/lib/axiosInstance";

export function listUbicaciones() {
  return axios.get("/ubicaciones");
}

export function listUbicacionesActivas() {
  return axios.get("/ubicaciones/activos");
}

export function getUbicacion(id) {
  return axios.get(`/ubicaciones/${id}`);
}

export function createUbicacion({ nombre, direccion, descripcion }) {
  return axios.post("/ubicaciones", { nombre, direccion, descripcion });
}

export function updateUbicacion(id, { nombre, direccion, descripcion }) {
  return axios.put(`/ubicaciones/${id}`, { nombre, direccion, descripcion });
}

export function activateUbicacion(id) {
  return axios.patch(`/ubicaciones/${id}/activate`);
}

export function deactivateUbicacion(id) {
  return axios.patch(`/ubicaciones/${id}/deactivate`);
}
