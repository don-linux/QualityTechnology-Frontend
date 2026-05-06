import axios from "@shared/lib/axiosInstance";

export function listEngordas() {
  return axios.get("/engorda");
}

export function getEngorda(id) {
  return axios.get(`/engorda/${id}`);
}

export function createEngorda(data) {
  return axios.post("/engorda", data);
}

export function updateEngorda(id, data) {
  return axios.put(`/engorda/${id}`, data);
}

export function removeEngorda(id) {
  return axios.delete(`/engorda/${id}`);
}
