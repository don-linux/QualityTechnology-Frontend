import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listCatalogoInsumos() {
  return axios.get(ENDPOINTS.catalogoInsumos.base);
}

export function listCatalogoInsumosActivos() {
  return axios.get(ENDPOINTS.catalogoInsumos.activos);
}

export function createCatalogoInsumo(data) {
  return axios.post(ENDPOINTS.catalogoInsumos.base, data);
}

export function updateCatalogoInsumo(id, data) {
  return axios.put(ENDPOINTS.catalogoInsumos.byId(id), data);
}

export function activateCatalogoInsumo(id) {
  return axios.patch(ENDPOINTS.catalogoInsumos.activate(id));
}

export function deactivateCatalogoInsumo(id) {
  return axios.patch(ENDPOINTS.catalogoInsumos.deactivate(id));
}
