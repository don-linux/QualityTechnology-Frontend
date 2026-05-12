import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listVentas() {
  return axios.get(ENDPOINTS.ventas.base);
}

export function listClientes() {
  return axios.get(ENDPOINTS.ventas.clientes);
}

export function listEncargados(empresa) {
  return axios.get(ENDPOINTS.ventas.encargados(empresa));
}

export function createVenta(payload) {
  return axios.post(ENDPOINTS.ventas.base, payload);
}

export function updateVenta(id, payload) {
  return axios.put(ENDPOINTS.ventas.byId(id), payload);
}

export function removeVenta(id) {
  return axios.delete(ENDPOINTS.ventas.byId(id));
}
