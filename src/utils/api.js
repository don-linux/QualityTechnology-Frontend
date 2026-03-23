export const API_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_URL) ||
  "http://localhost:5000";

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

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  // Si el servidor devuelve un error HTTP
  if (!res.ok) {
    let errorMessage = "Error al obtener datos del servidor";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  //  Si la respuesta es vacía (DELETE 204, por ejemplo), no intentar parsear JSON
  if (res.status === 204) {
    return null;
  }

  //  Si la respuesta sí tiene cuerpo, convertirla a JSON
  return res.json();
}
