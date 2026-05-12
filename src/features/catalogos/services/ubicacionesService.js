import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listUbicaciones() {
  return axios.get(ENDPOINTS.ubicaciones.base);
}

export function listUbicacionesActivas() {
  return axios.get(ENDPOINTS.ubicaciones.activos);
}

export function getUbicacion(id) {
  return axios.get(ENDPOINTS.ubicaciones.byId(id));
}

export function createUbicacion({ nombre, direccion, descripcion }) {
  return axios.post(ENDPOINTS.ubicaciones.base, { nombre, direccion, descripcion });
}

export function updateUbicacion(id, { nombre, direccion, descripcion }) {
  return axios.put(ENDPOINTS.ubicaciones.byId(id), { nombre, direccion, descripcion });
}

export function activateUbicacion(id) {
  return axios.patch(ENDPOINTS.ubicaciones.activate(id));
}

export function deactivateUbicacion(id) {
  return axios.patch(ENDPOINTS.ubicaciones.deactivate(id));
}
