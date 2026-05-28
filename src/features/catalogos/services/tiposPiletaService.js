import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listTiposPileta() {
  return axios.get(ENDPOINTS.tiposPileta.base);
}

export function listTiposPiletaActivos() {
  return axios.get(ENDPOINTS.tiposPileta.activos);
}

export function createTipoPileta(nombre) {
  return axios.post(ENDPOINTS.tiposPileta.base, { nombre });
}

export function updateTipoPileta(id, nombre) {
  return axios.put(ENDPOINTS.tiposPileta.byId(id), { nombre });
}

export function activateTipoPileta(id) {
  return axios.patch(ENDPOINTS.tiposPileta.activate(id));
}

export function deactivateTipoPileta(id) {
  return axios.patch(ENDPOINTS.tiposPileta.deactivate(id));
}
