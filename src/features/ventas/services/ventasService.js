import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listVentas() {
  return axios.get(ENDPOINTS.ventas.base);
}

export function listPagosVenta(id) {
  return axios.get(ENDPOINTS.ventas.pagos(id));
}

export function registrarPagoVenta(id, data) {
  return axios.post(ENDPOINTS.ventas.pagos(id), data);
}

export function anularPagoVenta(id, movId) {
  return axios.delete(ENDPOINTS.ventas.anularPago(id, movId));
}

export function getTablaAlimentacionVenta(id) {
  return axios.get(ENDPOINTS.ventas.tablaAlimentacion(id));
}
