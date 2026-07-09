import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./infraestructuraFisicaService";

/**
 * Registros periódicos del modelo `alevinaje` (historial en BD).
 * GET devuelve por defecto la vista actual (último registro por infraestructura física);
 * use `?historial=true` para todos los registros.
 */

export function listAlevinaje(filtroUbicacion, infraestructuraFisicaId, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (infraestructuraFisicaId) params.infraestructura_fisica_id = infraestructuraFisicaId;
  if (opciones.historial) params.historial = true;
  return axios.get(ENDPOINTS.alevinaje.base, { params });
}

/** Todos los registros periódicos de una infraestructura física. */
export function listAlevinajeHistorialInfraestructuraFisica(infraestructuraFisicaId, filtroUbicacion) {
  return listAlevinaje(filtroUbicacion, infraestructuraFisicaId, { historial: true });
}

export function createAlevinaje(data) {
  return axios.post(ENDPOINTS.alevinaje.base, data);
}

export function updateAlevinaje(id, data) {
  return axios.put(ENDPOINTS.alevinaje.byId(id), data);
}
