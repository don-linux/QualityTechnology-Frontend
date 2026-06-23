import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { filtrosUbicacionAParams } from "@features/inventarios/services/piletasService";

/* ============================================================================
   Biometrías
============================================================================ */

export function listBiometrias() {
  return axios.get(ENDPOINTS.bitacoras.biometrias.base);
}

export function listBiometriasByGranja(filtroUbicacion) {
  const nombre =
    filtroUbicacion && typeof filtroUbicacion === "object"
      ? filtroUbicacion.granja ?? filtroUbicacion.nombre ?? ""
      : String(filtroUbicacion ?? "");
  const base = ENDPOINTS.bitacoras.biometrias.byGranja(nombre);
  const params = {};
  filtrosUbicacionAParams(params, filtroUbicacion);
  return axios.get(base, {
    params: Object.keys(params).length ? params : undefined,
  });
}

export function listEmpleadosBiometrias() {
  return axios.get(ENDPOINTS.bitacoras.biometrias.empleados);
}

export function createBiometria(data) {
  return axios.post(ENDPOINTS.bitacoras.biometrias.base, data);
}

export function updateBiometria(id, data) {
  return axios.put(ENDPOINTS.bitacoras.biometrias.byId(id), data);
}
