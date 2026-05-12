import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listByGranja(granja) {
  return axios.get(ENDPOINTS.instalaciones.byGranja(granja));
}

export function listByTipo(tipo, granja) {
  return axios.get(ENDPOINTS.instalaciones.byTipo(tipo, granja));
}

export function createInstalacion(data) {
  return axios.post(ENDPOINTS.instalaciones.base, data);
}

export function updateInstalacion(id, data) {
  return axios.put(ENDPOINTS.instalaciones.byId(id), data);
}

export function removeInstalacion(id) {
  return axios.delete(ENDPOINTS.instalaciones.byId(id));
}
