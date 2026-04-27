import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function getInventario(granja) {
  return axios.get(`/piletas/inventario/${pathSegment(granja)}`);
}

export function getLotes(granja) {
  return axios.get(`/piletas/lotes/${pathSegment(granja)}`);
}

export function getDestinos(granja) {
  return axios.get(`/piletas/destino/${pathSegment(granja)}`);
}

export function getOrigenes(granja) {
  return axios.get(`/piletas/origen/${pathSegment(granja)}`);
}

export function getMovimientos(usuarioId, granja) {
  return axios.get(`/piletas/movimientos/${usuarioId}/${pathSegment(granja)}`);
}

export function registrarMovimiento(data) {
  return axios.post("/piletas/movimientos/registrar", data);
}

export function registrarSiembra(data) {
  return axios.post("/piletas/siembra", data);
}

export function removePileta(id) {
  return axios.delete(`/piletas/${id}`);
}

export function filtrarMovimientos(usuarioId, granja, params) {
  return axios.get(`/piletas/movimientos/filtro/${usuarioId}/${pathSegment(granja)}?${params}`);
}

export function eliminarMovimiento(movimientoId) {
  return axios.delete("/piletas/movimientos/eliminar", { data: { movimiento_id: movimientoId } });
}

export function eliminarTodosMovimientos(granja) {
  return axios.delete("/piletas/movimientos/eliminar", { data: { eliminar_todos: true, granja } });
}
