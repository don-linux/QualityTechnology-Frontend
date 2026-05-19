import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listTiposInstanciaPileta() {
  return axios.get(ENDPOINTS.tiposInstanciaPileta.base);
}

export function listTiposInstanciaPiletaActivos() {
  return axios.get(ENDPOINTS.tiposInstanciaPileta.activos);
}

export function createTipoInstanciaPileta(nombre) {
  return axios.post(ENDPOINTS.tiposInstanciaPileta.base, { nombre });
}

export function updateTipoInstanciaPileta(id, nombre) {
  return axios.put(ENDPOINTS.tiposInstanciaPileta.byId(id), { nombre });
}

export function activateTipoInstanciaPileta(id) {
  return axios.patch(ENDPOINTS.tiposInstanciaPileta.activate(id));
}

export function deactivateTipoInstanciaPileta(id) {
  return axios.patch(ENDPOINTS.tiposInstanciaPileta.deactivate(id));
}
