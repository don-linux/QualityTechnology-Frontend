import axios from "@shared/lib/axiosInstance";
import { API_URL } from "@shared/lib/config";

export function listMovimientos(granja) {
  return axios.get(`${API_URL}/flujo-caja/${granja}`);
}

export function createMovimiento(data) {
  return axios.post(`${API_URL}/flujo-caja`, data);
}

export function updateMovimiento(id, data) {
  return axios.put(`${API_URL}/flujo-caja/${id}`, data);
}

export function removeMovimiento(id) {
  return axios.delete(`${API_URL}/flujo-caja/${id}`);
}

export function listClientesFlujo() {
  return axios.get(`${API_URL}/flujo-caja/clientes`);
}

export function listProveedoresFlujo() {
  return axios.get(`${API_URL}/flujo-caja/proveedores`);
}

export function listCuentas() {
  return axios.get(`${API_URL}/cuentas`);
}

export function createCuenta(data) {
  return axios.post(`${API_URL}/cuentas`, data);
}

export function updateCuenta(id, data) {
  return axios.put(`${API_URL}/cuentas/${id}`, data);
}

export function removeCuenta(id) {
  return axios.delete(`${API_URL}/cuentas/${id}`);
}
