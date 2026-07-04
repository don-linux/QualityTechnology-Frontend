import useAuth from "@app/providers/AuthProvider";
import useHeaderInfo from "@shared/layout/HeaderInfoContext";

/**
 * Resolves the display name for export footers ("Impreso por: ...").
 * Admin users show "Administrador"; employees show full name from profile.
 */
export default function useNombreImpresion() {
  const { esAdministrador, nombre: authNombre } = useAuth();
  const headerInfo = useHeaderInfo();

  if (esAdministrador || headerInfo.mode === "admin") {
    return "Administrador";
  }

  if (headerInfo.mode === "empleado") {
    const partes = [headerInfo.nombre, headerInfo.apellidoPaterno].filter(Boolean);
    if (partes.length) return partes.join(" ");
  }

  return authNombre || "Usuario";
}
