import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./infraestructuraFisicaService";

/**
 * Registros periódicos del modelo `engorda` (historial en BD).
 * GET devuelve por defecto la vista actual (último registro por infraestructura física);
 * use `?historial=true` para todos los registros.
 */

export function listEngordas(filtroUbicacion, infraestructuraFisicaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (infraestructuraFisicaId) params.infraestructura_fisica_id = infraestructuraFisicaId;
  if (opciones.historial) params.historial = true;
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = nombre ? ENDPOINTS.engorda.byGranja(nombre) : ENDPOINTS.engorda.base;
  return axios.get(base, { params: Object.keys(params).length ? params : undefined });
}

/** Todos los registros periódicos de una infraestructura física (incluye observaciones históricas). */
export function listEngordasHistorialInfraestructuraFisica(infraestructuraFisicaId, filtroUbicacion) {
  return listEngordas(filtroUbicacion, infraestructuraFisicaId, { historial: true });
}

export function createEngorda(data) {
  return axios.post(ENDPOINTS.engorda.base, data);
}

export function updateEngorda(id, data) {
  return axios.put(ENDPOINTS.engorda.byId(id), data);
}
