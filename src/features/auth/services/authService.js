import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function login(nombre, password) {
  return axios.post(ENDPOINTS.auth.login, { nombre, contraseña: password });
}

export function logout(refreshToken) {
  return axios.post(ENDPOINTS.auth.logout, { refreshToken });
}
