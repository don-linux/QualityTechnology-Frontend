import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listHistorialPeso(infraestructuraFisicaId) {
  const params = {};
  if (infraestructuraFisicaId) params.infraestructura_fisica_id = infraestructuraFisicaId;
  return axios.get(ENDPOINTS.historialPeso.base, { params });
}

export function createHistorialPeso(data) {
  return axios.post(ENDPOINTS.historialPeso.base, data);
}
