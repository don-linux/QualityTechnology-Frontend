import axiosInstance from "./axiosInstance";
import { API_URL } from "./config";

/**
 * Base de los recursos estáticos subidos. `API_URL` incluye el prefijo `/api`,
 * pero el backend sirve los archivos en la raíz del servidor (`/uploads`),
 * fuera de `/api`. Por eso quitamos el sufijo `/api` para apuntar al origen.
 */
function staticBaseUrl() {
  return API_URL.replace(/\/api\/?$/, "");
}

/**
 * Construye la URL absoluta de un recurso subido SIN incluir el token.
 * El token nunca debe viajar en la query string: queda expuesto en el
 * historial del navegador, en la cabecera Referer y en los logs del servidor.
 */
export function buildUploadUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${staticBaseUrl()}/${path.replace(/^\//, "")}`;
}

/**
 * Descarga un recurso subido como Blob usando Authorization en cabecera.
 * Para rutas http(s) externas, el llamador debe tratarlas aparte.
 */
export async function fetchUploadBlob(path) {
  const { data } = await axiosInstance.get(buildUploadUrl(path), {
    responseType: "blob",
  });
  return data;
}

/**
 * Abre un recurso protegido en una pestaña nueva descargándolo primero con
 * la cabecera Authorization (vía axiosInstance) y mostrando el blob local.
 * Así el JWT viaja en la cabecera y no en la URL. Para recursos externos
 * (http...) se abre el enlace directamente.
 */
export async function openUpload(path) {
  if (!path) return;

  if (path.startsWith("http")) {
    window.open(path, "_blank", "noopener,noreferrer");
    return;
  }

  const data = await fetchUploadBlob(path);
  const objectUrl = URL.createObjectURL(data);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
}
