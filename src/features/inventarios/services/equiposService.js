import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listEmpleadosEquipos() {
  return axios.get(ENDPOINTS.equipos.empleados);
}

export function listEquipos(usuarioId) {
  return axios.get(ENDPOINTS.equipos.byUsuario(usuarioId));
}

export function createEquipo(data) {
  return axios.post(ENDPOINTS.equipos.base, data);
}

export function updateEquipo(id, data) {
  return axios.put(ENDPOINTS.equipos.byId(id), data);
}

export function listMantenimientos(equipoId) {
  return axios.get(ENDPOINTS.equipos.mantenimientos(equipoId));
}

export function createMantenimiento(equipoId, data) {
  return axios.post(ENDPOINTS.equipos.mantenimientos(equipoId), data);
}

export function updateMantenimiento(mantenimientoId, data) {
  return axios.put(ENDPOINTS.equipos.mantenimientoById(mantenimientoId), data);
}
