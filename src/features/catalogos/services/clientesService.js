import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listClientes() {
  return axios.get(ENDPOINTS.clientes.base);
}

export function listEmpleadosActivosClientes() {
  return axios.get(ENDPOINTS.clientes.empleadosActivos);
}

export function createCliente(data) {
  return axios.post(ENDPOINTS.clientes.base, data);
}

export function updateCliente(id, data) {
  return axios.put(ENDPOINTS.clientes.byId(id), data);
}

export function deactivateCliente(id) {
  return axios.patch(ENDPOINTS.clientes.deactivate(id));
}

export function activateCliente(id) {
  return axios.patch(ENDPOINTS.clientes.activate(id));
}
