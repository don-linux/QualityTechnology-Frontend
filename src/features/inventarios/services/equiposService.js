import axios from "@shared/lib/axiosInstance";

export function listEmpleadosEquipos() {
  return axios.get("/equipos/empleados");
}

export function listEquipos(usuarioId) {
  return axios.get(`/equipos/${usuarioId}`);
}

export function createEquipo(data) {
  return axios.post("/equipos", data);
}

export function updateEquipo(id, data) {
  return axios.put(`/equipos/${id}`, data);
}

export function removeEquipo(id) {
  return axios.delete(`/equipos/${id}`);
}

export function listMantenimientos(equipoId) {
  return axios.get(`/equipos/${equipoId}/mantenimientos`);
}

export function createMantenimiento(equipoId, data) {
  return axios.post(`/equipos/${equipoId}/mantenimientos`, data);
}

export function updateMantenimiento(mantenimientoId, data) {
  return axios.put(`/equipos/mantenimientos/${mantenimientoId}`, data);
}

export function removeMantenimiento(mantenimientoId) {
  return axios.delete(`/equipos/mantenimientos/${mantenimientoId}`);
}
