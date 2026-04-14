import axios from "@shared/lib/axiosInstance";

export function getDatos(anio, granja) {
  return axios.get("/tesoreria", { params: { anio, granja } });
}
