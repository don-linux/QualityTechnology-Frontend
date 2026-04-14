import axios from "@shared/lib/axiosInstance";

export function listMovimientos(granja) {
  return axios.get(`/flujo-caja/${granja}`);
}

export function createMovimiento(data) {
  return axios.post("/flujo-caja", data);
}

export function updateMovimiento(id, data) {
  return axios.put(`/flujo-caja/${id}`, data);
}

export function removeMovimiento(id) {
  return axios.delete(`/flujo-caja/${id}`);
}

export function listClientesFlujo() {
  return axios.get("/flujo-caja/clientes");
}

export function listProveedoresFlujo() {
  return axios.get("/flujo-caja/proveedores");
}

export function listCuentas() {
  return axios.get("/cuentas");
}

export function createCuenta(data) {
  return axios.post("/cuentas", data);
}

export function updateCuenta(id, data) {
  return axios.put(`/cuentas/${id}`, data);
}

export function removeCuenta(id) {
  return axios.delete(`/cuentas/${id}`);
}

export function updateSaldo(id, data) {
  return axios.put(`/cuentas/actualizar-saldo/${id}`, data);
}
