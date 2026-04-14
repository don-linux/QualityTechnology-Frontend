import axios from "@shared/lib/axiosInstance";

export function listClientes() {
  return axios.get("/clientes");
}

export function createCliente(data) {
  return axios.post("/clientes", data);
}

export function updateCliente(id, data) {
  return axios.put(`/clientes/${id}`, data);
}

export function removeCliente(id) {
  return axios.delete(`/clientes/${id}`);
}
