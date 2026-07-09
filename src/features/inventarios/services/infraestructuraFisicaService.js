import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

/**
 * `@param filtros` objeto `{ granja?, ubicacion_id? }`, o legado: string nombre sede.
 * El backend usa `ubicacion_id` cuando existe (FK tabla `ubicacion`).
 */
export function filtrosUbicacionAParams(params, filtros) {
  if (filtros == null || filtros === "") return;
  if (typeof filtros === "object") {
    if (filtros.ubicacion_id != null && filtros.ubicacion_id !== "") {
      params.ubicacion_id = filtros.ubicacion_id;
    }
    const g = filtros.granja ?? filtros.nombre;
    if (g) params.granja = g;
    return;
  }
  params.granja = filtros;
}

export function listInfraestructuraFisica(filtroUbicacion, tipo) {
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  if (tipo) params.tipo = tipo;
  return axios.get(ENDPOINTS.infraestructuraFisica.base, { params });
}

export function createInfraestructuraFisica(data) {
  return axios.post(ENDPOINTS.infraestructuraFisica.base, data);
}

export function updateInfraestructuraFisica(id, data) {
  return axios.put(ENDPOINTS.infraestructuraFisica.byId(id), data);
}

/**
 * Historial completo de `observacion` para una infraestructura física (todos los procesos y bitácoras vinculadas).
 * @param {number|string} infraestructuraFisicaId
 * @param {string[]} [procesos] Filtro opcional; si se omite, devuelve todas las vinculadas a la infraestructura física.
 */
export function listObservacionesInfraestructuraFisica(infraestructuraFisicaId, procesos) {
  const params = {};
  if (procesos?.length) params.proceso = procesos.join(",");
  return axios.get(ENDPOINTS.infraestructuraFisica.observaciones(infraestructuraFisicaId), { params });
}
