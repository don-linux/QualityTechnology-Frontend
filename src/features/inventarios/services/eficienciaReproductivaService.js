import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./infraestructuraFisicaService";

/** Eficiencia reproductiva (desove e ingreso a infraestructura física de incubación). */
export function listEficienciaReproductiva(filtroUbicacion, infraestructuraFisicaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (infraestructuraFisicaId) params.infraestructura_fisica_id = infraestructuraFisicaId;
  if (opciones.historial) params.historial = true;
  return axios.get(ENDPOINTS.eficienciaReproductiva.base, { params });
}

export function createEficienciaReproductiva(data) {
  return axios.post(ENDPOINTS.eficienciaReproductiva.base, data);
}

export function updateEficienciaReproductiva(id, data) {
  return axios.put(ENDPOINTS.eficienciaReproductiva.byId(id), data);
}
