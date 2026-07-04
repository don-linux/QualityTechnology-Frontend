import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

const B = ENDPOINTS.bitacoras;

/* =====================================================
   Control de Fauna Nociva
===================================================== */
export function listEmpleadosControlFaunaNociva() {
  return axios.get(B.controlFaunaNociva.empleados);
}
export function listControlFaunaNociva(ubicacion) {
  return axios.get(B.controlFaunaNociva.base, { params: { ubicacion } });
}
export function createControlFaunaNociva(data) {
  return axios.post(B.controlFaunaNociva.base, data);
}
export function updateControlFaunaNociva(id, data) {
  return axios.put(B.controlFaunaNociva.byId(id), data);
}

/* =====================================================
   Control de Visitas
===================================================== */
export function listControlVisitas(ubicacion, filtro) {
  return axios.get(B.controlVisitas.base, { params: { ubicacion, filtro } });
}
export function createControlVisita(formData) {
  return axios.post(B.controlVisitas.base, formData);
}
export function updateControlVisita(id, formData) {
  return axios.put(B.controlVisitas.byId(id), formData);
}

/* =====================================================
   Control de Limpieza
===================================================== */
export function listControlLimpieza() {
  return axios.get(B.controlLimpieza.base);
}
export function listEmpleadosControlLimpieza() {
  return axios.get(B.controlLimpieza.empleados);
}
export function createControlLimpieza(data) {
  return axios.post(B.controlLimpieza.base, data);
}
export function updateControlLimpieza(id, data) {
  return axios.put(B.controlLimpieza.byId(id), data);
}

/* =====================================================
   Parámetros Físico-Químicos
===================================================== */
export function listEmpleadosParametrosFisicoQuimicos() {
  return axios.get(B.parametrosFisicoQuimicos.empleados);
}
export function listParametrosFisicoQuimicos(ubicacion) {
  const params = ubicacion ? { ubicacion } : undefined;
  return axios.get(B.parametrosFisicoQuimicos.base, { params });
}
export function createParametrosFisicoQuimico(data) {
  return axios.post(B.parametrosFisicoQuimicos.base, data);
}
export function updateParametrosFisicoQuimico(id, data) {
  return axios.put(B.parametrosFisicoQuimicos.byId(id), data);
}

/* =====================================================
   Medicamentos
===================================================== */
export function listMedicamentos() {
  return axios.get(B.medicamentos.base);
}
export function createMedicamento(data) {
  return axios.post(B.medicamentos.base, data);
}
export function updateMedicamento(id, data) {
  return axios.put(B.medicamentos.byId(id), data);
}

/* =====================================================
   Limpieza y desinfección de instalaciones
===================================================== */
export function listEmpleadosLimpiezaInstalaciones() {
  return axios.get(B.limpiezaInstalaciones.empleados);
}
export function listLimpiezaInstalaciones() {
  return axios.get(B.limpiezaInstalaciones.base);
}
export function createLimpiezaInstalacion(data) {
  return axios.post(B.limpiezaInstalaciones.base, data);
}
export function updateLimpiezaInstalacion(id, data) {
  return axios.put(B.limpiezaInstalaciones.byId(id), data);
}

/* =====================================================
   Inventario de alevines
===================================================== */
export function listInventarioAlevines() {
  return axios.get(B.inventarioAlevines.base);
}
export function createInventarioAlevin(data) {
  return axios.post(B.inventarioAlevines.base, data);
}
export function updateInventarioAlevin(id, data) {
  return axios.put(B.inventarioAlevines.byId(id), data);
}
