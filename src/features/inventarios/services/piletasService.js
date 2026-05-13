import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/* ============================================================================
   CRUD físico piletas (+ última observación si el backend la incluye)
============================================================================ */

export function listPiletas(granja) {
  const params = granja ? { params: { granja } } : {};
  return axios.get(ENDPOINTS.piletas.base, params);
}

/* ============================================================================
   Inventario / Lotes / Orígenes / Destinos
============================================================================ */

export function getInventario(granja) {
  return axios.get(ENDPOINTS.piletas.inventario(granja));
}

export function getLotes(granja) {
  return axios.get(ENDPOINTS.piletas.lotes(granja));
}

export function getOrigenes(granja) {
  return axios.get(ENDPOINTS.piletas.origen(granja));
}

export function getDestinos(granja) {
  return axios.get(ENDPOINTS.piletas.destino(granja));
}

export function getLotePorInstalacion(instalacionId, granja) {
  return axios.get(ENDPOINTS.piletas.lotePorInstalacion(instalacionId, granja));
}

/* ============================================================================
   Siembra (create / update via POST con `fi_pileta_id` opcional)
============================================================================ */

export function registrarSiembra(data) {
  return axios.post(ENDPOINTS.piletas.siembra, data);
}

export function removePileta(id) {
  return axios.delete(ENDPOINTS.piletas.byId(id));
}

/* ============================================================================
   Trazabilidad / Movimientos
============================================================================ */

export function getMovimientos(usuarioId, granja) {
  return axios.get(ENDPOINTS.piletas.movimientos(usuarioId, granja));
}

export function filtrarMovimientos(usuarioId, granja, queryString) {
  const url = ENDPOINTS.piletas.movimientosFiltro(usuarioId, granja);
  return axios.get(queryString ? `${url}?${queryString}` : url);
}

export function registrarMovimiento(data) {
  return axios.post(ENDPOINTS.piletas.registrarMovimiento, data);
}

export function eliminarMovimiento(id) {
  return axios.delete(ENDPOINTS.piletas.eliminarMovimientos, {
    data: { movimiento_id: id },
  });
}

export function eliminarTodosMovimientos(granja) {
  return axios.delete(ENDPOINTS.piletas.eliminarMovimientos, {
    data: { eliminar_todos: true, granja },
  });
}
