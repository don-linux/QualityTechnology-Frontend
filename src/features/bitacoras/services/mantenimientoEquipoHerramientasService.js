import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listMantenimientoEquipoHerramientas() {
  return axios.get(ENDPOINTS.bitacoras.mantenimientoEquipoHerramientas.base);
}

export function createMantenimientoEquipoHerramientas(data) {
  return axios.post(ENDPOINTS.bitacoras.mantenimientoEquipoHerramientas.base, data);
}

export function updateMantenimientoEquipoHerramientas(id, data) {
  return axios.put(ENDPOINTS.bitacoras.mantenimientoEquipoHerramientas.byId(id), data);
}
