// Utilidades de formato compartidas para toda la aplicación.
//
// Convenciones de presentación:
//   - Fechas:  DD-MM-AAAA   (ej. 09-06-2026)
//   - Precios: $000,000.00  (es-MX, 2 decimales, separador de miles)
//
// Importante: los <input type="date"> requieren el valor en formato
// "AAAA-MM-DD"; para ello usa `toInputDate`, NO `formatFecha`.

const RE_FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Extrae la parte de fecha ("AAAA-MM-DD") de un valor ISO/Date sin aplicar
 * conversión de zona horaria (evita corrimientos de un día).
 * @param {string|Date|null|undefined} value
 * @returns {string} "AAAA-MM-DD" o "" si no es válido.
 */
export function toInputDate(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") {
    return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

/**
 * Formatea una fecha como "DD-MM-AAAA".
 * Acepta strings ISO, "AAAA-MM-DD", objetos Date o timestamps.
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback="—"] Valor a mostrar cuando no hay fecha válida.
 * @returns {string}
 */
export function formatFecha(value, fallback = "—") {
  const iso = toInputDate(value);
  const match = RE_FECHA_ISO.exec(iso);
  if (!match) return fallback;
  const [, anio, mes, dia] = match;
  return `${dia}-${mes}-${anio}`;
}

/**
 * Formatea una fecha con hora como "DD-MM-AAAA HH:mm".
 * @param {string|Date|number|null|undefined} value
 * @param {string} [fallback="—"]
 * @returns {string}
 */
export function formatFechaHora(value, fallback = "—") {
  if (value === null || value === undefined || value === "") return fallback;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  const hora = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${formatFecha(d, fallback)} ${hora}:${min}`;
}

/**
 * Formatea un valor monetario como "$000,000.00".
 * @param {number|string|null|undefined} value
 * @returns {string}
 */
export function formatPrecio(value) {
  const num = Number(value);
  const seguro = Number.isFinite(num) ? num : 0;
  return seguro.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formatea un número (no monetario) con separadores de miles es-MX.
 * @param {number|string|null|undefined} value
 * @param {number} [decimales=0]
 * @returns {string}
 */
export function formatNumero(value, decimales = 0) {
  const num = Number(value);
  const seguro = Number.isFinite(num) ? num : 0;
  return seguro.toLocaleString("es-MX", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}
