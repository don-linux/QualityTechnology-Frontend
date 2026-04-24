import axios from "@shared/lib/axiosInstance";

export function listUnidadesNegocio() {
  return axios.get("/unidades-negocio");
}

export function listUnidadesNegocioActivas() {
  return axios.get("/unidades-negocio/activos");
}

export function createUnidadNegocio(fc_nombre) {
  return axios.post("/unidades-negocio", { fc_nombre });
}

export function updateUnidadNegocio(id, fc_nombre) {
  return axios.put(`/unidades-negocio/${id}`, { fc_nombre });
}

export function activateUnidadNegocio(id) {
  return axios.patch(`/unidades-negocio/${id}/activate`);
}

export function deactivateUnidadNegocio(id) {
  return axios.patch(`/unidades-negocio/${id}/deactivate`);
}
