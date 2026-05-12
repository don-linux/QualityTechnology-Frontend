import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listByGranja(granja) {
  return axios.get(ENDPOINTS.reproductores.byGranja(granja));
}

export function getInstalaciones(granja) {
  return axios.get(ENDPOINTS.reproductores.instalaciones(granja));
}

export function getMovimientos(granja) {
  return axios.get(ENDPOINTS.reproductores.movimientos(granja));
}

export function createReproductor(data) {
  return axios.post(ENDPOINTS.reproductores.base, data);
}

export function updateReproductor(id, data) {
  return axios.put(ENDPOINTS.reproductores.byId(id), data);
}

export function removeReproductor(id) {
  return axios.delete(ENDPOINTS.reproductores.byId(id));
}
