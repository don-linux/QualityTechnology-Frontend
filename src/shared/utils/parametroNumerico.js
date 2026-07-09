/**
 * @param {*} valor
 * @returns {boolean}
 */
export function esNoAplica(valor) {
  if (valor == null || valor === "") return false;
  return Number(valor) === 0;
}

/**
 * @param {*} valor
 * @param {(n: number) => string} [formatNum]
 * @returns {string}
 */
export function formatParametroNumerico(valor, formatNum = (n) => String(n)) {
  if (esNoAplica(valor)) return "N/A";
  if (valor == null || valor === "") return "—";
  return formatNum(Number(valor));
}

/**
 * @param {*} valor
 * @param {boolean} noAplica
 * @returns {number|string}
 */
export function parametroNumericoToPayload(valor, noAplica) {
  if (noAplica) return 0;
  if (valor === "" || valor == null) return "";
  return Number(valor);
}
