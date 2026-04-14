import axios from "@shared/lib/axiosInstance";
import { API_URL } from "@shared/lib/config";

export function getDatos(anio, granja) {
  return axios.get(`${API_URL}/tesoreria`, {
    params: { anio, granja },
  });
}
