import React, { useEffect, useState, useCallback } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import { listMovimientos } from "../services/flujoCajaService";
import { openUpload } from "@shared/lib/uploadUrl";
import useSnackbar from "@shared/hooks/useSnackbar";
import { formatFecha, formatPrecio } from "@shared/utils/formatters";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

function TablaMovimientos({ movimientos }) {
  const showSnackbar = useSnackbar();
  const verFactura = async (ruta) => {
    try {
      await openUpload(ruta);
    } catch {
      showSnackbar("No se pudo abrir la factura", "error");
    }
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ background: "#f0f0f0" }}>
          <TableRow>
            <TableCell><b>Fecha</b></TableCell>
            <TableCell align="right"><b>Ingreso</b></TableCell>
            <TableCell align="right"><b>Egreso</b></TableCell>
            <TableCell><b>Observaciones</b></TableCell>
            <TableCell><b>Cuenta</b></TableCell>
            <TableCell><b>Categoria</b></TableCell>
            <TableCell><b>Subcategoria</b></TableCell>
            <TableCell><b>Beneficiario</b></TableCell>
            <TableCell><b>Proyecto</b></TableCell>
            <TableCell><b>Factura</b></TableCell>
            <TableCell><b>Estatus</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((row) => (
            <TableRow key={row.fi_movimiento_id}>
              <TableCell>{formatFecha(row.fd_fecha)}</TableCell>
              <TableCell align="right">{formatPrecio(row.fn_ingreso)}</TableCell>
              <TableCell align="right">{formatPrecio(row.fn_egreso)}</TableCell>
              <TableCell sx={{ maxWidth: 200 }}>
                <span title={row.fc_observaciones}>{truncar(row.fc_observaciones)}</span>
              </TableCell>
              <TableCell>{row.fc_cuenta}</TableCell>
              <TableCell>{row.fc_categoria}</TableCell>
              <TableCell>{row.fc_subcategoria}</TableCell>
              <TableCell>{row.fc_beneficiario}</TableCell>
              <TableCell>{row.fc_noproyecto}</TableCell>
              <TableCell>
                {row.fc_factura && row.fc_factura !== "NO" ? (
                  <Link
                    component="button"
                    type="button"
                    onClick={() => verFactura(row.fc_factura)}
                    sx={{
                      color: "#1D5C42",
                      fontWeight: "bold",
                      textDecoration: "none",
                    }}
                  >
                     Ver factura
                  </Link>
                ) : row.fc_factura === "NO" ? (
                  "No aplica"
                ) : (
                  "Pendiente"
                )}
              </TableCell>
              <TableCell>{row.fc_estatus}</TableCell>
            </TableRow>
          ))}
          {movimientos.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} align="center">
                No hay movimientos registrados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function FlujoCaja() {
  const [movimientos, setMovimientos] = useState([]);
  const showSnackbar = useSnackbar();

  // =====================================================
  //  Cargar datos
  // =====================================================
  const obtenerMovimientos = useCallback(async () => {
    try {
      const res = await listMovimientos();
      setMovimientos(res.data || []);
    } catch (err) {
      console.error(" Error al obtener movimientos:", err);
      showSnackbar("Error al obtener los movimientos", "error");
    }
  }, []);

  useEffect(() => {
    obtenerMovimientos();
  }, [obtenerMovimientos]);

  // =====================================================
  //  Exportar Excel
  // =====================================================
  const exportarExcel = async () => {
    const { default: ExcelJS } = await import("exceljs");
    const { saveAs } = await import("file-saver");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("FlujoCaja");
    if (movimientos.length > 0) {
      ws.columns = Object.keys(movimientos[0]).map((key) => ({ header: key, key }));
      ws.addRows(movimientos);
    }
    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `FlujoCaja.xlsx`);
  };

  // =====================================================
  //  Render Principal
  // =====================================================
  return (
    <Container maxWidth="xl" sx={{ mt: 0, p: 0 }}>
      <Box sx={{ width: "100%", background: "#0D4D3A", padding: "20px 30px", mb: 2 }}>
        <Typography variant="h4" sx={{ color: "white", fontWeight: "bold" }}>
           Módulo de Flujo de Caja — Sistema Quality
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" sx={{ background: "#1D5C42" }} onClick={exportarExcel}>
            Exportar Excel
          </Button>
        </Box>

        <TablaMovimientos movimientos={movimientos} />
      </Box>
    </Container>
  );
}
