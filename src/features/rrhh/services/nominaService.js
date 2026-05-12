import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listNomina() {
  return axios.get(ENDPOINTS.nomina.base);
}

export function createNomina(data) {
  return axios.post(ENDPOINTS.nomina.base, data);
}

export function updateNomina(id, data) {
  return axios.put(ENDPOINTS.nomina.byId(id), data);
}

export function removeNomina(id) {
  return axios.delete(ENDPOINTS.nomina.byId(id));
}

export function buscarNomina(params) {
  return axios.get(ENDPOINTS.nomina.base, { params });
}
