import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

/** Familia del circuito reproductivo: `id` es **pileta** etapa reproductores (ruta legacy). */
export function getFamiliaPorInstalacion(piletaId) {
  return axios.get(ENDPOINTS.lotes.familiaPorInstalacion(piletaId));
}

function normalizarFiltrosUbicacion(filtros) {
  const obj =
    typeof filtros === "object" && filtros != null
      ? filtros
      : { granja: filtros ?? "" };
  const granjaPath = String(obj.granja ?? obj.nombre ?? "").trim();
  const params = {};
  filtrosUbicacionAParams(params, obj);
  return { obj, granjaPath, params };
}

/** Piletas etapa reproductores para Lotes. Igual que `/piletas`: envía `ubicacion_id` si existe en el objeto de sede. */
export function listInstalaciones(filtros) {
  const { granjaPath, params } = normalizarFiltrosUbicacion(filtros);
  return axios.get(ENDPOINTS.lotes.instalacionesReproductores(granjaPath), {
    params,
  });
}

export function listLotes(filtros) {
  const { granjaPath, params } = normalizarFiltrosUbicacion(filtros);
  return axios.get(ENDPOINTS.lotes.byGranja(granjaPath), { params });
}

export function createLote(data) {
  return axios.post(ENDPOINTS.lotes.base, data);
}

export function updateLote(id, data) {
  return axios.put(ENDPOINTS.lotes.byId(id), data);
}

export function removeLote(id) {
  return axios.delete(ENDPOINTS.lotes.byId(id));
}
