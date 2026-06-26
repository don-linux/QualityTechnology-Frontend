/**
 * Vista actual de inventario: un registro por infraestructura física (el más reciente por id).
 * El historial completo vive en trazabilidad / registros periódicos en BD.
 */

export function vistaActualPorInfraestructuraFisica(rows) {
  const byInfraestructuraFisica = new Map();
  for (const r of rows) {
    const pid = r.infraestructura_fisica_id ?? r.infraestructura_fisica_destino_id;
    if (pid == null) continue;
    const prev = byInfraestructuraFisica.get(pid);
    const id = Number(r.id ?? 0);
    const prevId = prev ? Number(prev.id ?? 0) : -1;
    if (!prev || id >= prevId) byInfraestructuraFisica.set(pid, r);
  }
  return Array.from(byInfraestructuraFisica.values());
}
