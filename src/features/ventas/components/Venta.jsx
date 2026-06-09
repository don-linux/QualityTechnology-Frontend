import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Button from "@mui/material/Button";
import { listVentas } from "../services/ventasService";
import PagoVentaDialog from "./PagoVentaDialog";
import useSnackbar from "@shared/hooks/useSnackbar";
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
  const [ventas, setVentas] = useState([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [dialogoPagoAbierto, setDialogoPagoAbierto] = useState(false);

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
      <Card sx={{ p: 2 }}>
        <Typography variant="h5" mb={2} fontWeight="bold">
          Control de Ventas
        </Typography>

        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1300 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Locación</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Folio</TableCell>
                <TableCell>Razón Social</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Cant.</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Abonado</TableCell>
                <TableCell>Adeudo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Encargado</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {ventas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} align="center">
                    No hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : (
                ordenarYNumerar(ventas, ["fi_venta_id"]).map((v) => (
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
        </Box>
      </Card>

      <PagoVentaDialog
        open={dialogoPagoAbierto}
        venta={ventaSeleccionada}
        onClose={cerrarDialogoPago}
        onPagoRegistrado={obtenerVentas}
      />
    </Box>
  );
}
