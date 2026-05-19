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

export function getEstadoConservacionId(e) {
  return e?.estado_conservacion_id ?? e?.id;
}

export function getEstadoConservacionNombre(e) {
  return e?.nombre ?? e?.fc_nombre ?? "";
}

export function estadoConservacionActivo(e) {
  return e?.activo ?? e?.esta_activo ?? e?.fb_activo ?? false;
}

export function getTipoInstanciaPiletaId(t) {
  return t?.tipo_instancia_pileta_id ?? t?.id;
}

export function getTipoInstanciaPiletaNombre(t) {
  return t?.nombre ?? t?.fc_nombre ?? "";
}

export function tipoInstanciaPiletaActivo(t) {
  return t?.activo ?? t?.esta_activo ?? t?.fb_activo ?? false;
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
