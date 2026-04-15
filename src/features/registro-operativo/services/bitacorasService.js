import axios from "@shared/lib/axiosInstance";

// -- Plagas --
export function listPlagas(ubicacion) {
  return axios.get(`/plagas?ubicacion=${ubicacion}`);
}
export function createPlaga(data) {
  return axios.post("/plagas", data);
}
export function updatePlaga(id, data) {
  return axios.put(`/plagas/${id}`, data);
}
export function removePlaga(id) {
  return axios.delete(`/plagas/${id}`);
}
export function removeAllPlagas(ubicacion) {
  return axios.delete(`/plagas?ubicacion=${ubicacion}`);
}

// -- Recepcion Insumos --
export function listRecepcionInsumos(ubicacion) {
  return axios.get(`/recepcion_insumos?ubicacion=${ubicacion}`);
}
export function createRecepcionInsumo(data) {
  return axios.post("/recepcion_insumos", data);
}
export function updateRecepcionInsumo(id, data) {
  return axios.put(`/recepcion_insumos/${id}`, data);
}
export function removeRecepcionInsumo(id) {
  return axios.delete(`/recepcion_insumos/${id}`);
}
export function removeAllRecepcionInsumos(ubicacion) {
  return axios.delete(`/recepcion_insumos?ubicacion=${ubicacion}`);
}

// -- Visitas --
export function listVisitas(ubicacion, filtro) {
  return axios.get(`/visitas?ubicacion=${ubicacion}&filtro=${filtro}`);
}
export function createVisita(formData) {
  return axios.post("/visitas", formData);
}
export function updateVisita(id, formData) {
  return axios.put(`/visitas/${id}`, formData);
}
export function removeVisita(id) {
  return axios.delete(`/visitas/${id}`);
}
export function removeAllVisitas() {
  return axios.delete("/visitas");
}

// -- Banos --
export function listBanos() {
  return axios.get("/banos");
}
export function listEmpleadosBanos() {
  return axios.get("/banos/empleados");
}
export function createBano(data) {
  return axios.post("/banos", data);
}
export function updateBano(id, data) {
  return axios.put(`/banos/${id}`, data);
}
export function removeBano(id) {
  return axios.delete(`/banos/${id}`);
}
export function removeAllBanos() {
  return axios.delete("/banos");
}

// -- Parametros --
export function listEmpleadosParametros() {
  return axios.get("/parametros/empleados");
}
export function listParametros() {
  return axios.get("/parametros");
}
export function createParametro(data) {
  return axios.post("/parametros", data);
}
export function updateParametro(id, data) {
  return axios.put(`/parametros/${id}`, data);
}
export function removeParametro(id) {
  return axios.delete(`/parametros/${id}`);
}
export function removeAllParametros() {
  return axios.delete("/parametros");
}

// -- Medicamentos --
export function listEmpleadosMedicamentos() {
  return axios.get("/medicamentos/empleados");
}
export function listMedicamentos() {
  return axios.get("/medicamentos");
}
export function createMedicamento(data) {
  return axios.post("/medicamentos", data);
}
export function updateMedicamento(id, data) {
  return axios.put(`/medicamentos/${id}`, data);
}
export function removeMedicamento(id) {
  return axios.delete(`/medicamentos/${id}`);
}
export function removeAllMedicamentos() {
  return axios.delete("/medicamentos");
}

// -- Recambios --
export function listEmpleadosRecambios() {
  return axios.get("/recambios/empleados");
}
export function listRecambios() {
  return axios.get("/recambios");
}
export function createRecambio(data) {
  return axios.post("/recambios", data);
}
export function updateRecambio(id, data) {
  return axios.put(`/recambios/${id}`, data);
}
export function removeRecambio(id) {
  return axios.delete(`/recambios/${id}`);
}
export function removeAllRecambios() {
  return axios.delete("/recambios");
}

// -- Inventario --
export function listInventario() {
  return axios.get("/inventario");
}
export function createInventario(data) {
  return axios.post("/inventario", data);
}
export function updateInventario(id, data) {
  return axios.put(`/inventario/${id}`, data);
}
export function removeInventario(id) {
  return axios.delete(`/inventario/${id}`);
}
export function removeAllInventario() {
  return axios.delete("/inventario");
}
