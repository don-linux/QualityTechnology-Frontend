import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listFaunasDetectadas() {
  return axios.get(ENDPOINTS.faunasDetectadas.base);
}

export function listFaunasDetectadasActivos() {
  return axios.get(ENDPOINTS.faunasDetectadas.activos);
}

export function createFaunaDetectada(nombre) {
  return axios.post(ENDPOINTS.faunasDetectadas.base, { nombre });
}

export function updateFaunaDetectada(id, nombre) {
  return axios.put(ENDPOINTS.faunasDetectadas.byId(id), { nombre });
}

export function activateFaunaDetectada(id) {
  return axios.patch(ENDPOINTS.faunasDetectadas.activate(id));
}

export function deactivateFaunaDetectada(id) {
  return axios.patch(ENDPOINTS.faunasDetectadas.deactivate(id));
}
