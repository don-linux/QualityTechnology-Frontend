import axios from "@shared/lib/axiosInstance";

export function getPerfil() {
  return axios.get("/empleados/mi-perfil");
}

export function updatePerfil(data) {
  return axios.put("/empleados/mi-perfil", data);
}
