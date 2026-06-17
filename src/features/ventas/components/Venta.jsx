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
import { listVentas, getTablaAlimentacionVenta } from "../services/ventasService";
import { exportTablaAlimentacionPdf } from "@shared/utils/exportTablaAlimentacionPdf";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
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
  const { getLogo } = useUbicacionesGranja();
  const [tablaDialogo, setTablaDialogo] = useState(null);
  const [tablaDatos, setTablaDatos] = useState(null);
  const [cargandoTabla, setCargandoTabla] = useState(false);
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


  const abrirTablaAlimentacion = async (venta) => {
    setTablaDialogo(venta);
    setCargandoTabla(true);
    try {
      const res = await getTablaAlimentacionVenta(venta.fi_venta_id ?? venta.venta_id);
      setTablaDatos(res.data);
    } catch {
      showSnackbar("Error al generar tabla de alimentacion", "error");
      setTablaDialogo(null);
    } finally {
      setCargandoTabla(false);
    }
  };

  const cerrarTablaAlimentacion = () => {
    setTablaDialogo(null);
    setTablaDatos(null);
  };

  const descargarTablaPdf = async () => {
    if (!tablaDatos) return;
    try {
      await exportTablaAlimentacionPdf(tablaDatos, { getLogo });
    } catch {
      showSnackbar("Error al exportar PDF", "error");
    }
  };

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
          : granja === "SIN_UNIDAD"
            ? "Tu usuario no tiene una unidad de negocio asignada; no hay ventas visibles."
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
                        sx={{ mr: 1 }}
                        onClick={() => abrirTablaAlimentacion(v)}
                      >
                        Tabla alimentacion
                      </Button>
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


      <Dialog open={Boolean(tablaDialogo)} onClose={cerrarTablaAlimentacion} maxWidth="lg" fullWidth>
        <DialogTitle>Tabla de alimentacion — {tablaDialogo?.fc_folio}</DialogTitle>
        <DialogContent dividers>
          {cargandoTabla ? (
            <Typography>Cargando...</Typography>
          ) : tablaDatos ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Cliente: {tablaDatos.cliente} | Cantidad: {tablaDatos.cantidad} | Base: {tablaDatos.cantidad_base}
              </Typography>
              <TableContainer sx={{ maxHeight: 420, overflow: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Dia</TableCell>
                      <TableCell>Tipo alimento</TableCell>
                      <TableCell align="right">Peso (g)</TableCell>
                      <TableCell align="right">Biomasa (kg)</TableCell>
                      <TableCell align="right">Kg/dia</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(tablaDatos.filas ?? []).slice(0, 30).map((f) => (
                      <TableRow key={f.dia}>
                        <TableCell>{f.dia}</TableCell>
                        <TableCell>{f.tipo_alimento}</TableCell>
                        <TableCell align="right">{f.peso_promedio_g}</TableCell>
                        <TableCell align="right">{f.biomasa_kg}</TableCell>
                        <TableCell align="right">{f.kg_alimento_dia}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarTablaAlimentacion}>Cerrar</Button>
          <Button variant="contained" onClick={descargarTablaPdf} disabled={!tablaDatos}>Descargar PDF</Button>
        </DialogActions>
      </Dialog>

      <PagoVentaDialog
        open={dialogoPagoAbierto}
        venta={ventaSeleccionada}
        onClose={cerrarDialogoPago}
        onPagoRegistrado={obtenerVentas}
      />
    </Box>
  );
}
