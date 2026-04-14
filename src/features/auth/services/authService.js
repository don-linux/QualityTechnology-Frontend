import axios from "@shared/lib/axiosInstance";

export function login(nombre, contrasena) {
  return axios.post("/usuarios/login", { nombre, contrasena });
}
