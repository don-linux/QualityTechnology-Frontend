export function normalizarTexto(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function isUnidadGranja(unidad) {
  const nombre = normalizarTexto(unidad?.nombre || unidad?.label || unidad?.value);
  return nombre.includes("granja");
}

export function toUnidadNegocioOption(unidad) {
  return {
    id: unidad.unidad_negocio_id,
    value: unidad.nombre,
    label: unidad.nombre,
    raw: unidad,
  };
}

export function resolveUnidadByRol(unidades, rol) {
  const rolNorm = normalizarTexto(rol);
  const opciones = unidades.filter(isUnidadGranja);

  if (rolNorm.includes("gam")) {
    return opciones.find((unidad) => normalizarTexto(unidad.nombre).includes("medellin")) || null;
  }

  if (rolNorm.includes("gac")) {
    return opciones.find((unidad) => normalizarTexto(unidad.nombre).includes("ceiba")) || null;
  }

  return null;
}

export function getNombreUnidad(unidad) {
  return unidad?.nombre || unidad?.label || unidad?.value || "";
}

/**
 * Cruzar texto de granja/unidad ({@link nombre}) con filas de `listUbicacionesActivas()`
 * cuando el nombre literal no coincide. Mejora `?granja=` y `ubicacion_id` en inventarios.
 * @param {string} label — ej. `nombre` de la unidad de negocio
 * @param {Array<{ ubicacion_id?: number, nombre: string }>} ubicacionesRows
 * @returns {number|null}
 */
const STOP_GRANJA_MATCH = new Set(
  ["granja", "acuícola", "la", "el", "de", "y", "del", "los", "las"].map((s) =>
    normalizarTexto(s),
  ),
);

function nombresGranjaCoinciden(a, b) {
  const na = normalizarTexto(a);
  const nb = normalizarTexto(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = na.length <= nb.length ? nb : na;
  if (shorter.length < 4 || !longer.includes(shorter)) return false;
  return !STOP_GRANJA_MATCH.has(shorter);
}

/**
 * Indica si un registro (pileta, inventario, bitácora…) pertenece a la opción de sede/granja.
 * Prioriza `ubicacion_id`; si no hay FK, compara nombres con normalización y alias cortos.
 */
export function rowPerteneceAUbicacionGranja(row, op, field = "granja") {
  if (!row || !op) return false;

  const rowUbicId = row.ubicacion_id ?? row.ubicacionId ?? null;
  if (
    rowUbicId != null &&
    op.ubicacion_id != null &&
    Number(rowUbicId) === Number(op.ubicacion_id)
  ) {
    return true;
  }

  const raw =
    row[field] ??
    row.granja ??
    row.ubicacion?.nombre ??
    row.ubicacion ??
    "";
  if (!raw) return false;
  if (raw === op.value || raw === op.label) return true;
  return nombresGranjaCoinciden(raw, op.value) || nombresGranjaCoinciden(raw, op.label);
}

export function matchUbicacionIdForGranjaLabel(label, ubicacionesRows) {
  if (!label || !Array.isArray(ubicacionesRows) || ubicacionesRows.length === 0) return null;

  let bestId = null;
  let bestScore = 0;
  for (const u of ubicacionesRows) {
    const name = u?.nombre;
    if (!name || u.ubicacion_id == null) continue;
    if (normalizarTexto(name) === normalizarTexto(label)) return u.ubicacion_id;
  }

  for (const u of ubicacionesRows) {
    const name = u?.nombre;
    if (!name || u.ubicacion_id == null) continue;
    if (!nombresGranjaCoinciden(name, label)) continue;
    const score = Math.min(normalizarTexto(name).length, normalizarTexto(label).length);
    if (score > bestScore) {
      bestScore = score;
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
