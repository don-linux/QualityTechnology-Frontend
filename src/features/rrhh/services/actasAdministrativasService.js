import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export function listActasAdministrativas(empleadoId) {
  return axios.get(ENDPOINTS.actasAdministrativas.byEmpleado(empleadoId));
}

export function uploadActaAdministrativa(empleadoId, formData) {
  return axios.post(ENDPOINTS.actasAdministrativas.upload(empleadoId), formData);
}

export function viewActaAdministrativa(actaId) {
  return axios.get(ENDPOINTS.actasAdministrativas.view(actaId), { responseType: "blob" });
}

export function downloadActaAdministrativa(actaId) {
  return axios.get(ENDPOINTS.actasAdministrativas.download(actaId), { responseType: "blob" });
}

export function removeActaAdministrativa(actaId) {
  return axios.delete(ENDPOINTS.actasAdministrativas.byId(actaId));
}
