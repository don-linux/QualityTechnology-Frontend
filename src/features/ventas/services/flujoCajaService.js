import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listMovimientos() {
  return axios.get(ENDPOINTS.flujoCaja.base);
}
