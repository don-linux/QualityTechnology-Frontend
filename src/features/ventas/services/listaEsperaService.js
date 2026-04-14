import axios from "@shared/lib/axiosInstance";

export function listLista() {
  return axios.get("/lista-espera");
}

export function listClientes() {
  return axios.get("/clientes");
}

export function createRegistro(data) {
  return axios.post("/lista-espera", data);
}

export function updateRegistro(id, data) {
  return axios.put(`/lista-espera/${id}`, data);
}

export function removeRegistro(id) {
  return axios.delete(`/lista-espera/${id}`);
}

export function convertirAVenta(id) {
  return axios.post(`/lista-espera/convertir/${id}`);
}

export function createClienteRapido(data) {
  return axios.post("/clientes", data);
}
