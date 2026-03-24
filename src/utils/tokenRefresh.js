import { API_URL } from "./config";

let refreshPromise = null;

/**
 * Only treat 401 as token expiration. For 403, only if the message
 * matches the exact backend wording for expired tokens
 * (avoids confusing RBAC permission denials with token issues).
 */
export function isTokenExpiredError(status, errorMessage = "") {
  if (status === 401) return true;
  const msg = errorMessage.toLowerCase();
  return (
    status === 403 &&
    (msg.includes("token") && (msg.includes("expirado") || msg.includes("invalid")))
  );
}

/**
 * Refreshes the access token using the stored refresh token.
 * Concurrent callers share the same in-flight promise so only
 * one network request is made at a time.
 */
export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = performRefresh();
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function performRefresh() {
  const storedRefreshToken = localStorage.getItem("refreshToken");
  if (!storedRefreshToken) {
    forceLogout();
    throw new Error("No hay refresh token disponible.");
  }

  try {
    const res = await fetch(`${API_URL}/usuarios/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!res.ok) {
      throw new Error("Error al renovar el token.");
    }

    const data = await res.json();

    localStorage.setItem("token", data.token);
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
    if (data.modulos) {
      localStorage.setItem("modulos", JSON.stringify(data.modulos));
    }

    return data.token;
  } catch (error) {
    forceLogout();
    throw error;
  }
}

function forceLogout() {
  localStorage.clear();
  window.location.href = "/login";
}
