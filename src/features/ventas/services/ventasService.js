import axios from "@shared/lib/axiosInstance";
import { API_URL } from "@shared/lib/config";

const base = `${API_URL}/ventas`;

export function listVentas() {
  return axios.get(base);
}

export function listClientes() {
  return axios.get(`${base}/clientes`);
}

export function listEncargados(empresa) {
  return axios.get(`${base}/encargados/${empresa}`);
}

export function createVenta(payload) {
  return axios.post(base, payload);
}

export function updateVenta(id, payload) {
  return axios.put(`${base}/${id}`, payload);
}

export function removeVenta(id) {
  return axios.delete(`${base}/${id}`);
}
