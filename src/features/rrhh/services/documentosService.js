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
