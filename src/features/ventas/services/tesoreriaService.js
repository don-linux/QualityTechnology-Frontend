import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function getDatos(anio, granja) {
  return axios.get(ENDPOINTS.tesoreria.base, {
    params: { anio, granja },
  });
}
