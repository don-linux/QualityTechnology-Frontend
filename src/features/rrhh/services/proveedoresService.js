import axios from "@shared/lib/axiosInstance";

export function listProveedores() {
  return axios.get("/proveedores");
}

export function createProveedor(data) {
  return axios.post("/proveedores", data);
}

export function updateProveedor(id, data) {
  return axios.put(`/proveedores/${id}`, data);
}

export function removeProveedor(id) {
  return axios.delete(`/proveedores/${id}`);
}
