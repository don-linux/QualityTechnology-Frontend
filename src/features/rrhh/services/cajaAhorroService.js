import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listByGranja(granja) {
  return axios.get(ENDPOINTS.cajaAhorro.byGranja(granja));
}

export function createCategoria(data) {
  return axios.post(ENDPOINTS.cajaAhorro.base, data);
}

export function updateCampo(id, data) {
  return axios.put(ENDPOINTS.cajaAhorro.byId(id), data);
}
