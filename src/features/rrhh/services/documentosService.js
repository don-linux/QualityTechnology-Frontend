import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

const D = ENDPOINTS.documentosEmpleado;

export function listDocumentos(empleadoId) {
  return axios.get(empleadoId ? D.byEmpleado(empleadoId) : D.misDocumentos);
}

export function listTiposDocumento() {
  return axios.get(ENDPOINTS.tiposDocumento.activos);
}

export function uploadDocumento(empleadoId, formData) {
  return axios.post(
    empleadoId ? D.uploadByEmpleado(empleadoId) : D.uploadMio,
    formData
  );
}

export function viewDocumento(documentoId, selfService = false) {
  const url = selfService ? D.viewMio(documentoId) : D.view(documentoId);
  return axios.get(url, { responseType: "blob" });
}

export function downloadDocumento(documentoId, selfService = false) {
  const url = selfService ? D.downloadMio(documentoId) : D.download(documentoId);
  return axios.get(url, { responseType: "blob" });
}

export function removeDocumento(documentoId, selfService = false) {
  const url = selfService ? D.deleteMio(documentoId) : D.byId(documentoId);
  return axios.delete(url);
}
