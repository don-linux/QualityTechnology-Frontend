import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listUnidadesNegocio() {
  return axios.get(ENDPOINTS.unidadesNegocio.base);
}

export function listUnidadesNegocioActivas() {
  return axios.get(ENDPOINTS.unidadesNegocio.activos);
}

export function createUnidadNegocio(fc_nombre) {
  return axios.post(ENDPOINTS.unidadesNegocio.base, { fc_nombre });
}

export function updateUnidadNegocio(id, fc_nombre) {
  return axios.put(ENDPOINTS.unidadesNegocio.byId(id), { fc_nombre });
}

export function activateUnidadNegocio(id) {
  return axios.patch(ENDPOINTS.unidadesNegocio.activate(id));
}

export function deactivateUnidadNegocio(id) {
  return axios.patch(ENDPOINTS.unidadesNegocio.deactivate(id));
}
