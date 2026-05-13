import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listPuestos() {
  return axios.get(ENDPOINTS.puestos.base);
}

export function createPuesto(nombre) {
  return axios.post(ENDPOINTS.puestos.base, { nombre });
}

export function updatePuesto(id, nombre) {
  return axios.put(ENDPOINTS.puestos.byId(id), { nombre });
}

export function activatePuesto(id) {
  return axios.patch(ENDPOINTS.puestos.activate(id));
}

export function deactivatePuesto(id) {
  return axios.patch(ENDPOINTS.puestos.deactivate(id));
}
