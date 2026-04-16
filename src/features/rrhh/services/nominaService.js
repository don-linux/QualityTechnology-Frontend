import axios from "@shared/lib/axiosInstance";

export function listNomina() {
  return axios.get("/nomina");
}

export function createNomina(data) {
  return axios.post("/nomina", data);
}

export function updateNomina(id, data) {
  return axios.put(`/nomina/${id}`, data);
}

export function removeNomina(id) {
  return axios.delete(`/nomina/${id}`);
}

export function buscarNomina(params) {
  return axios.get("/nomina", { params });
}
