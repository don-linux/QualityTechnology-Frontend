/**
 * Utilidades para listar registros en las tablas con el más reciente primero
 * y una columna de número secuencial (`_num`) que refleja el orden de creación:
 * el registro más antiguo es 1 y el más reciente es el número mayor.
 *
 * El orden se calcula con el id autoincremental de la base de datos que cada
 * serializador del backend expone (p. ej. `id` o `<entidad>_id`).
 */

const CLAVES_ID_COMUNES = ["id"];

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
 */
export function ordenarYNumerar(rows, idKeys) {
  if (!Array.isArray(rows)) return [];
  const ordenadas = [...rows].sort((a, b) => {
    const idA = obtenerIdRegistro(a, idKeys) ?? 0;
    const idB = obtenerIdRegistro(b, idKeys) ?? 0;
    if (idA === idB) return 0;
    return idA > idB ? -1 : 1;
  });
  const total = ordenadas.length;
  return ordenadas.map((row, index) => ({ ...row, _num: total - index }));
}

export default ordenarYNumerar;
