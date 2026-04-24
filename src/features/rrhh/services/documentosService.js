import axios from "@shared/lib/axiosInstance";

export function listDocumentos(empleadoId) {
  const path = empleadoId
    ? `/documentos-empleado/${empleadoId}`
    : "/documentos-empleado/mis-documentos";
  return axios.get(path);
}

export function listTiposDocumento() {
  return axios.get("/tipos-documento/activos");
}

export function uploadDocumento(empleadoId, formData) {
  const path = empleadoId
    ? `/documentos-empleado/${empleadoId}/upload`
    : "/documentos-empleado/mis-documentos/upload";
  return axios.post(path, formData);
}

export function viewDocumento(documentoId, selfService = false) {
  const path = selfService
    ? `/documentos-empleado/mis-documentos/view/${documentoId}`
    : `/documentos-empleado/view/${documentoId}`;
  return axios.get(path, { responseType: "blob" });
}

export function downloadDocumento(documentoId, selfService = false) {
  const path = selfService
    ? `/documentos-empleado/mis-documentos/download/${documentoId}`
    : `/documentos-empleado/download/${documentoId}`;
  return axios.get(path, { responseType: "blob" });
}

export function removeDocumento(documentoId, selfService = false) {
  const path = selfService
    ? `/documentos-empleado/mis-documentos/${documentoId}`
    : `/documentos-empleado/${documentoId}`;
  return axios.delete(path);
}
