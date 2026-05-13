import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/**
 * @param {string|{ granja?, ubicacion_id? }} filtroUbicacion — igual que piletas/inventarios
 */
export function listByGranja(filtroUbicacion) {
  const granjaNombre =
    typeof filtroUbicacion === "string"
      ? filtroUbicacion
      : String(filtroUbicacion?.granja ?? filtroUbicacion?.fc_granja ?? "");

  const params = {};
  if (typeof filtroUbicacion === "object" && filtroUbicacion) {
    filtrosUbicacionAParams(params, filtroUbicacion);
  }

  const q = Object.keys(params).length ? { params } : undefined;
  return axios.get(ENDPOINTS.instalaciones.byGranja(granjaNombre), q);
}

export function listByTipo(tipo, filtroUbicacion) {
  const granjaNombre =
    typeof filtroUbicacion === "string"
      ? filtroUbicacion
      : String(filtroUbicacion?.granja ?? filtroUbicacion?.fc_granja ?? "");

  const params = {};
  if (typeof filtroUbicacion === "object" && filtroUbicacion) {
    filtrosUbicacionAParams(params, filtroUbicacion);
  }
  const q = Object.keys(params).length ? { params } : undefined;
  return axios.get(ENDPOINTS.instalaciones.byTipo(tipo, granjaNombre), q);
}

export function createInstalacion(data) {
  return axios.post(ENDPOINTS.instalaciones.base, data);
}

export function updateInstalacion(id, data) {
  return axios.put(ENDPOINTS.instalaciones.byId(id), data);
}

export function removeInstalacion(id) {
  return axios.delete(ENDPOINTS.instalaciones.byId(id));
}
