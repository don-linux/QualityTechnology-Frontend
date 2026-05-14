import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/** Familia del circuito reproductivo: `id` es **pileta** etapa reproductores (ruta legacy). */
export function getFamiliaPorInstalacion(piletaId) {
  return axios.get(ENDPOINTS.lotes.familiaPorInstalacion(piletaId));
}

/** Piletas etapa reproductores para Lotes. GET `/lotes/instalaciones/:granja` (nombre de ruta heredado). */
export function listInstalaciones(granja) {
  return axios.get(ENDPOINTS.lotes.instalacionesReproductores(granja));
}

export function listLotes(granja) {
  return axios.get(ENDPOINTS.lotes.byGranja(granja));
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
