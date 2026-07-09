import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listCiclosAvicola(tipo = "engorda") {
  return axios.get(ENDPOINTS.ciclosAvicola.base, { params: tipo ? { tipo } : undefined });
}

export function getCicloAvicola(id) {
  return axios.get(ENDPOINTS.ciclosAvicola.byId(id));
}

export function createCicloAvicola(data) {
  return axios.post(ENDPOINTS.ciclosAvicola.base, data);
}

export function updateCicloAvicola(id, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.byId(id), data);
}

export function createCalendarioEvento(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.calendario(cicloId), data);
}

export function updateCalendarioEvento(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.calendarioItem(cicloId, itemId), data);
}

export function deleteCalendarioEvento(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.calendarioItem(cicloId, itemId));
}

export function createGasto(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.gastos(cicloId), data);
}

export function updateGasto(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.gastosItem(cicloId, itemId), data);
}

export function deleteGasto(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.gastosItem(cicloId, itemId));
}

export function createVenta(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.ventas(cicloId), data);
}

export function updateVenta(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.ventasItem(cicloId, itemId), data);
}

export function deleteVenta(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.ventasItem(cicloId, itemId));
}

export function createBiometria(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.biometrias(cicloId), data);
}

export function updateBiometria(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.biometriasItem(cicloId, itemId), data);
}

export function deleteBiometria(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.biometriasItem(cicloId, itemId));
}

export function createMortalidad(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.mortalidad(cicloId), data);
}

export function updateMortalidad(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.mortalidadItem(cicloId, itemId), data);
}

export function deleteMortalidad(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.mortalidadItem(cicloId, itemId));
}

export function createAlimentoFase(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.alimento(cicloId), data);
}

export function updateAlimentoFase(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.alimentoItem(cicloId, itemId), data);
}

export function deleteAlimentoFase(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.alimentoItem(cicloId, itemId));
}

export function createConsumoEstimado(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.consumoEstimado(cicloId), data);
}

export function updateConsumoEstimado(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.consumoEstimadoItem(cicloId, itemId), data);
}

export function deleteConsumoEstimado(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.consumoEstimadoItem(cicloId, itemId));
}

export function createSanidad(cicloId, data) {
  return axios.post(ENDPOINTS.ciclosAvicola.sanidad(cicloId), data);
}

export function updateSanidad(cicloId, itemId, data) {
  return axios.put(ENDPOINTS.ciclosAvicola.sanidadItem(cicloId, itemId), data);
}

export function deleteSanidad(cicloId, itemId) {
  return axios.delete(ENDPOINTS.ciclosAvicola.sanidadItem(cicloId, itemId));
}
