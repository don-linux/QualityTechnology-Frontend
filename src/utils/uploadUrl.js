import { API_URL } from "./config";

export function getUploadUrl(path) {
  if (!path) return null;
  const token = localStorage.getItem("token");
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  return token ? `${url}?token=${token}` : url;
}
