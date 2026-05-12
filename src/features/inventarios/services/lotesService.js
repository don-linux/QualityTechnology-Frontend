import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function getFamiliaPorInstalacion(instalacionId) {
  return axios.get(ENDPOINTS.lotes.familiaPorInstalacion(instalacionId));
}

export function listInstalaciones(granja) {
  return axios.get(ENDPOINTS.lotes.instalacionesReproductores(granja));
}

export function listLotes(granja) {
  return axios.get(ENDPOINTS.lotes.byGranja(granja));
}

export function createLote(data) {
  return axios.post(ENDPOINTS.lotes.base, data);
}

export function updateLote(id, data) {
  return axios.put(ENDPOINTS.lotes.byId(id), data);
}

export function removeLote(id) {
  return axios.delete(ENDPOINTS.lotes.byId(id));
}
