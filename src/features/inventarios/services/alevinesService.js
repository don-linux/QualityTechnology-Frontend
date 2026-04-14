import axios from "@shared/lib/axiosInstance";

export function listAlevines() {
  return axios.get("/alevines");
}

export function listColectas() {
  return axios.get("/colectas");
}

export function createAlevines(data) {
  return axios.post("/alevines", data);
}

export function updateAlevines(id, data) {
  return axios.put(`/alevines/${id}`, data);
}

export function removeAlevines(id) {
  return axios.delete(`/alevines/${id}`);
}
