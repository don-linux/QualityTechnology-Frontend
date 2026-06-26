import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./infraestructuraFisicaService";

/**
 * Registros periódicos del modelo `reproductores` (historial en BD).
 * GET devuelve por defecto la vista actual (último registro por infraestructura física);
 * use `?historial=true` para todos los registros.
 */

export function listReproductores(filtroUbicacion, infraestructuraFisicaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (infraestructuraFisicaId) params.infraestructura_fisica_id = infraestructuraFisicaId;
  if (opciones.historial) params.historial = true;
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = nombre ? ENDPOINTS.reproductores.byGranja(nombre) : ENDPOINTS.reproductores.base;
  return axios.get(base, { params: Object.keys(params).length ? params : undefined });
}

/** @deprecated Use listReproductores */
export function listByGranja(filtroUbicacion) {
  return listReproductores(filtroUbicacion);
}

export function createReproductor(data) {
  return axios.post(ENDPOINTS.reproductores.base, data);
}

export function updateReproductor(id, data) {
  return axios.put(ENDPOINTS.reproductores.byId(id), data);
}
