import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listVacaciones() {
  return axios.get(ENDPOINTS.vacaciones.base);
}

export function createVacaciones(data) {
  return axios.post(ENDPOINTS.vacaciones.base, data);
}

export function updateVacaciones(id, data) {
  return axios.put(ENDPOINTS.vacaciones.byId(id), data);
}
