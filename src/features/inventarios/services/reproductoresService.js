import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "./piletasService";

export function listByGranja(filtroUbicacion) {
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = ENDPOINTS.reproductores.byGranja(nombre);
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  return axios.get(base, {
    params: Object.keys(params).length ? params : undefined,
  });
}

export function createReproductor(data) {
  return axios.post(ENDPOINTS.reproductores.base, data);
}

export function updateReproductor(id, data) {
  return axios.put(ENDPOINTS.reproductores.byId(id), data);
}

export function removeReproductor(id) {
  return axios.delete(ENDPOINTS.reproductores.byId(id));
}
