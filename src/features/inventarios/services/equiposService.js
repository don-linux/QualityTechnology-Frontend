import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEquipos(usuarioId) {
  return axios.get(ENDPOINTS.equipos.byUsuario(usuarioId));
}

export function createEquipo(data) {
  return axios.post(ENDPOINTS.equipos.base, data);
}

export function updateEquipo(id, data) {
  return axios.put(ENDPOINTS.equipos.byId(id), data);
}
