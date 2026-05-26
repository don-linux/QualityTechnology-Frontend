import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listMovimientos(granja) {
  return axios.get(ENDPOINTS.trazabilidad.movimientos(granja));
}

export function createMovimiento(data) {
  return axios.post(ENDPOINTS.trazabilidad.movimientosBase, data);
}
