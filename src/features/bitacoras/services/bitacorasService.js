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
export function removeControlFaunaNociva(id) {
  return axios.delete(B.controlFaunaNociva.byId(id));
}
export function removeAllControlFaunaNociva(ubicacion) {
  return axios.delete(B.controlFaunaNociva.base, { params: { ubicacion } });
}

/* =====================================================
   Recepción de Insumos
===================================================== */
export function listEmpleadosRecepcionInsumos() {
  return axios.get(B.recepcionInsumos.empleados);
}
export function listRecepcionInsumos(ubicacion) {
  return axios.get(B.recepcionInsumos.base, { params: { ubicacion } });
}
export function createRecepcionInsumo(data) {
  return axios.post(B.recepcionInsumos.base, data);
}
export function updateRecepcionInsumo(id, data) {
  return axios.put(B.recepcionInsumos.byId(id), data);
}
export function removeRecepcionInsumo(id) {
  return axios.delete(B.recepcionInsumos.byId(id));
}
export function removeAllRecepcionInsumos(ubicacion) {
  return axios.delete(B.recepcionInsumos.base, { params: { ubicacion } });
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
export function removeControlVisita(id) {
  return axios.delete(B.controlVisitas.byId(id));
}
export function removeAllControlVisitas() {
  return axios.delete(B.controlVisitas.base);
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
export function removeControlLimpieza(id) {
  return axios.delete(B.controlLimpieza.byId(id));
}
export function removeAllControlLimpieza() {
  return axios.delete(B.controlLimpieza.base);
}

/* =====================================================
   Parámetros
===================================================== */
export function listEmpleadosParametros() {
  return axios.get(B.parametros.empleados);
}
export function listParametros() {
  return axios.get(B.parametros.base);
}
export function createParametro(data) {
  return axios.post(B.parametros.base, data);
}
export function updateParametro(id, data) {
  return axios.put(B.parametros.byId(id), data);
}
export function removeParametro(id) {
  return axios.delete(B.parametros.byId(id));
}
export function removeAllParametros() {
  return axios.delete(B.parametros.base);
}

/* =====================================================
   Medicamentos
===================================================== */
export function listEmpleadosMedicamentos() {
  return axios.get(B.medicamentos.empleados);
}
export function listMedicamentos() {
  return axios.get(B.medicamentos.base);
}
export function createMedicamento(data) {
  return axios.post(B.medicamentos.base, data);
}
export function updateMedicamento(id, data) {
  return axios.put(B.medicamentos.byId(id), data);
}
export function removeMedicamento(id) {
  return axios.delete(B.medicamentos.byId(id));
}
export function removeAllMedicamentos() {
  return axios.delete(B.medicamentos.base);
}

/* =====================================================
   Recambios
===================================================== */
export function listEmpleadosRecambios() {
  return axios.get(B.recambios.empleados);
}
export function listRecambios() {
  return axios.get(B.recambios.base);
}
export function createRecambio(data) {
  return axios.post(B.recambios.base, data);
}
export function updateRecambio(id, data) {
  return axios.put(B.recambios.byId(id), data);
}
export function removeRecambio(id) {
  return axios.delete(B.recambios.byId(id));
}
export function removeAllRecambios() {
  return axios.delete(B.recambios.base);
}

/* =====================================================
   Inventario
===================================================== */
export function listInventario() {
  return axios.get(B.inventario.base);
}
export function createInventario(data) {
  return axios.post(B.inventario.base, data);
}
export function updateInventario(id, data) {
  return axios.put(B.inventario.byId(id), data);
}
export function removeInventario(id) {
  return axios.delete(B.inventario.byId(id));
}
export function removeAllInventario() {
  return axios.delete(B.inventario.base);
}
