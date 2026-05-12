import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listPuestos() {
  return axios.get(ENDPOINTS.puestos.base);
}

export function createPuesto(fc_nombre) {
  return axios.post(ENDPOINTS.puestos.base, { fc_nombre });
}

export function updatePuesto(id, fc_nombre) {
  return axios.put(ENDPOINTS.puestos.byId(id), { fc_nombre });
}

export function activatePuesto(id) {
  return axios.patch(ENDPOINTS.puestos.activate(id));
}

export function deactivatePuesto(id) {
  return axios.patch(ENDPOINTS.puestos.deactivate(id));
}
