import React, { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Button from "@mui/material/Button";
import { listVentas } from "../services/ventasService";
import PagoVentaDialog from "./PagoVentaDialog";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import { formatFecha, formatPrecio } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

const colorEstado = {
  ADEUDO: "red",
  PARCIAL: "orange",
  LIQUIDADO: "green",
  PAGADO: "green",
};

export default function Venta() {
  const showSnackbar = useSnackbar();
  const { granja } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);

  const filas = useMemo(() => ordenarYNumerar(ventas, ["fi_venta_id"]), [ventas]);

  const obtenerVentas = useCallback(async () => {
    try {
      const res = await listVentas();
      setVentas(res.data);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al cargar ventas", "error");
    }
  }, [showSnackbar]);

  useEffect(() => {
    obtenerVentas();
  }, [obtenerVentas]);

  const abrirDialogoPago = (venta) => {
    setVentaSeleccionada(venta);
    setDialogoPagoAbierto(true);
  };

  const cerrarDialogoPago = () => {
    setDialogoPagoAbierto(false);
    setVentaSeleccionada(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
        Control de Ventas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {granja === "ALL"
          ? "Se muestran las ventas de todas las unidades de negocio."
          : `Solo se muestran las ventas de tu unidad de negocio (${granja}).`}
      </Typography>

      <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 1300 }}>
            <TableHead sx={{ backgroundColor: "#006d77" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Locación</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Folio</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Razón Social</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cant.</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Precio</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Total</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Abonado</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Adeudo</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Encargado</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observaciones</TableCell>
                <TableCell align="center" sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                filas.map((v) => (
                  <TableRow key={v.fi_venta_id}>
                    <TableCell>{v._num}</TableCell>
                    <TableCell>{v.fc_locacion ?? v.fc_empresa}</TableCell>
                    <TableCell>{formatFecha(v.fd_fecha_venta)}</TableCell>
                    <TableCell>{v.fc_folio}</TableCell>
                    <TableCell>{v.fc_cliente}</TableCell>
                    <TableCell>{v.fc_tipo_venta}</TableCell>
                    <TableCell>{v.fn_cantidad_vendida}</TableCell>
                    <TableCell>{formatPrecio(v.fn_precio_venta)}</TableCell>
                    <TableCell>{formatPrecio(v.fn_monto_total)}</TableCell>
                    <TableCell>{formatPrecio(v.fn_abonado)}</TableCell>
                    <TableCell>{formatPrecio(v.fn_adeudo)}</TableCell>
                    <TableCell>
                      <b style={{ color: colorEstado[v.fc_estado_pago] }}>
                        {v.fc_estado_pago}
                      </b>
                    </TableCell>
                    <TableCell>{v.fc_encargado_venta}</TableCell>
                    <TableCell>{v.fc_observaciones || "-"}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => abrirDialogoPago(v)}
                      >
                        {v.fc_estado_pago === "LIQUIDADO" ? "Ver pagos" : "Registrar pago"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <PagoVentaDialog
        open={dialogoPagoAbierto}
        venta={ventaSeleccionada}
        onClose={cerrarDialogoPago}
        onPagoRegistrado={obtenerVentas}
      />
    </Box>
  );
}
