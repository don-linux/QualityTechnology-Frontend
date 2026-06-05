import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listVentas() {
  return axios.get(ENDPOINTS.ventas.base);
}
