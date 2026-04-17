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
