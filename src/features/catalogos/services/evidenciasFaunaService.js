import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEvidenciasFauna() {
  return axios.get(ENDPOINTS.evidenciasFauna.base);
}

export function listEvidenciasFaunaActivos() {
  return axios.get(ENDPOINTS.evidenciasFauna.activos);
}

export function createEvidenciaFauna(nombre) {
  return axios.post(ENDPOINTS.evidenciasFauna.base, { nombre });
}

export function updateEvidenciaFauna(id, nombre) {
  return axios.put(ENDPOINTS.evidenciasFauna.byId(id), { nombre });
}

export function activateEvidenciaFauna(id) {
  return axios.patch(ENDPOINTS.evidenciasFauna.activate(id));
}

export function deactivateEvidenciaFauna(id) {
  return axios.patch(ENDPOINTS.evidenciasFauna.deactivate(id));
}
