import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listLista() {
  return axios.get(ENDPOINTS.listaEspera.base);
}

export function listClientes() {
  return axios.get(ENDPOINTS.clientes.base);
}

export function createRegistro(form) {
  return axios.post(ENDPOINTS.listaEspera.base, form);
}

export function updateRegistro(id, form) {
  return axios.put(ENDPOINTS.listaEspera.byId(id), form);
}

export function cancelarRegistro(id) {
  return axios.delete(ENDPOINTS.listaEspera.byId(id));
}

export function convertirAVenta(id, data = {}) {
  return axios.post(ENDPOINTS.listaEspera.convertir(id), data);
}

export function createClienteRapido(data) {
  return axios.post(ENDPOINTS.clientes.base, data);
}
