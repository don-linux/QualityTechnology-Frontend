import { rowPerteneceAUbicacionGranja } from "@shared/utils/unidadesNegocio";

/**
 * Ejecuta una petición por cada filtro de ubicación y concatena los resultados.
 * Útil cuando el backend solo expone rutas por granja/sede.
 */
export async function fetchMergedPorUbicaciones(filtros, fetchFn) {
  if (!filtros?.length) return [];
  const results = await Promise.all(
    filtros.map((filtro) => {
      const granjaKey =
        typeof filtro === "string"
          ? filtro
          : filtro?.granja ?? filtro?.ubicacion ?? "";
      return fetchFn(filtro)
        .then((res) => {
          const rows = Array.isArray(res?.data) ? res.data : [];
          return rows.map((row) => ({
            ...row,
            ubicacion: row.ubicacion ?? granjaKey,
            fc_granja: row.fc_granja ?? granjaKey,
          }));
        })
        .catch(() => []);
    }),
  );
  const merged = results.flat();
  const vistos = new Set();
  return merged.filter((row) => {
    const id = row?.fi_movimiento_id ?? row?.id;
    if (id == null) return true;
    if (vistos.has(id)) return false;
    vistos.add(id);
    return true;
  });
}

/** Resuelve el slug/nombre de sede a partir de una pileta del listado. */
export function resolveGranjaDesdePileta(pileta, ubicacionesGranja) {
  const match = ubicacionesGranja.find((op) => rowPerteneceAUbicacionGranja(pileta, op));
  if (match) return match.value;
  const nombre =
    pileta?.fc_granja ?? pileta?.ubicacion?.nombre ?? pileta?.ubicacion ?? "";
  return nombre || ubicacionesGranja[0]?.value || "";
}

export function resolveGranjaDesdePiletaId(piletaId, piletas, ubicacionesGranja) {
  const p = piletas.find(
    (x) => String(x.fi_pileta_id ?? x.pileta_id) === String(piletaId),
  );
  return p
    ? resolveGranjaDesdePileta(p, ubicacionesGranja)
    : ubicacionesGranja[0]?.value ?? "";
}

/** Filtra piletas/registros por sede seleccionada en el formulario. */
export function filtrarPorUbicacion(items, ubicacion, ubicacionesGranja = []) {
  if (!ubicacion) return items;
  const op = ubicacionesGranja.find((u) => u.value === ubicacion);
  if (!op) return items;
  return items.filter((item) => rowPerteneceAUbicacionGranja(item, op));
}
