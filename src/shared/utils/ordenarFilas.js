/**
 * Utilidades para listar registros en las tablas con el más reciente primero
 * y una columna de número secuencial (`_num`) que refleja el orden de creación:
 * el registro más antiguo es 1 y el más reciente es el número mayor.
 *
 * Con `siglaGranja` y `siglaModulo`, `_num` se muestra como `GAM-ENG-001`.
 *
 * El orden se calcula con el id autoincremental de la base de datos que cada
 * serializador del backend expone (p. ej. `fi_id`, `fi_<entidad>_id` o `id`).
 */

const CLAVES_ID_COMUNES = ["id", "fi_id"];

/** Siglas de módulo para IDs visibles: `{SIGLA_GRANJA}-{SIGLA_MODULO}-{NUMERO}`. */
export const SIGLAS_MODULO = Object.freeze({
  alevinaje: "ALV",
  engorda: "ENG",
  ciclosEngorda: "CEG",
  reproductores: "REP",
  piletas: "PIL",
  eventosCosecha: "EVC",
  trazabilidad: "TRZ",
  plagas: "PLG",
  visitas: "VIS",
  recepcionInsumos: "RIN",
  banos: "BAN",
});

export function formatearIdRegistro(siglaGranja, siglaModulo, numero, { padding = 3 } = {}) {
  const secuencial = String(numero).padStart(padding, "0");
  return [siglaGranja, siglaModulo, secuencial].filter(Boolean).join("-");
}

/** Obtiene el id de base de datos de una fila probando las claves indicadas. */
export function obtenerIdRegistro(row, idKeys) {
  if (!row || typeof row !== "object") return null;
  const claves = idKeys ? (Array.isArray(idKeys) ? idKeys : [idKeys]) : CLAVES_ID_COMUNES;
  for (const clave of claves) {
    const valor = row[clave];
    if (valor != null && valor !== "") {
      const num = Number(valor);
      return Number.isNaN(num) ? valor : num;
    }
  }
  return null;
}

/**
 * Devuelve las filas ordenadas con el registro más reciente primero (por id
 * autoincremental descendente) y agrega el campo `_num` con el número de orden
 * de creación: el más antiguo = 1, el más reciente = total de filas.
 *
 * @param {Array} rows Filas a ordenar y numerar.
 * @param {string|string[]} [idKeys] Clave(s) donde está el id de la fila.
 * @param {{ siglaGranja?: string, siglaModulo?: string }} [opciones] Formato de ID visible.
 */
export function ordenarYNumerar(rows, idKeys, opciones) {
  if (!Array.isArray(rows)) return [];
  const { siglaGranja, siglaModulo } = opciones || {};
  const usarIdCompuesto = Boolean(siglaGranja && siglaModulo);
  const ordenadas = [...rows].sort((a, b) => {
    const idA = obtenerIdRegistro(a, idKeys) ?? 0;
    const idB = obtenerIdRegistro(b, idKeys) ?? 0;
    if (idA === idB) return 0;
    return idA > idB ? -1 : 1;
  });
  const total = ordenadas.length;
  return ordenadas.map((row, index) => {
    const secuencial = total - index;
    const _num = usarIdCompuesto
      ? formatearIdRegistro(siglaGranja, siglaModulo, secuencial)
      : secuencial;
    return { ...row, _num, _numSecuencial: secuencial };
  });
}

export default ordenarYNumerar;
