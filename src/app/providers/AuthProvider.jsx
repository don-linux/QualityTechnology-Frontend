import { createContext, useContext, useState, useCallback, useMemo } from "react";
import axiosInstance from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

const AuthContext = createContext(null);

function normalize(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function readSession() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    refreshToken: localStorage.getItem("refreshToken") || "",
    rol: localStorage.getItem("rol") || "",
    nombre: (localStorage.getItem("nombre") || "Usuario").trim(),
    usuarioId: localStorage.getItem("usuario_id") || "",
    granja: localStorage.getItem("granja") || "ALL",
    empresaId: localStorage.getItem("empresa_id") || "",
    modulos: JSON.parse(localStorage.getItem("modulos") || "[]"),
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback((data) => {
    const usuario = data.usuario;
    const usuarioId =
      usuario.fi_usuario_id || usuario.usuario_id || usuario.id_usuario || usuario.id || null;

    const rolTexto = (usuario.rol || usuario.rol_nombre || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    localStorage.setItem("auth", "true");
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("refreshToken", data.refreshToken || "");
    localStorage.setItem("rol", rolTexto);
    localStorage.setItem("nombre", usuario.nombre || "Usuario");
    localStorage.setItem("usuario_id", String(usuarioId));
    localStorage.setItem("modulos", JSON.stringify(data.modulos || []));

    let granja = "ALL";
    const rolLower = rolTexto.toLowerCase();
    if (rolLower.includes("gam")) granja = "Medellin";
    if (rolLower.includes("gac")) granja = "La Ceiba";
    localStorage.setItem("granja", granja);

    setSession(readSession());
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await axiosInstance.post(
          ENDPOINTS.auth.logout,
          { refreshToken },
          { _skipAuth: true }
        );
      } catch (_) { /* best effort */ }
    }
    localStorage.clear();
    setSession(null);
    window.location.href = "/login";
  }, []);

  const hasModulo = useCallback(
    (nombre) => {
      if (!session?.modulos) return false;
      const target = normalize(nombre);
      return session.modulos.some(
        (m) =>
          m &&
          (
            (typeof m.nombre === "string" && normalize(m.nombre) === target) ||
            (typeof m.fc_nombre === "string" && normalize(m.fc_nombre) === target)
          )
      );
    },
    [session?.modulos]
  );

  const isAuthenticated = !!session?.token;

  const rolLegible = useMemo(() => {
    if (!session) return "Usuario";
    const rol = normalize(session.rol);
    const nombreLower = (session.nombre || "").toLowerCase();
    if (rol.includes("admin") || rol.includes("administrador") || rol.includes("jefedeempresa")) {
      if (nombreLower.includes("jefegam")) return "Jefe de Medellín";
      if (nombreLower.includes("jefegac")) return "Jefe de La Ceiba";
      return "Administrador";
    }
    return "Usuario";
  }, [session]);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated,
      rolLegible,
      login,
      logout,
      hasModulo,
    }),
    [session, isAuthenticated, rolLegible, login, logout, hasModulo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
