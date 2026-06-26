import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listTiposInfraestructuraFisica() {
  return axios.get(ENDPOINTS.tiposInfraestructuraFisica.base);
}

export function listTiposInfraestructuraFisicaActivos() {
  return axios.get(ENDPOINTS.tiposInfraestructuraFisica.activos);
}

export function createTipoInfraestructuraFisica(nombre) {
  return axios.post(ENDPOINTS.tiposInfraestructuraFisica.base, { nombre });
}

export function updateTipoInfraestructuraFisica(id, nombre) {
  return axios.put(ENDPOINTS.tiposInfraestructuraFisica.byId(id), { nombre });
}

export function activateTipoInfraestructuraFisica(id) {
  return axios.patch(ENDPOINTS.tiposInfraestructuraFisica.activate(id));
}

export function deactivateTipoInfraestructuraFisica(id) {
  return axios.patch(ENDPOINTS.tiposInfraestructuraFisica.deactivate(id));
}
