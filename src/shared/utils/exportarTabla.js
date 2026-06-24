// Shared table export helpers (PDF + Excel) used by listado toolbars.
//
// A column descriptor is `{ header, value }` where `value` is either a
// function `(row) => string|number` or omitted in favor of `key` to read
// `row[key]` directly. Both exporters share the same descriptor so a listado
// only declares its columns once.

import { formatFecha } from "./formatters";

const COLOR_DEFECTO = [13, 71, 161];

const obtenerValor = (col, row) => {
  if (typeof col.value === "function") return col.value(row);
  if (col.key) return row[col.key];
  return "";
};

const limpiarNombreArchivo = (nombre) =>
  String(nombre || "export")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim();

const rgbToArgb = (rgb) => {
  if (!Array.isArray(rgb)) return "FF0D47A1";
  const hex = rgb
    .slice(0, 3)
    .map((n) => Number(n || 0).toString(16).padStart(2, "0"))
    .join("");
  return `FF${hex.toUpperCase()}`;
};

/**
 * Exports a table to PDF (landscape A4) with an optional logo, title/subtitle
 * and a colored header row.
 */
export async function exportarTablaPDF({
  columnas,
  filas,
  titulo,
  subtitulo,
  logo,
  color,
  nombreArchivo,
  orientacion = "l",
}) {
  if (!Array.isArray(columnas) || !columnas.length) return;

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF(orientacion, "mm", "a4");

  if (logo) {
    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {
      // Logo is optional for exported PDFs.
    }
  }

  doc.setFontSize(14);
  doc.text(String(titulo || ""), 45, 20);
  if (subtitulo) {
    doc.setFontSize(10);
    doc.text(String(subtitulo), 45, 26);
  }

  const head = [columnas.map((c) => c.header)];
  const body = filas.map((row) =>
    columnas.map((c) => {
      const v = obtenerValor(c, row);
      return v === null || v === undefined ? "" : String(v);
    }),
  );

  autoTable(doc, {
    startY: 40,
    head,
    body,
    styles: { fontSize: 7 },
    headStyles: {
      fillColor: Array.isArray(color) ? color : COLOR_DEFECTO,
      textColor: 255,
      halign: "center",
    },
  });

  const fecha = formatFecha(new Date());
  doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
  doc.save(`${limpiarNombreArchivo(nombreArchivo)}_${fecha}.pdf`);
}

/**
 * Exports a table to a styled .xlsx workbook (single sheet).
 */
export async function exportarTablaExcel({
  columnas,
  filas,
  nombreHoja = "Datos",
  nombreArchivo,
  color,
}) {
  if (!Array.isArray(columnas) || !columnas.length) return;

  const { default: ExcelJS } = await import("exceljs");
  const { saveAs } = await import("file-saver");

  const wb = new ExcelJS.Workbook();
  const hoja =
    String(nombreHoja).replace(/[\\/?*[\]:]/g, " ").slice(0, 31) || "Datos";
  const ws = wb.addWorksheet(hoja);

  ws.columns = columnas.map((c) => ({
    header: c.header,
    key: c.header,
    width: Math.min(Math.max(String(c.header || "").length + 4, 12), 42),
  }));

  filas.forEach((row) => {
    ws.addRow(
      columnas.map((c) => {
        const v = obtenerValor(c, row);
        return v === null || v === undefined ? "" : v;
      }),
    );
  });

  const encabezado = ws.getRow(1);
  encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } };
  encabezado.alignment = { vertical: "middle", horizontal: "center" };
  const argb = rgbToArgb(color);
  encabezado.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb } };
  });

  const buffer = await wb.xlsx.writeBuffer();
  const fecha = formatFecha(new Date());
  saveAs(new Blob([buffer]), `${limpiarNombreArchivo(nombreArchivo)}_${fecha}.xlsx`);
}
