/**
 * Formatos de transformación para campos de texto en formularios.
 *
 * Convención: el valor en el estado del formulario y en el backend debe
 * quedar ya normalizado (p. ej. title case) tras blur o guardado.
 */

export const FORMATOS_TEXTO = {
  MAYUSCULA_INICIAL_TODO: "mayuscula_inicial_todo",
};

export const ETIQUETAS_FORMATO_TEXTO = {
  [FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO]: "Mayúscula inicial en todo",
};

const LOCALE = "es";

const CLAVES_SIN_FORMATO =
  /(correo|email|password|rfc|codigo|busqueda|usuario|token|url|foto|mime)/i;

/**
 * Indica si un campo de formulario debe recibir title case.
 * @param {object} opts
 * @param {string} [opts.type]
 * @param {string} [opts.name]
 * @param {boolean} [opts.select]
 * @param {string} [opts.inputMode]
 * @param {boolean} [opts.readOnly]
 * @param {string|null|false} [opts.formato] Forzar (true=default) o desactivar (null/false).
 * @returns {boolean}
 */
export function debeAplicarFormatoTexto({
  type,
  name,
  select,
  inputMode,
  readOnly,
  formato,
} = {}) {
  if (formato === null || formato === false) return false;
  if (formato) return true;
  if (select || readOnly) return false;

  const inputType = String(type || "text").toLowerCase();
  if (inputType !== "text" && inputType !== "search") return false;

  const mode = String(inputMode || "").toLowerCase();
  if (mode === "numeric" || mode === "decimal" || mode === "tel") return false;

  const n = String(name || "").toLowerCase();
  if (!n) return true;
  if (CLAVES_SIN_FORMATO.test(n)) return false;
  if (/(^|_)id$/.test(n) || n.endsWith("_id")) return false;
  if (/^fd_|fecha|hora/.test(n)) return false;
  if (/^fn_|^fi_/.test(n)) return false;
  if (/^tipo$|^estado$|^granja$|^tipo_/.test(n)) return false;

  return true;
}

/**
 * Title case completo (blur / guardado): primera mayúscula y resto minúsculas.
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function formatoMayusculaInicialTodo(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (palabra) =>
        palabra.charAt(0).toLocaleUpperCase(LOCALE) +
        palabra.slice(1).toLocaleLowerCase(LOCALE),
    )
    .join(" ");
}

/**
 * Title case en vivo mientras se escribe: solo la primera letra de cada palabra
 * en mayúscula; el resto se deja tal cual lo teclea el usuario.
 * @param {string|null|undefined} value
 * @returns {string}
 */
export function formatoMayusculaInicialEnVivo(value) {
  if (value == null || value === "") return "";
  return String(value).replace(
    /(^|\s)(\S)/gu,
    (_, sep, char) => sep + char.toLocaleUpperCase(LOCALE),
  );
}

/**
 * @param {string|null|undefined} value
 * @param {string|null|undefined} formato
 * @returns {string}
 */
export function aplicarFormatoTexto(value, formato) {
  switch (formato) {
    case FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO:
      return formatoMayusculaInicialTodo(value);
    default:
      return value == null ? "" : String(value);
  }
}

/**
 * Normaliza texto libre: trim + title case cuando aplica.
 * @param {string|null|undefined} value
 * @param {string|null|undefined} fieldName
 * @returns {string}
 */
export function normalizeTextoCampo(value, fieldName = null) {
  if (value === undefined || value === null) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return trimmed;

  const n = String(fieldName || "").toLowerCase();
  if (/rfc/.test(n)) return trimmed.toUpperCase();
  if (!debeAplicarFormatoTextoCampo(fieldName)) return trimmed;

  return aplicarFormatoTexto(trimmed, FORMATOS_TEXTO.MAYUSCULA_INICIAL_TODO);
}

/** Reglas de campo por nombre (backend y utilidades). */
export function debeAplicarFormatoTextoCampo(fieldName) {
  if (!fieldName) return false;
  const k = String(fieldName).toLowerCase();

  if (CLAVES_SIN_FORMATO.test(k)) return false;
  if (/(^|_)id$/.test(k) || k.endsWith("_id")) return false;
  if (/^fd_|fecha|hora/.test(k)) return false;
  if (/^fn_|^fi_/.test(k)) return false;
  if (/^tipo$|^estado$|^granja$|^tipo_/.test(k)) return false;
  if (/cantidad|precio|monto|saldo|numero|num_|peso|ph|temperatura|mortalidad|ratio|talla|volumen|duracion|indice|alcalinidad|dureza|turbidez|oxigeno|amoniaco|nitrito|nitrate/.test(k)) {
    return false;
  }

  if (k.startsWith("fc_") && !/fc_(correo|email|rfc|tipo|uap)/.test(k)) return true;

  return /nombre|razon|contacto|localidad|direccion|observacion|motivo|procedencia|familia|genetica|producto|marca|modelo|descripcion|comentario|empresa|instalacion|area|cargo|visitante|medicamento|insumo|equipo|fabricante|serie|notas|detalle|parentesco|documento|lote|departamento|puesto|categoria|origen|destino|trampa|parametro|plaga|bano|recambio|recepcion|biometria|vacacion|acta|cuenta|proveedor|cliente|ubicacion|unidad|pileta|reproductor|engorda|alevin|incubacion|evento|siembra|venta|tecnico|responsable|autor|empresa|procedencia|instalacion|granja/.test(
    k,
  );
}
