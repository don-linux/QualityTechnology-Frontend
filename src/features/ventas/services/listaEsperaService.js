import axios from "@shared/lib/axiosInstance";
import { API_URL } from "@shared/lib/config";

export function listLista() {
  return axios.get(`${API_URL}/lista-espera`);
}

export function listClientes() {
  return axios.get(`${API_URL}/clientes`);
}

export function createRegistro(form) {
  return axios.post(`${API_URL}/lista-espera`, form);
}

export function updateRegistro(id, form) {
  return axios.put(`${API_URL}/lista-espera/${id}`, form);
}

export function removeRegistro(id) {
  return axios.delete(`${API_URL}/lista-espera/${id}`);
}

export function convertirAVenta(id) {
  return axios.post(`${API_URL}/lista-espera/convertir/${id}`);
}

export function createClienteRapido(data) {
  return axios.post(`${API_URL}/clientes`, data);
}
