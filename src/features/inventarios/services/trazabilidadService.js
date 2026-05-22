import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

export function listMovimientos(filtroUbicacion) {
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = ENDPOINTS.trazabilidad.movimientos(nombre);
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  return axios.get(base, {
    params: Object.keys(params).length ? params : undefined,
  });
}

export function createMovimiento(data) {
  return axios.post(ENDPOINTS.trazabilidad.movimientosBase, data);
}
