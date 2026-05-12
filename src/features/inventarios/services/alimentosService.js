import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listAlimentos() {
  return axios.get(ENDPOINTS.alimentos.base);
}

export function createAlimento(data) {
  return axios.post(ENDPOINTS.alimentos.base, data);
}

export function removeAlimento(id) {
  return axios.delete(ENDPOINTS.alimentos.byId(id));
}

export function listReproductoresByGranja(granja) {
  return axios.get(ENDPOINTS.reproductores.byGranja(granja));
}

export function listPiletasByGranja(granja) {
  return axios.get(ENDPOINTS.piletas.inventario(granja));
}

export function listEngordaByGranja(granja) {
  return axios.get(ENDPOINTS.engorda.byGranja(granja));
}
