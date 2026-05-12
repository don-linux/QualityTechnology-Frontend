import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listAlevines() {
  return axios.get(ENDPOINTS.alevines.base);
}

export function createAlevines(data) {
  return axios.post(ENDPOINTS.alevines.base, data);
}

export function updateAlevines(id, data) {
  return axios.put(ENDPOINTS.alevines.byId(id), data);
}

export function removeAlevines(id) {
  return axios.delete(ENDPOINTS.alevines.byId(id));
}
