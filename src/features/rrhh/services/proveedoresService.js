import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listProveedores() {
  return axios.get(ENDPOINTS.proveedores.base);
}

export function createProveedor(data) {
  return axios.post(ENDPOINTS.proveedores.base, data);
}

export function updateProveedor(id, data) {
  return axios.put(ENDPOINTS.proveedores.byId(id), data);
}

export function removeProveedor(id) {
  return axios.delete(ENDPOINTS.proveedores.byId(id));
}
