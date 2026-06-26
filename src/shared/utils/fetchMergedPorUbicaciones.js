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
            granja: row.granja ?? granjaKey,
          }));
        })
        .catch(() => []);
    }),
  );
  const merged = results.flat();
  const vistos = new Set();
  return merged.filter((row) => {
    const id = row?.movimiento_id ?? row?.id;
    if (id == null) return true;
    if (vistos.has(id)) return false;
    vistos.add(id);
    return true;
  });
}

/** Resuelve el slug/nombre de sede a partir de una infraestructura física del listado. */
export function resolveGranjaDesdeInfraestructuraFisica(infraestructuraFisica, ubicacionesGranja) {
  const match = ubicacionesGranja.find((op) => rowPerteneceAUbicacionGranja(infraestructuraFisica, op));
  if (match) return match.value;
  const nombre =
    infraestructuraFisica?.granja ?? infraestructuraFisica?.ubicacion?.nombre ?? infraestructuraFisica?.ubicacion ?? "";
  return nombre || ubicacionesGranja[0]?.value || "";
}

export function resolveGranjaDesdeInfraestructuraFisicaId(infraestructuraFisicaId, infraestructurasFisicas, ubicacionesGranja) {
  const p = infraestructurasFisicas.find(
    (x) => String(x.infraestructura_fisica_id) === String(infraestructuraFisicaId),
  );
  return p
    ? resolveGranjaDesdeInfraestructuraFisica(p, ubicacionesGranja)
    : ubicacionesGranja[0]?.value ?? "";
}

/** Filtra infraestructurasFisicas/registros por sede seleccionada en el formulario. */
export function filtrarPorUbicacion(items, ubicacion, ubicacionesGranja = []) {
  if (!ubicacion) return items;
  const op = ubicacionesGranja.find((u) => u.value === ubicacion);
  if (!op) return items;
  return items.filter((item) => rowPerteneceAUbicacionGranja(item, op));
}
