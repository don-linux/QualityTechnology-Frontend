import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

export function listCiclosEngorda(filtroUbicacion, opciones = {}) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (opciones.estado) params.estado = opciones.estado;
  return axios.get(ENDPOINTS.ciclosEngorda.base, {
    params: Object.keys(params).length ? params : undefined,
  });
}

export function getCicloEngorda(id) {
  return axios.get(ENDPOINTS.ciclosEngorda.byId(id));
}

export function getCicloEngordaDashboard(id) {
  return axios.get(ENDPOINTS.ciclosEngorda.dashboard(id));
}
