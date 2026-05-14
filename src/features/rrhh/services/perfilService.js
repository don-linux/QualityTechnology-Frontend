import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function getPerfil() {
  return axios.get(ENDPOINTS.empleados.miPerfil);
}

export function updatePerfil(data) {
  return axios.put(ENDPOINTS.empleados.miPerfil, data);
}
