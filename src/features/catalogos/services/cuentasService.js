import axios from "@shared/lib/axiosInstance";

export function listCuentas() {
  return axios.get("/cuentas");
}

export function listCuentasActivas() {
  return axios.get("/cuentas/activos");
}

export function createCuenta(data) {
  return axios.post("/cuentas", data);
}

export function updateCuenta(id, data) {
  return axios.put(`/cuentas/${id}`, data);
}

export function activateCuenta(id) {
  return axios.patch(`/cuentas/${id}/activate`);
}

export function deactivateCuenta(id) {
  return axios.patch(`/cuentas/${id}/deactivate`);
}
