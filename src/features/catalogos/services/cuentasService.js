import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listCuentas() {
  return axios.get(ENDPOINTS.cuentas.base);
}

export function listCuentasActivas() {
  return axios.get(ENDPOINTS.cuentas.activos);
}

export function createCuenta(data) {
  return axios.post(ENDPOINTS.cuentas.base, data);
}

export function updateCuenta(id, data) {
  return axios.put(ENDPOINTS.cuentas.byId(id), data);
}

export function activateCuenta(id) {
  return axios.patch(ENDPOINTS.cuentas.activate(id));
}

export function deactivateCuenta(id) {
  return axios.patch(ENDPOINTS.cuentas.deactivate(id));
}
