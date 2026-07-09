import { createContext, useContext, useState, useCallback, useMemo } from "react";
import axiosInstance from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";
import { normalizeRol, esAdministrador } from "@shared/lib/rolUtils";

const AuthContext = createContext(null);

function readSession() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return {
    token,
    refreshToken: localStorage.getItem("refreshToken") || "",
    rol: localStorage.getItem("rol") || "",
    esRoot: localStorage.getItem("es_root") === "true",
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
      usuario.usuario_id || usuario.id_usuario || usuario.id || null;

    const rolTexto = (usuario.rol || usuario.rol_nombre || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    localStorage.setItem("auth", "true");
    localStorage.setItem("token", data.token || "");
    localStorage.setItem("refreshToken", data.refreshToken || "");
    localStorage.setItem("rol", rolTexto);
    localStorage.setItem("es_root", String(usuario.es_root === true));
    localStorage.setItem("nombre", usuario.nombre || "Usuario");
    localStorage.setItem("usuario_id", String(usuarioId));
    localStorage.setItem("modulos", JSON.stringify(data.modulos || []));

    // Unidad de negocio del empleado vinculado al usuario (login la resuelve en BD).
    // "ALL" = sin restricción (root); "SIN_UNIDAD" = usuario sin unidad asignada.
    let granja;
    if (usuario.es_root === true) {
      granja = "ALL";
    } else if (usuario.unidad_negocio_nombre) {
      granja = usuario.unidad_negocio_nombre;
    } else {
      granja = "SIN_UNIDAD";
    }
    localStorage.setItem("granja", granja);
    if (usuario.unidad_negocio_id != null) {
      localStorage.setItem("unidad_negocio_id", String(usuario.unidad_negocio_id));
    } else {
      localStorage.removeItem("unidad_negocio_id");
    }

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
      const target = normalizeRol(nombre);
      return session.modulos.some(
        (m) =>
          m &&
          typeof m.nombre === "string" &&
          normalizeRol(m.nombre) === target
      );
    },
    [session?.modulos]
  );

  const isAuthenticated = !!session?.token;

  const isAdmin = useMemo(
    () => esAdministrador({ esRoot: session?.esRoot, rol: session?.rol }),
    [session?.esRoot, session?.rol]
  );

  const rolLegible = isAdmin ? "Administrador" : "Usuario";

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated,
      esAdministrador: isAdmin,
      rolLegible,
      login,
      logout,
      hasModulo,
    }),
    [session, isAuthenticated, isAdmin, rolLegible, login, logout, hasModulo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
