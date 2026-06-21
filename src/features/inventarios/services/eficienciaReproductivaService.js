import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** Eficiencia reproductiva (desove e ingreso a pileta de incubación). */
export function listEficienciaReproductiva(filtroUbicacion, piletaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  if (opciones.historial) params.historial = true;
  return axios.get(ENDPOINTS.eficienciaReproductiva.base, { params });
}

export function createEficienciaReproductiva(data) {
  return axios.post(ENDPOINTS.eficienciaReproductiva.base, data);
}

export function updateEficienciaReproductiva(id, data) {
  return axios.put(ENDPOINTS.eficienciaReproductiva.byId(id), data);
}

export function removeEficienciaReproductiva(id) {
  return axios.delete(ENDPOINTS.eficienciaReproductiva.byId(id));
}
