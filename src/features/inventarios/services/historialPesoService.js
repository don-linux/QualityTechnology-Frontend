import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listHistorialPeso(piletaId) {
  const params = {};
  if (piletaId) params.pileta_id = piletaId;
  return axios.get(ENDPOINTS.historialPeso.base, { params });
}

export function createHistorialPeso(data) {
  return axios.post(ENDPOINTS.historialPeso.base, data);
}
