/**
 * Helpers de rol compartidos por la capa de auth y la UI.
 *
 * El rol root (`es_root` en backend) tiene permisos totales y se muestra como
 * "Administrador". Cualquier otro rol es un empleado cuyos modulos se desbloquean
 * segun su asignacion en Seguridad.
 */

export function normalizeRol(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * `true` cuando el usuario es administrador (rol root).
 *
 * Fuente de verdad: `es_root` del backend. El nombre del rol solo se usa como
 * respaldo cuando `es_root` no esta disponible.
 */
export function esAdministrador({ esRoot, rol } = {}) {
  if (esRoot === true) return true;
  return normalizeRol(rol).includes("administrador");
}
