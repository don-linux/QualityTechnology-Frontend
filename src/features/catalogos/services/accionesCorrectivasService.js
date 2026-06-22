import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listAccionesCorrectivas() {
  return axios.get(ENDPOINTS.accionesCorrectivas.base);
}

export function listAccionesCorrectivasActivos() {
  return axios.get(ENDPOINTS.accionesCorrectivas.activos);
}

export function createAccionCorrectiva(nombre) {
  return axios.post(ENDPOINTS.accionesCorrectivas.base, { nombre });
}

export function updateAccionCorrectiva(id, nombre) {
  return axios.put(ENDPOINTS.accionesCorrectivas.byId(id), { nombre });
}

export function activateAccionCorrectiva(id) {
  return axios.patch(ENDPOINTS.accionesCorrectivas.activate(id));
}

export function deactivateAccionCorrectiva(id) {
  return axios.patch(ENDPOINTS.accionesCorrectivas.deactivate(id));
}
