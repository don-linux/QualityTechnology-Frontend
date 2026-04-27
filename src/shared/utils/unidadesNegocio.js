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
