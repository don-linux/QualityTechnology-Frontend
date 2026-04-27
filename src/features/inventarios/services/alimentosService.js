import axios from "@shared/lib/axiosInstance";

const pathSegment = (value) => encodeURIComponent(decodeURIComponent(String(value || "")));

export function listAlimentos() {
  return axios.get("/alimentos");
}

export function createAlimento(data) {
  return axios.post("/alimentos", data);
}

export function removeAlimento(id) {
  return axios.delete(`/alimentos/${id}`);
}

export function listReproductoresByGranja(granja) {
  return axios.get(`/reproductores/granja/${pathSegment(granja)}`);
}

export function listPiletasByGranja(granja) {
  return axios.get(`/piletas/inventario/${pathSegment(granja)}`);
}

export function listEngordaByGranja(granja) {
  return axios.get(`/engorda/granja/${pathSegment(granja)}`);
}
