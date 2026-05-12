import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listMovimientos(granja) {
  return axios.get(ENDPOINTS.flujoCaja.byGranja(granja));
}

export function createMovimiento(data) {
  return axios.post(ENDPOINTS.flujoCaja.base, data);
}

export function updateMovimiento(id, data) {
  return axios.put(ENDPOINTS.flujoCaja.byId(id), data);
}

export function removeMovimiento(id) {
  return axios.delete(ENDPOINTS.flujoCaja.byId(id));
}

export function listClientesFlujo() {
  return axios.get(ENDPOINTS.flujoCaja.clientes);
}

export function listProveedoresFlujo() {
  return axios.get(ENDPOINTS.flujoCaja.proveedores);
}
