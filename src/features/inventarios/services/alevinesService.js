import axios from "@shared/lib/axiosInstance";

export function listAlevines() {
  return axios.get("/alevinaje");
}

export function createAlevines(data) {
  return axios.post("/alevinaje", data);
}

export function updateAlevines(id, data) {
  return axios.put(`/alevinaje/${id}`, data);
}

export function removeAlevines(id) {
  return axios.delete(`/alevinaje/${id}`);
}
