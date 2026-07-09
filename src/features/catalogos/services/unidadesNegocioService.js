import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listUnidadesNegocio() {
  return axios.get(ENDPOINTS.unidadesNegocio.base);
}

export function listUnidadesNegocioActivas() {
  return axios.get(ENDPOINTS.unidadesNegocio.activos);
}

export function createUnidadNegocio(nombre, ubicacionId) {
  return axios.post(ENDPOINTS.unidadesNegocio.base, {
    nombre,
    ubicacion_id: ubicacionId,
  });
}

export function updateUnidadNegocio(id, nombre, ubicacionId) {
  return axios.put(ENDPOINTS.unidadesNegocio.byId(id), {
    nombre,
    ubicacion_id: ubicacionId,
  });
}

export function activateUnidadNegocio(id) {
  return axios.patch(ENDPOINTS.unidadesNegocio.activate(id));
}

export function deactivateUnidadNegocio(id) {
  return axios.patch(ENDPOINTS.unidadesNegocio.deactivate(id));
}
