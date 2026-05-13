import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/** Siembras hacia piletas destino (p. ej. reproductores → alevinaje). */
export function listSiembras(params) {
  return axios.get(ENDPOINTS.siembras.base, { params });
}

export function getSiembra(id) {
  return axios.get(ENDPOINTS.siembras.byId(id));
}
