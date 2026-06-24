import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

/**
 * Color homogéneo para el encabezado de TODAS las tablas de listado.
 * Cambiarlo aquí lo cambia en toda la app.
 */
export const LISTADO_HEAD_BG = "#1565C0";
export const LISTADO_HEAD_COLOR = "#FFFFFF";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const valorCrudo = (col, row) => {
  if (typeof col.value === "function") return col.value(row);
  if (col.key) return row[col.key];
  return "";
};

const textoCelda = (col, row) => {
  const v = valorCrudo(col, row);
  return v === null || v === undefined ? "" : String(v);
};

const renderContenido = (col, row) => {
  if (typeof col.render === "function") return col.render(row);
  if (col.truncate) {
    const texto = textoCelda(col, row);
    if (!texto) return col.fallback ?? "";
    return <span title={texto}>{truncar(texto)}</span>;
  }
  const v = valorCrudo(col, row);
  return v === null || v === undefined || v === "" ? col.fallback ?? "" : v;
};

/**
 * Tabla de listado homogénea (patrón Paper + TableContainer con scroll
 * horizontal). Una sola definición de `columnas` sirve para la tabla y para la
 * exportación (Excel/PDF), porque comparten el descriptor `{ header, value }`.
 *
 * Cada columna acepta:
 * - `header`: título de la columna.
 * - `value(row)`: valor crudo (lo que se exporta).
 * - `render(row)`: contenido JSX de la celda (opcional; si falta usa `value`).
 * - `truncate`: muestra el texto recortado con `title` completo.
 * - `align`, `maxWidth`, `cellSx`, `headerSx`: estilos puntuales.
 */
export default function ListadoTabla({
  columnas,
  filas,
  idKey = ["fi_id"],
  minWidth = 960,
  numerar = true,
  numeroHeader = "ID",
  acciones,
  accionesHeader = "Acciones",
  accionesMinWidth = 180,
  headBg = LISTADO_HEAD_BG,
  headColor = LISTADO_HEAD_COLOR,
  emptyMessage = "Sin registros",
}) {
  const data = ordenarYNumerar(filas, idKey);
  const totalColumnas =
    columnas.length + (numerar ? 1 : 0) + (acciones ? 1 : 0);

  const headCellSx = {
    color: headColor,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth }}>
          <TableHead sx={{ background: headBg }}>
            <TableRow>
              {numerar && <TableCell sx={headCellSx}>{numeroHeader}</TableCell>}
              {columnas.map((col) => (
                <TableCell
                  key={col.header}
                  align={col.align}
                  sx={{ ...headCellSx, ...col.headerSx }}
                >
                  {col.header}
                </TableCell>
              ))}
              {acciones && (
                <TableCell
                  align="center"
                  sx={{ ...headCellSx, minWidth: accionesMinWidth }}
                >
                  {accionesHeader}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumnas} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.fi_id ?? row.id ?? row._num} hover>
                  {numerar && <TableCell>{row._num}</TableCell>}
                  {columnas.map((col) => (
                    <TableCell
                      key={col.header}
                      align={col.align}
                      sx={{ ...(col.maxWidth ? { maxWidth: col.maxWidth } : {}), ...col.cellSx }}
                    >
                      {renderContenido(col, row)}
                    </TableCell>
                  ))}
                  {acciones && (
                    <TableCell
                      align="center"
                      sx={{
                        minWidth: accionesMinWidth,
                        verticalAlign: "middle",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        {acciones(row)}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
