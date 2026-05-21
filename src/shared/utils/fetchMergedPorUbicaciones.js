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
  return results.flat();
}

/** Resuelve el slug/nombre de sede a partir de una pileta del listado. */
export function resolveGranjaDesdePileta(pileta, ubicacionesGranja) {
  const nombre =
    pileta?.fc_granja ?? pileta?.ubicacion?.nombre ?? pileta?.ubicacion ?? "";
  if (!nombre) return ubicacionesGranja[0]?.value ?? "";
  const match = ubicacionesGranja.find(
    (u) => u.value === nombre || u.label === nombre,
  );
  return match?.value ?? nombre;
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
  const nombres = new Set([ubicacion, op?.label].filter(Boolean));
  return items.filter((item) => {
    const g = item.fc_granja ?? item.ubicacion?.nombre ?? item.ubicacion ?? "";
    return nombres.has(g);
  });
}
