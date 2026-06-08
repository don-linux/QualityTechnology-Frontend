import React, { useState, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import {
  listClientesFlujo,
  listProveedoresFlujo,
} from "../services/flujoCajaService";
import { listVentas } from "../services/ventasService";
import { listCuentasActivas } from "@features/catalogos/services/cuentasService";

const FormDialog = React.memo(
  ({ open, onClose, onSubmit, formData, setFormData, editId, errors = {}, clearFieldError, clearErrors, validate, requiredFields = [] }) => {
    const [clientes, setClientes] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [cuentas, setCuentas] = useState([]);
    const [ventasPendientes, setVentasPendientes] = useState([]);

    const fetchDatos = useCallback(async () => {
      try {
        const [resClientes, resProveedores, resCuentas, resVentas] = await Promise.all([
          listClientesFlujo(),
          listProveedoresFlujo(),
          listCuentasActivas(),
          listVentas(),
        ]);
        setClientes(resClientes.data);
        setProveedores(resProveedores.data);
        setCuentas(resCuentas.data);
        setVentasPendientes(
          (resVentas.data ?? []).filter(
            (v) => v.fc_estado_pago === "ADEUDO" || v.fc_estado_pago === "PARCIAL"
          )
        );
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    }, []);

    const handleChange = (e) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value ?? "" }));
      if (clearFieldError) clearFieldError(e.target.name);
    };

    const handleSave = () => {
      if (validate && !validate(formData, requiredFields)) return;
      onSubmit(formData);
    };

    const formatMoneda = (valor) =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }).format(Number(valor) || 0);

    const ventaLigada =
      formData.tipo_transaccion === "INGRESO" && !!formData.fi_venta_id;
    const ventaSel = ventasPendientes.find(
      (v) => String(v.fi_venta_id) === String(formData.fi_venta_id)
    );

    const handleVentaChange = (e) => {
      const ventaId = e.target.value;
      const venta = ventasPendientes.find(
        (v) => String(v.fi_venta_id) === String(ventaId)
      );
      setFormData((prev) => ({
        ...prev,
        fi_venta_id: ventaId,
        ...(venta ? { fn_monto: String(venta.fn_adeudo) } : {}),
      }));
      if (clearFieldError) clearFieldError("fi_venta_id");
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth TransitionProps={{ onEnter: () => { fetchDatos(); if (clearErrors) clearErrors(); } }}>
        <DialogTitle>{editId ? "Editar Movimiento" : "Nuevo Movimiento"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={6}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                value={formData.fd_fecha || ""}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            {/*  Select de cuentas */}
            <Grid size={6}>
              <TextField
                select
                label="Cuenta"
                name="fc_cuenta"
                value={formData.fc_cuenta || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_cuenta}
                helperText={errors.fc_cuenta}
              >
                {cuentas.map((cuenta) => (
                  <MenuItem key={cuenta.fi_cuenta_id} value={cuenta.fc_nombre}>
                    {cuenta.fc_nombre} — ${parseFloat(cuenta.fn_saldo_actual).toLocaleString("es-MX")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField
                select
                label="Tipo de transacción"
                name="tipo_transaccion"
                value={formData.tipo_transaccion || ""}
                onChange={(e) => {
                  const tipo = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    tipo_transaccion: tipo,
                    fc_beneficiario: "",
                    fi_venta_id: tipo === "INGRESO" ? prev.fi_venta_id : "",
                  }));
                  if (clearFieldError) clearFieldError("tipo_transaccion");
                }}
                fullWidth
                margin="dense"
                error={!!errors.tipo_transaccion}
                helperText={errors.tipo_transaccion}
              >
                <MenuItem value="INGRESO">Ingreso</MenuItem>
                <MenuItem value="EGRESO">Egreso</MenuItem>
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField
                label="Monto"
                type="number"
                name="fn_monto"
                value={formData.fn_monto || ""}
                onChange={handleChange}
                disabled={!formData.tipo_transaccion}
                fullWidth
                margin="dense"
                inputProps={{
                  min: 0,
                  step: "0.01",
                  ...(ventaSel ? { max: Number(ventaSel.fn_adeudo) } : {}),
                }}
                error={!!errors.fn_monto}
                helperText={
                  errors.fn_monto ||
                  (ventaSel ? `Adeudo de la venta: ${formatMoneda(ventaSel.fn_adeudo)}` : "")
                }
              />
            </Grid>

            {formData.tipo_transaccion === "INGRESO" && (
              <Grid size={12}>
                <TextField
                  select
                  label="Venta a liquidar (opcional)"
                  name="fi_venta_id"
                  value={formData.fi_venta_id || ""}
                  onChange={handleVentaChange}
                  fullWidth
                  margin="dense"
                  disabled={!!editId}
                  helperText={
                    ventaSel
                      ? "Se registrará como pago de esta venta: actualiza su abono y estado."
                      : "Selecciona una venta pendiente para aplicar este ingreso como su pago."
                  }
                >
                  <MenuItem value="">— Ninguna —</MenuItem>
                  {ventasPendientes.map((v) => (
                    <MenuItem key={v.fi_venta_id} value={v.fi_venta_id}>
                      {v.fc_folio || `Venta #${v.fi_venta_id}`} — {v.fc_cliente} — Adeudo {formatMoneda(v.fn_adeudo)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                label="Descripción"
                name="fc_descripcion"
                value={formData.fc_descripcion || ""}
                onChange={handleChange}
                fullWidth
                multiline
                error={!!errors.fc_descripcion}
                helperText={errors.fc_descripcion}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                value={formData.fc_observaciones || ""}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                inputProps={{ maxLength: 500 }}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${(formData.fc_observaciones || "").length}/500`}
              />
            </Grid>

            {ventaLigada && (
              <Grid size={12}>
                <Alert severity="info">
                  Este ingreso se registrará como pago de la venta seleccionada; la
                  categoría, el beneficiario y el estatus se asignan automáticamente.
                </Alert>
              </Grid>
            )}

            {!ventaLigada && (
            <>
            <Grid size={6}>
              <TextField
                label="Categoría"
                name="fc_categoria"
                value={formData.fc_categoria || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_categoria}
                helperText={errors.fc_categoria}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                label="Subcategoría"
                name="fc_subcategoria"
                value={formData.fc_subcategoria || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_subcategoria}
                helperText={errors.fc_subcategoria}
              />
            </Grid>

            {/*  Beneficiario dinámico */}
            <Grid size={12}>
              <TextField
                select
                label="Beneficiario / Proveedor"
                name="fc_beneficiario"
                value={formData.fc_beneficiario || ""}
                onChange={handleChange}
                fullWidth
                disabled={!formData.tipo_transaccion}
                error={!!errors.fc_beneficiario}
                helperText={errors.fc_beneficiario}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff !important",
                        color: "#000000 !important",
                        "& .MuiMenuItem-root": {
                          color: "#000000 !important",
                          "&:hover": {
                            backgroundColor: "#f5f5f5 !important",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {formData.tipo_transaccion === "INGRESO" &&
                  clientes.map((cli) => (
                    <MenuItem key={cli.nombre} value={cli.nombre}>
                      {cli.nombre}
                    </MenuItem>
                  ))}

                {formData.tipo_transaccion === "EGRESO" &&
                  proveedores.map((prov) => (
                    <MenuItem key={prov.nombre} value={prov.nombre}>
                      {prov.nombre}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid size={6}>
              <TextField
                label="Proyecto"
                name="fc_noproyecto"
                value={formData.fc_noproyecto || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_noproyecto}
                helperText={errors.fc_noproyecto}
              />
            </Grid>
{/*  Menú de factura con 3 opciones */}
<Grid size={6}>
  <TextField
    select
    label="Factura"
    name="fc_factura_opcion"
    value={formData.fc_factura_opcion || ""}
    onChange={(e) => {
      const opcion = e.target.value;
      setFormData((prev) => ({
        ...prev,
        fc_factura_opcion: opcion,
        fc_factura:
          opcion === "NO_APLICA"
            ? "NO"
            : opcion === "PENDIENTE"
            ? ""
            : prev.fc_factura,
        facturaFile: opcion === "CON_FACTURA" ? prev.facturaFile : null,
      }));
      if (clearFieldError) clearFieldError("fc_factura_opcion");
    }}
    fullWidth
    error={!!errors.fc_factura_opcion}
    helperText={errors.fc_factura_opcion}
  >
    <MenuItem value="APLICA">Con factura</MenuItem>
    <MenuItem value="PENDIENTE">Pendiente</MenuItem>
    <MenuItem value="NO_APLICA">No aplica</MenuItem>
  </TextField>
</Grid>

    {/*  Mostrar botón de carga solo si elige "Con factura" */}
    {formData.fc_factura_opcion === "APLICA" && (
      <Grid size={6}>
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ textTransform: "none" }}
        >
          {formData.facturaFile ? formData.facturaFile.name : "Subir factura"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                facturaFile: e.target.files[0],
              }))
            }
          />
        </Button>
      </Grid>
    )}
            <Grid size={6}>
              <TextField
                select
                label="Estatus"
                name="fc_estatus"
                value={formData.fc_estatus || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_estatus}
                helperText={errors.fc_estatus}
              >
                <MenuItem value="REPOSICION">Reposición</MenuItem>
                <MenuItem value="LIQUIDADO">Liquidado</MenuItem>
                <MenuItem value="ADEUDO">Adeudo</MenuItem>
                <MenuItem value="PARCIAL">Parcial</MenuItem>
              </TextField>
            </Grid>
            </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="success">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

export default FormDialog;
