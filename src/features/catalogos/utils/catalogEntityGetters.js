/**
 * Normaliza datos del API (contrato serializers: *_id, nombre, activo)
 * vs nombres legacy (fi_* / fc_* / fb_*).
 */

export function getDepartamentoId(d) {
  return d?.departamento_id ?? d?.fi_departamento_id ?? d?.id;
}

export function getDepartamentoNombre(d) {
  return d?.nombre ?? d?.fc_nombre ?? "";
}

export function departamentoActivo(d) {
  return d?.activo ?? d?.fb_activo ?? false;
}

export function getPuestoId(p) {
  return p?.puesto_id ?? p?.fi_puesto_id ?? p?.id;
}

export function getPuestoNombre(p) {
  return p?.nombre ?? p?.fc_nombre ?? "";
}

export function puestoActivo(p) {
  return p?.activo ?? p?.fb_activo ?? false;
}

export function getUnidadNegocioId(u) {
  return u?.fi_unidad_negocio_id ?? u?.unidad_negocio_id ?? u?.id;
}

export function getUnidadNegocioNombre(u) {
  return u?.fc_nombre ?? u?.nombre ?? "";
}

export function unidadNegocioActivo(u) {
  return u?.fb_activo ?? u?.activo ?? false;
}

export function getUbicacionId(u) {
  return u?.ubicacion_id ?? u?.fi_ubicacion_id ?? u?.id;
}

export function getUbicacionNombre(u) {
  return u?.nombre ?? u?.fc_nombre ?? "";
}

export function getRolId(r) {
  return r?.rol_id ?? r?.fi_rol_id ?? r?.id;
}

export function getRolNombre(r) {
  return r?.nombre ?? r?.fc_nombre ?? "";
}

export function rolEsRoot(r) {
  return Boolean(r?.es_root ?? r?.fb_es_root);
}

export function getTipoPiletaId(t) {
  return t?.tipo_pileta_id ?? t?.id;
}

export function getTipoPiletaNombre(t) {
  return t?.nombre ?? t?.fc_nombre ?? "";
}

export function tipoPiletaActivo(t) {
  return t?.activo ?? t?.esta_activo ?? t?.fb_activo ?? false;
}

export function getAreaInstalacionId(a) {
  return a?.area_instalacion_id ?? a?.id;
}

export function getAreaInstalacionNombre(a) {
  return a?.nombre ?? a?.fc_nombre ?? "";
}

export function areaInstalacionActivo(a) {
  return a?.activo ?? a?.esta_activo ?? a?.fb_activo ?? false;
}

export function getFaunaDetectadaId(f) {
  return f?.fauna_detectada_id ?? f?.id;
}

export function getFaunaDetectadaNombre(f) {
  return f?.nombre ?? f?.fc_nombre ?? "";
}

export function faunaDetectadaActivo(f) {
  return f?.activo ?? f?.esta_activo ?? f?.fb_activo ?? false;
}

export function getEvidenciaFaunaId(e) {
  return e?.evidencia_fauna_id ?? e?.id;
}

export function getEvidenciaFaunaNombre(e) {
  return e?.nombre ?? e?.fc_nombre ?? "";
}

export function evidenciaFaunaActivo(e) {
  return e?.activo ?? e?.esta_activo ?? e?.fb_activo ?? false;
}

export function getEstadoTrampaId(e) {
  return e?.estado_trampa_id ?? e?.id;
}

export function getEstadoTrampaNombre(e) {
  return e?.nombre ?? e?.fc_nombre ?? "";
}

export function estadoTrampaActivo(e) {
  return e?.activo ?? e?.esta_activo ?? e?.fb_activo ?? false;
}

export function getAccionCorrectivaId(a) {
  return a?.accion_correctiva_id ?? a?.id;
}

export function getAccionCorrectivaNombre(a) {
  return a?.nombre ?? a?.fc_nombre ?? "";
}

export function accionCorrectivaActivo(a) {
  return a?.activo ?? a?.esta_activo ?? a?.fb_activo ?? false;
}

/** Sede física enlazada (`unidadNegocio.ubicacionId` / serializers). */
export function getUnidadNegocioUbicacionId(u) {
  const v = u?.fi_ubicacion_id ?? u?.ubicacion_id;
  if (v == null || v === "") return "";
  return String(v);
}

export function getUnidadNegocioUbicacionNombre(u) {
  return u?.fc_ubicacion_nombre ?? u?.ubicacion?.nombre ?? "";
}
