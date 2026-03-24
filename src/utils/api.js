import { API_URL } from "./config";
import { refreshAccessToken, isTokenExpiredError } from "./tokenRefresh";

export { API_URL };

export function getUploadUrl(path) {
  if (!path) return null;
  const token = localStorage.getItem("token");
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  return token ? `${url}?token=${token}` : url;
}

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    let errorMessage = "";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || "";
    } catch (_) {}

    if (isTokenExpiredError(res.status, errorMessage)) {
      const newToken = await refreshAccessToken();
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
    } else {
      throw new Error(errorMessage || "Error al obtener datos del servidor");
    }
  }

  if (!res.ok) {
    let errorMessage = "Error al obtener datos del servidor";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  if (res.status === 204) return null;
  return res.json();
}
