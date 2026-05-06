import axios from "@shared/lib/axiosInstance";

export function login(nombre, password) {
  return axios.post("/auth/login", { nombre, password });
}
