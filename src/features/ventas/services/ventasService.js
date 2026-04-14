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

export function createVenta(data) {
  return axios.post("/ventas", data);
}

export function updateVenta(id, data) {
  return axios.put(`/ventas/${id}`, data);
}

export function removeVenta(id) {
  return axios.delete(`/ventas/${id}`);
}
