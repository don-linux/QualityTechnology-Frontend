import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./infraestructuraFisicaService";

/**
 * `@param filtros` objeto `{ granja?, ubicacion_id? }`, o legado: string nombre sede.
 * El backend filtra por `ubicacion_id` cuando existe (mismo criterio que infraestructurasFisicas).
 */
export function listMovimientos(filtroUbicacion) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  const granja =
    typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  return axios.get(ENDPOINTS.trazabilidad.movimientos(granja || "sede"), { params });
}

export function createMovimiento(data) {
  return axios.post(ENDPOINTS.trazabilidad.movimientosBase, data);
}
