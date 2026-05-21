import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

function normalizarFiltrosUbicacion(filtros) {
  const obj =
    typeof filtros === "object" && filtros != null ? filtros : { granja: filtros ?? "" };
  const granjaPath = String(obj.granja ?? obj.nombre ?? "").trim();
  const params = {};
  filtrosUbicacionAParams(params, obj);
  return { granjaPath, params };
}

/** CRUD del modelo `control_reproductivo` (camadas reproductivas / lotes). */

export function listControlReproductivo(filtroUbicacion, piletaId) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (piletaId) params.pileta_id = piletaId;
  return axios.get(ENDPOINTS.controlReproductivo.base, { params });
}

export function listReproductoresOcupadas(filtros) {
  const { granjaPath, params } = normalizarFiltrosUbicacion(filtros);
  return axios.get(ENDPOINTS.controlReproductivo.reproductoresOcupadas(granjaPath), {
    params: Object.keys(params).length ? params : undefined,
  });
}

export function getFamiliaPorPileta(piletaId) {
  return axios.get(ENDPOINTS.controlReproductivo.familiaPorPileta(piletaId));
}

export function createControlReproductivo(data) {
  return axios.post(ENDPOINTS.controlReproductivo.base, data);
}

export function updateControlReproductivo(id, data) {
  return axios.put(ENDPOINTS.controlReproductivo.byId(id), data);
}

export function removeControlReproductivo(id) {
  return axios.delete(ENDPOINTS.controlReproductivo.byId(id));
}
