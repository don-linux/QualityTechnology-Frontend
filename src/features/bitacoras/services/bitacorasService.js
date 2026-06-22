import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

const B = ENDPOINTS.bitacoras;

/* =====================================================
   Fauna Nociva
===================================================== */
export function listEmpleadosFaunaNociva() {
  return axios.get(B.faunaNociva.empleados);
}
export function listFaunaNociva(ubicacion) {
  return axios.get(B.faunaNociva.base, { params: { ubicacion } });
}
export function createFaunaNociva(data) {
  return axios.post(B.faunaNociva.base, data);
}
export function updateFaunaNociva(id, data) {
  return axios.put(B.faunaNociva.byId(id), data);
}
export function removeFaunaNociva(id) {
  return axios.delete(B.faunaNociva.byId(id));
}
export function removeAllFaunaNociva(ubicacion) {
  return axios.delete(B.faunaNociva.base, { params: { ubicacion } });
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
   Visitas
===================================================== */
export function listVisitas(ubicacion, filtro) {
  return axios.get(B.visitas.base, { params: { ubicacion, filtro } });
}
export function createVisita(formData) {
  return axios.post(B.visitas.base, formData);
}
export function updateVisita(id, formData) {
  return axios.put(B.visitas.byId(id), formData);
}
export function removeVisita(id) {
  return axios.delete(B.visitas.byId(id));
}
export function removeAllVisitas() {
  return axios.delete(B.visitas.base);
}

/* =====================================================
   Baños
===================================================== */
export function listBanos() {
  return axios.get(B.banos.base);
}
export function listEmpleadosBanos() {
  return axios.get(B.banos.empleados);
}
export function createBano(data) {
  return axios.post(B.banos.base, data);
}
export function updateBano(id, data) {
  return axios.put(B.banos.byId(id), data);
}
export function removeBano(id) {
  return axios.delete(B.banos.byId(id));
}
export function removeAllBanos() {
  return axios.delete(B.banos.base);
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
