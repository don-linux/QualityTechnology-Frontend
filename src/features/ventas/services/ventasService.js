import axios from "@shared/lib/axiosInstance";

export function listVentas() {
  return axios.get("/ventas");
}

export function listClientes() {
  return axios.get("/ventas/clientes");
}

export function listEncargados(empresa) {
  return axios.get(`/ventas/encargados/${empresa}`);
}

export function createVenta(payload) {
  return axios.post("/ventas", payload);
}

export function updateVenta(id, payload) {
  return axios.put(`/ventas/${id}`, payload);
}

export function removeVenta(id) {
  return axios.delete(`/ventas/${id}`);
}
