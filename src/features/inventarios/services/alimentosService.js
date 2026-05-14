import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { listPiletas as listPiletasFisicas } from "./piletasService";
import { listByGranja as listReproductoresApi } from "./reproductoresService";
import { listEngordas as listEngordaApi } from "./engordaService";

export function listAlimentos() {
  return axios.get(ENDPOINTS.alimentos.base);
}

export function createAlimento(data) {
  return axios.post(ENDPOINTS.alimentos.base, data);
}

export function removeAlimento(id) {
  return axios.delete(ENDPOINTS.alimentos.byId(id));
}

export function listReproductoresByGranja(filtroUbicacion) {
  return listReproductoresApi(filtroUbicacion);
}

export function listPiletasByGranja(filtroUbicacion) {
  return listPiletasFisicas(filtroUbicacion);
}

export function listEngordaByGranja(filtroUbicacion) {
  return listEngordaApi(filtroUbicacion);
}
