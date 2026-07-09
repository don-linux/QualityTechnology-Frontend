import { useState, useEffect } from "react";
import { getPerfil } from "../services/perfilService";

const ADMIN_HEADER = { mode: "admin", label: "Administrador", avatarInitial: "A" };
const LOADING_HEADER = { mode: "loading", avatarInitial: "" };
const FALLBACK_HEADER = { mode: "fallback", label: "Usuario", avatarInitial: "U" };

/**
 * Resuelve la informacion mostrada en el encabezado (TopBar / Inicio).
 *
 * - Administrador (rol root): retorno inmediato "Administrador", sin HTTP.
 * - Empleado: GET `/empleados/mi-perfil` para nombre, apellido, UdN y puesto.
 * - Sin perfil vinculado: fallback a "Usuario".
 */
export default function useMiPerfilHeader(esAdministrador) {
  const [headerInfo, setHeaderInfo] = useState(() =>
    esAdministrador ? ADMIN_HEADER : LOADING_HEADER
  );

  useEffect(() => {
    if (esAdministrador) {
      setHeaderInfo(ADMIN_HEADER);
      return;
    }

    let activo = true;
    setHeaderInfo(LOADING_HEADER);

    (async () => {
      try {
        const { data } = await getPerfil();
        if (!activo) return;
        const nombre = (data.nombre || "").trim();
        setHeaderInfo({
          mode: "empleado",
          nombre,
          apellidoPaterno: (data.apellido_paterno || "").trim(),
          unidadNegocio: data.unidad_negocio_nombre || "",
          puesto: data.puesto_nombre || "",
          avatarInitial: (nombre.charAt(0) || "U").toUpperCase(),
        });
      } catch (e) {
        console.error("No se pudo cargar el perfil para el encabezado:", e);
        if (activo) setHeaderInfo(FALLBACK_HEADER);
      }
    })();

    return () => {
      activo = false;
    };
  }, [esAdministrador]);

  return headerInfo;
}
