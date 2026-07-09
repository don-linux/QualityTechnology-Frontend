// Shared table export helpers (PDF + Excel) used by listado toolbars.
//
// A column descriptor is `{ header, value }` where `value` is either a
// function `(row) => string|number` or omitted in favor of `key` to read
// `row[key]` directly. Both exporters share the same descriptor so a listado
// only declares its columns once.

import { formatFecha } from "./formatters";

const COLOR_DEFECTO = [13, 71, 161];
const FOOTER_Y_OFFSET = 10;
const FOOTER_FONT_SIZE = 8;
const FOOTER_COLOR = [100, 100, 100];

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

const formatearRangoFechas = (rangoFechas) => {
  if (!rangoFechas?.desde && !rangoFechas?.hasta) return "";
  const desde = rangoFechas.desde ? formatFecha(rangoFechas.desde) : "—";
  const hasta = rangoFechas.hasta ? formatFecha(rangoFechas.hasta) : "—";
  return `Registros: ${desde} al ${hasta}`;
};

/**
 * Draws a four-column footer on every page of a jsPDF document.
 */
function dibujarFooterPDF(doc, { impresoPor, rangoFechas, fechaImpresion }) {
  const totalPages = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - FOOTER_Y_OFFSET;
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const colWidth = usableWidth / 4;

  doc.setFontSize(FOOTER_FONT_SIZE);
  doc.setTextColor(...FOOTER_COLOR);

  const rangoTexto = formatearRangoFechas(rangoFechas);
  const impresoTexto = impresoPor ? `Impreso por: ${impresoPor}` : "";
  const fechaTexto = `Fecha de impresión: ${fechaImpresion}`;

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    if (impresoTexto) {
      doc.text(impresoTexto, margin, footerY, { maxWidth: colWidth - 2 });
    }
    doc.text(fechaTexto, margin + colWidth, footerY, { maxWidth: colWidth - 2 });
    if (rangoTexto) {
      doc.text(rangoTexto, margin + colWidth * 2, footerY, { maxWidth: colWidth - 2 });
    }
    doc.text(`Página ${page} de ${totalPages}`, pageWidth - margin, footerY, {
      align: "right",
    });
  }

  doc.setTextColor(0, 0, 0);
}

/**
 * Exports a table to PDF (landscape A4) with an optional logo, title/subtitle
 * and a colored header row. Footer is repeated on every page.
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
  impresoPor,
  rangoFechas,
}) {
  if (!Array.isArray(columnas) || !columnas.length) return;

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF(orientacion, "mm", "a4");
  const fechaImpresion = formatFecha(new Date());

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
    margin: { bottom: 18 },
  });

  dibujarFooterPDF(doc, { impresoPor, rangoFechas, fechaImpresion });
  doc.save(`${limpiarNombreArchivo(nombreArchivo)}_${fechaImpresion}.pdf`);
}

/**
 * Exports a table to a styled .xlsx workbook (single sheet).
 * Print footer is configured for preview/print (not visible in the grid).
 */
export async function exportarTablaExcel({
  columnas,
  filas,
  nombreHoja = "Datos",
  nombreArchivo,
  color,
  impresoPor,
  rangoFechas,
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

  const fechaImpresion = formatFecha(new Date());
  const rangoTexto = formatearRangoFechas(rangoFechas);
  const impresoTexto = impresoPor ? `Impreso por: ${impresoPor}` : "";
  const izquierda = [impresoTexto, `Fecha de impresión: ${fechaImpresion}`]
    .filter(Boolean)
    .join("  |  ");

  ws.headerFooter.oddFooter = [
    rangoTexto ? `&L${izquierda}&C${rangoTexto}&R` : `&L${izquierda}&R`,
    "Página &P de &N",
  ].join("");

  ws.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${limpiarNombreArchivo(nombreArchivo)}_${fechaImpresion}.xlsx`);
}

/**
 * Computes min/max ISO dates present in row data (informational hint).
 * Report footers should use the user-selected export period, not this helper.
 */
export function calcularRangoFechas(filas, campoFecha = "fecha") {
  if (!Array.isArray(filas) || !filas.length) return null;

  let min = null;
  let max = null;

  for (const row of filas) {
    const raw = row?.[campoFecha];
    if (!raw) continue;
    const iso = String(raw).includes("T") ? raw.split("T")[0] : String(raw).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) continue;
    if (!min || iso < min) min = iso;
    if (!max || iso > max) max = iso;
  }

  if (!min && !max) return null;
  return { desde: min, hasta: max };
}
