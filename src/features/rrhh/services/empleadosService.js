import axios from "@shared/lib/axiosInstance";

export function listEmpleados() {
  return axios.get("/empleados");
}

export function listDepartamentosActivos() {
  return axios.get("/departamentos/activos");
}

export function listPuestosActivos() {
  return axios.get("/puestos/activos");
}

export function updateEmpleado(id, data) {
  return axios.put(`/empleados/${id}`, data);
}

export function toggleEmpleadoActivo(id, activate) {
  const endpoint = activate ? "activate" : "deactivate";
  return axios.patch(`/empleados/${id}/${endpoint}`);
}
