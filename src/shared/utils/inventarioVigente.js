/**
 * Vista actual de inventario: un registro por pileta (el más reciente por id).
 * El historial completo vive en trazabilidad / registros periódicos en BD.
 */

export function vistaActualPorPileta(rows) {
  const byPileta = new Map();
  for (const r of rows) {
    const pid = r.pileta_id ?? r.fi_pileta_destino_id ?? r.pileta_destino_id;
    if (pid == null) continue;
    const prev = byPileta.get(pid);
    const id = Number(r.fi_id ?? r.id ?? 0);
    const prevId = prev ? Number(prev.fi_id ?? prev.id ?? 0) : -1;
    if (!prev || id >= prevId) byPileta.set(pid, r);
  }
  return Array.from(byPileta.values());
}
