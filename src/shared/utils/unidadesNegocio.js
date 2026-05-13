export function normalizarTexto(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isUnidadGranja(unidad) {
  const nombre = normalizarTexto(unidad?.fc_nombre || unidad?.label || unidad?.value);
  return nombre.includes("granja");
}

export function toUnidadNegocioOption(unidad) {
  return {
    id: unidad.fi_unidad_negocio_id,
    value: unidad.fc_nombre,
    label: unidad.fc_nombre,
    raw: unidad,
  };
}

export function resolveUnidadByRol(unidades, rol) {
  const rolNorm = normalizarTexto(rol);
  const opciones = unidades.filter(isUnidadGranja);

  if (rolNorm.includes("gam")) {
    return opciones.find((unidad) => normalizarTexto(unidad.fc_nombre).includes("medellin")) || null;
  }

  if (rolNorm.includes("gac")) {
    return opciones.find((unidad) => normalizarTexto(unidad.fc_nombre).includes("ceiba")) || null;
  }

  return null;
}

export function getNombreUnidad(unidad) {
  return unidad?.fc_nombre || unidad?.label || unidad?.value || "";
}

/**
 * Cruzar texto de granja/unidad ({@link fc_nombre}) con filas de `listUbicacionesActivas()`
 * cuando el nombre literal no coincide. Mejora `?granja=` y `ubicacion_id` en inventarios.
 * @param {string} label — ej. `fc_nombre` de la unidad de negocio
 * @param {Array<{ ubicacion_id?: number, nombre: string }>} ubicacionesRows
 * @returns {number|null}
 */
export function matchUbicacionIdForGranjaLabel(label, ubicacionesRows) {
  if (!label || !Array.isArray(ubicacionesRows) || ubicacionesRows.length === 0) return null;

  let bestId = null;
  let bestScore = 0;
  const nt = normalizarTexto(label);
  const STOP = new Set(
    ["granja", "acuícola", "la", "el", "de", "y", "del", "los", "las"].map((s) => normalizarTexto(s)),
  );

  for (const u of ubicacionesRows) {
    const name = u?.nombre;
    if (!name || u.ubicacion_id == null) continue;
    if (normalizarTexto(name) === nt) return u.ubicacion_id;
  }

  for (const u of ubicacionesRows) {
    const name = u?.nombre;
    if (!name || u.ubicacion_id == null) continue;
    const un = normalizarTexto(name);
    const shorter = un.length <= nt.length ? un : nt;
    const longer = un.length <= nt.length ? nt : un;
    if (shorter.length < 4 || !longer.includes(shorter)) continue;
    if (STOP.has(shorter)) continue;
    if (shorter.length > bestScore) {
      bestScore = shorter.length;
      bestId = u.ubicacion_id;
    }
  }

  return bestId;
}

export function getUnidadGranjaSlug(value) {
  const nombre = normalizarTexto(value);
  if (nombre.includes("ceiba")) return "ceiba";
  if (nombre.includes("medellin")) return "medellin";
  return nombre.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function getUnidadGranjaLogo(value) {
  const slug = getUnidadGranjaSlug(value);
  return slug ? `/images/${slug}.png` : "";
}

export function getUnidadGranjaColor(value) {
  return getUnidadGranjaSlug(value) === "ceiba" ? [46, 125, 50] : [13, 71, 161];
}
