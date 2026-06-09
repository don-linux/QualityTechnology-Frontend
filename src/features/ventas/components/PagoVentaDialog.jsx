import React, { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import CampoNumerico from "@shared/components/CampoNumerico";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { listCuentasActivas } from "@features/catalogos/services/cuentasService";
import {
  listPagosVenta,
  registrarPagoVenta,
  anularPagoVenta,
} from "../services/ventasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import { formatPrecio } from "@shared/utils/formatters";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

export default function PagoVentaDialog({ open, venta, onClose, onPagoRegistrado }) {
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  const [cuentas, setCuentas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [formData, setFormData] = useState({
    fd_fecha: hoyISO(),
    fc_cuenta: "",
    fn_monto: "",
    fc_observaciones: "",
  });

  const requiredFields = ["fd_fecha", "fc_cuenta", "fn_monto"];
  const adeudo = Number(venta?.fn_adeudo ?? venta?.monto_adeudo ?? 0);
  const liquidada = venta?.fc_estado_pago === "LIQUIDADO";

  const cargarDatos = useCallback(async () => {
    if (!venta?.fi_venta_id) return;
    try {
      const [resCuentas, resPagos] = await Promise.all([
        listCuentasActivas(),
        listPagosVenta(venta.fi_venta_id),
      ]);
      setCuentas(resCuentas.data ?? []);
      setPagos(resPagos.data ?? []);
    } catch (err) {
      console.error(err);
      showSnackbar("Error al cargar datos del pago", "error");
    }
  }, [venta?.fi_venta_id, showSnackbar]);

  useEffect(() => {
    if (!open) return;
    clearErrors();
    setFormData({
      fd_fecha: hoyISO(),
      fc_cuenta: "",
      fn_monto: adeudo > 0 ? String(adeudo) : "",
      fc_observaciones: "",
    });
    cargarDatos();
  }, [open, venta, adeudo, cargarDatos, clearErrors]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value ?? "" }));
    clearFieldError(e.target.name);
  };

  const handleSubmit = async () => {
    if (!validate(formData, requiredFields)) return;

    const monto = Number(formData.fn_monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      showSnackbar("El monto debe ser mayor a cero", "error");
      return;
    }
    if (monto > adeudo) {
      showSnackbar(`El monto no puede exceder el adeudo (${formatPrecio(adeudo)})`, "error");
      return;
    }

    try {
      await registrarPagoVenta(venta.fi_venta_id, formData);
      showSnackbar("Pago registrado correctamente", "success");
      onPagoRegistrado?.();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error ?? "Error al registrar el pago";
      showSnackbar(msg, "error");
    }
  };

  const handleAnular = async (movId) => {
    if (!await confirm("¿Anular este pago? Se revertirá el abono y el saldo de la cuenta.")) return;
    try {
      await anularPagoVenta(venta.fi_venta_id, movId);
      showSnackbar("Pago anulado correctamente", "success");
      onPagoRegistrado?.();
      await cargarDatos();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error ?? "Error al anular el pago";
      showSnackbar(msg, "error");
    }
  };

  if (!venta) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>
          Registrar pago — {venta.fc_folio || `Venta #${venta.fi_venta_id}`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cliente: {venta.fc_cliente} · Total: {formatPrecio(venta.fn_monto_total)} ·
            Abonado: {formatPrecio(venta.fn_abonado)} · Adeudo: {formatPrecio(adeudo)}
          </Typography>

          {!liquidada && (
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Fecha"
                  type="date"
                  name="fd_fecha"
                  value={formData.fd_fecha}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fd_fecha}
                  helperText={errors.fd_fecha}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  select
                  label="Cuenta"
                  name="fc_cuenta"
                  value={formData.fc_cuenta}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fc_cuenta}
                  helperText={errors.fc_cuenta}
                >
                  {cuentas.map((cuenta) => (
                    <MenuItem key={cuenta.fi_cuenta_id} value={cuenta.fc_nombre}>
                      {cuenta.fc_nombre} — {formatPrecio(cuenta.fn_saldo_actual)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={6}>
                <CampoNumerico
                  label="Monto"
                  prefix="$" decimalScale={2}
                  name="fn_monto"
                  value={formData.fn_monto}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0.01, max: adeudo, step: 0.01 }}
                  error={!!errors.fn_monto}
                  helperText={errors.fn_monto || `Máximo: ${formatPrecio(adeudo)}`}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Observaciones"
                  name="fc_observaciones"
                  value={formData.fc_observaciones}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  minRows={2}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${(formData.fc_observaciones || "").length}/500`}
                />
              </Grid>
            </Grid>
          )}

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: "bold" }}>
            Historial de pagos
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Cuenta</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Sin pagos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                pagos.map((p) => (
                  <TableRow key={p.fi_movimiento_id}>
                    <TableCell>{String(p.fd_fecha).slice(0, 10)}</TableCell>
                    <TableCell align="right">{formatPrecio(p.fn_ingreso)}</TableCell>
                    <TableCell>{p.fc_cuenta}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <span title={p.fc_observaciones}>{truncar(p.fc_observaciones)}</span>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Anular pago"
                        onClick={() => handleAnular(p.fi_movimiento_id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
          {!liquidada && (
            <Button onClick={handleSubmit} variant="contained" color="success">
              Registrar pago
            </Button>
          )}
        </DialogActions>
      </Dialog>
      {ConfirmModal}
    </>
  );
}
