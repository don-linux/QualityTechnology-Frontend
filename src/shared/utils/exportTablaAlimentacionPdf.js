export async function exportTablaAlimentacionPdf(tabla, { getLogo } = {}) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("l", "mm", "a4");
  const margen = 14;
  let y = 16;

  try {
    const logo = getLogo?.(tabla.empresa || tabla.locacion);
    if (logo) {
      doc.addImage(logo, "PNG", margen, 8, 28, 14);
      y = 26;
    }
  } catch {
    // Logo opcional
  }

  doc.setFontSize(14);
  doc.text("Tabla de alimentacion diaria", margen, y);
  y += 8;
  doc.setFontSize(10);
  doc.text(`Cliente: ${tabla.cliente ?? ""}`, margen, y);
  y += 5;
  doc.text(`Folio: ${tabla.folio ?? ""}`, margen, y);
  y += 5;
  doc.text(`Cantidad vendida: ${tabla.cantidad ?? ""}`, margen, y);
  y += 5;
  doc.text(`Base de escala: ${tabla.cantidad_base ?? 18500} organismos`, margen, y);
  y += 5;
  doc.text(`Factor: ${tabla.factor_escala ?? ""}`, margen, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [[
      "Dia",
      "Tipo alimento",
      "Peso prom. (g)",
      "Biomasa (kg)",
      "% alimentacion",
      "Kg alimento/dia",
    ]],
    body: (tabla.filas ?? []).map((f) => [
      f.dia,
      f.tipo_alimento ?? "",
      f.peso_promedio_g ?? "",
      f.biomasa_kg ?? "",
      f.tasa_alimentacion_pct ?? "",
      f.kg_alimento_dia ?? "",
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 109, 119] },
  });

  const cliente = String(tabla.cliente ?? "cliente").replace(/[^\w\s-]/g, "").slice(0, 40);
  const folio = String(tabla.folio ?? "venta").replace(/[^\w-]/g, "");
  doc.save(`Tabla_Alimentacion_${cliente}_${folio}.pdf`);
}
