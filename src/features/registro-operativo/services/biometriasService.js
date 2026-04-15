import axios from "@shared/lib/axiosInstance";

// -- Biometrias --
export function listEmpleadosBiometrias() {
  return axios.get("/biometrias/empleados");
}
export function listBiometrias() {
  return axios.get("/biometrias");
}
export function getInstalaciones(granja) {
  return axios.get(`/instalaciones/granja/${granja}`);
}
export function getLotesByInstalacion(instalacionId) {
  return axios.get(`/lotes/instalacion/${instalacionId}`);
}
export function getInfoInstalacion(granjaParam, instalacionId) {
  return axios.get(`/biometrias/info/${granjaParam}/${instalacionId}`);
}
export function createBiometria(data) {
  return axios.post("/biometrias/", data);
}
export function updateBiometria(id, data) {
  return axios.put(`/biometrias/${id}`, data);
}
export function removeBiometria(id) {
  return axios.delete(`/biometrias/${id}`);
}

// -- Alimentacion --
export function listAlimentacion() {
  return axios.get("/alimentacion");
}
export function getOrigenes(granja) {
  return axios.get(`/piletas/origen/${granja}`);
}
export function createAlimentacion(data) {
  return axios.post("/alimentacion", data);
}
export function updateAlimentacion(id, data) {
  return axios.put(`/alimentacion/${id}`, data);
}
export function removeAlimentacion(id) {
  return axios.delete(`/alimentacion/${id}`);
}
export function removeAllAlimentacion() {
  return axios.delete("/alimentacion");
}

// -- Insumos --
export function listEmpleadosInsumos() {
  return axios.get("/insumos/empleados");
}
export function listInsumos() {
  return axios.get("/insumos");
}
export function createInsumo(data) {
  return axios.post("/insumos", data);
}
export function updateInsumo(id, data) {
  return axios.put(`/insumos/${id}`, data);
}
export function removeInsumo(id) {
  return axios.delete(`/insumos/${id}`);
}
export function removeAllInsumos() {
  return axios.delete("/insumos");
}
