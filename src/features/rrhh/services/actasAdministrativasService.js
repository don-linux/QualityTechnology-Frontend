import axios from "@shared/lib/axiosInstance";

export function listActasAdministrativas(empleadoId) {
  return axios.get(`/actas-administrativas/${empleadoId}`);
}

export function uploadActaAdministrativa(empleadoId, formData) {
  return axios.post(`/actas-administrativas/${empleadoId}/upload`, formData);
}

export function viewActaAdministrativa(actaId) {
  return axios.get(`/actas-administrativas/view/${actaId}`, { responseType: "blob" });
}

export function downloadActaAdministrativa(actaId) {
  return axios.get(`/actas-administrativas/download/${actaId}`, { responseType: "blob" });
}

export function removeActaAdministrativa(actaId) {
  return axios.delete(`/actas-administrativas/${actaId}`);
}
