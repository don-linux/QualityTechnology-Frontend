import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import { createRegistro, listClientes } from "../services/listaEsperaService";

const REQUIRED_FIELDS = [
  "fd_fecha_entrega",
  "fc_uap_asignada",
  "fc_granja_asignada",
  "fn_cantidad",
  "fc_cliente",
  "fc_lugar_entrega",
  "fc_unidad_produccion",
  "fc_hora_embolsado",
  "fc_hora_entrega",
  "fn_precio_venta",
];

function stockPileta(p) {
  return Number(p?.cantidad ?? p?.fn_cantidad ?? 0);
}

function formatStock(num) {
  return Number(num ?? 0).toLocaleString("en-US");
}

function ventaRequierePileta(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  return t === "ALEVIN" || t === "ALEVINES" || t === "KG" || t === "MOJARRA_KG";
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyForm(defaults = {}, nombreUsuario = "") {
  return {
    fd_fecha_entrega: defaults.fd_fecha_entrega ?? hoyISO(),
    fc_uap_asignada: defaults.fc_uap_asignada ?? "",
    fc_granja_asignada: defaults.fc_granja_asignada ?? "",
    pileta_origen_id: defaults.pileta_origen_id ? String(defaults.pileta_origen_id) : "",
    fn_cantidad: defaults.fn_cantidad ?? "",
    fc_cliente: defaults.fc_cliente ?? "",
    fc_lugar_entrega: defaults.fc_lugar_entrega ?? "",
    fc_unidad_produccion: defaults.fc_unidad_produccion ?? "",
    fc_hora_embolsado: defaults.fc_hora_embolsado ?? "",
    fc_hora_entrega: defaults.fc_hora_entrega ?? "",
    fn_precio_venta: defaults.fn_precio_venta ?? "",
    fc_encargado_venta: defaults.fc_encargado_venta ?? nombreUsuario,
  };
}

export default function ProximaVentaModal({
  open,
  onClose,
  onCreated,
  defaults = {},
  piletas = [],
  lockTipoVenta = false,
  lockGranja = false,
}) {
  const showSnackbar = useSnackbar();
  const { nombre: nombreUsuario } = useAuth();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  const [form, setForm] = useState(() => buildEmptyForm(defaults, nombreUsuario));
  const [clientes, setClientes] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const wasOpenRef = useRef(false);

  const cargarClientes = useCallback(async () => {
    try {
      const res = await listClientes();
      setClientes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
      setClientes([]);
    }
  }, []);

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      clearErrors();
      setForm(buildEmptyForm(defaults, nombreUsuario));
      cargarClientes();
    }
    wasOpenRef.current = open;
  }, [open, defaults, nombreUsuario, clearErrors, cargarClientes]);

  const piletaOrigenSeleccionada = useMemo(() => {
    if (!form.pileta_origen_id) return null;
    return (
      piletas.find(
        (p) => String(p.fi_pileta_id ?? p.pileta_id) === String(form.pileta_origen_id),
      ) ?? null
    );
  }, [form.pileta_origen_id, piletas]);

  const cantidadPedido = Number(form.fn_cantidad ?? 0);
  const stockOrigen = piletaOrigenSeleccionada != null ? stockPileta(piletaOrigenSeleccionada) : null;
  const requiereValidacionStock =
    ventaRequierePileta(form.fc_uap_asignada) && Boolean(form.pileta_origen_id);
  const cantidadExcedeStock =
    requiereValidacionStock
    && stockOrigen != null
    && cantidadPedido > 0
    && cantidadPedido > stockOrigen;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const validarPiletaYCantidad = () => {
    if (ventaRequierePileta(form.fc_uap_asignada) && !form.pileta_origen_id) {
      showSnackbar("Seleccione la pileta de origen para ventas de alevines o mojarra.", "warning");
      return false;
    }
    if (cantidadExcedeStock) {
      showSnackbar(
        `Stock insuficiente: disponible ${formatStock(stockOrigen)}, pedido ${formatStock(cantidadPedido)}`,
        "error",
      );
      return false;
    }
    return true;
  };

  const registrar = async () => {
    if (!validate(form, REQUIRED_FIELDS)) return;
    if (!validarPiletaYCantidad()) return;

    setGuardando(true);
    try {
      const res = await createRegistro(form);
      showSnackbar("Próxima venta registrada", "success");
      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "Error al registrar próxima venta", "error");
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaPileta = (p) => `${p.nombre} — ${formatStock(stockPileta(p))} org.`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registrar próxima venta</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
          Los campos de granja, tipo de venta y pileta se completan según el movimiento en curso.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de entrega"
              name="fd_fecha_entrega"
              value={form.fd_fecha_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fd_fecha_entrega}
              helperText={errors.fd_fecha_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth error={!!errors.fc_uap_asignada}>
              <InputLabel>Tipo de venta</InputLabel>
              <Select
                name="fc_uap_asignada"
                value={form.fc_uap_asignada}
                onChange={handleChange}
                label="Tipo de venta"
                disabled={lockTipoVenta}
              >
                <MenuItem value="ALEVIN">Alevines (por pieza)</MenuItem>
                <MenuItem value="KG">Mojarra (por Kg)</MenuItem>
              </Select>
              {errors.fc_uap_asignada && <FormHelperText>{errors.fc_uap_asignada}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Granja"
              name="fc_granja_asignada"
              value={form.fc_granja_asignada}
              onChange={handleChange}
              slotProps={{ input: { readOnly: lockGranja } }}
              error={!!errors.fc_granja_asignada}
              helperText={errors.fc_granja_asignada}
            />
          </Grid>

          {ventaRequierePileta(form.fc_uap_asignada) && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Pileta origen"
                name="pileta_origen_id"
                value={form.pileta_origen_id}
                onChange={handleChange}
                error={cantidadExcedeStock}
                helperText={
                  cantidadExcedeStock
                    ? `Stock insuficiente: disponible ${formatStock(stockOrigen)}`
                    : piletas.length === 0
                      ? "No hay piletas con stock en esta granja"
                      : "Referencia para el egreso en trazabilidad"
                }
              >
                <MenuItem value="">— Seleccionar —</MenuItem>
                {piletas.map((p) => (
                  <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                    {etiquetaPileta(p)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Cantidad"
              name="fn_cantidad"
              value={form.fn_cantidad}
              onChange={handleChange}
              error={!!errors.fn_cantidad || cantidadExcedeStock}
              helperText={
                errors.fn_cantidad
                || (requiereValidacionStock && stockOrigen != null
                  ? `Máximo disponible: ${formatStock(stockOrigen)} organismos`
                  : undefined)
              }
              inputProps={
                requiereValidacionStock && stockOrigen != null && stockOrigen > 0
                  ? { min: 1, max: stockOrigen }
                  : { min: 1 }
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              freeSolo
              fullWidth
              options={clientes}
              getOptionLabel={(o) => (typeof o === "string" ? o : o.fc_razon_social || "")}
              value={form.fc_cliente}
              onChange={(e, val) => {
                setForm((prev) => ({
                  ...prev,
                  fc_cliente: typeof val === "string" ? val : val?.fc_razon_social || "",
                }));
                clearFieldError("fc_cliente");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  error={!!errors.fc_cliente}
                  helperText={errors.fc_cliente}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Lugar de entrega"
              name="fc_lugar_entrega"
              value={form.fc_lugar_entrega}
              onChange={handleChange}
              error={!!errors.fc_lugar_entrega}
              helperText={errors.fc_lugar_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Unidad de producción"
              name="fc_unidad_produccion"
              value={form.fc_unidad_produccion}
              onChange={handleChange}
              error={!!errors.fc_unidad_produccion}
              helperText={errors.fc_unidad_produccion}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora embolsado"
              name="fc_hora_embolsado"
              value={form.fc_hora_embolsado}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fc_hora_embolsado}
              helperText={errors.fc_hora_embolsado}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora entrega"
              name="fc_hora_entrega"
              value={form.fc_hora_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fc_hora_entrega}
              helperText={errors.fc_hora_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="Precio unitario"
              name="fn_precio_venta"
              value={form.fn_precio_venta}
              onChange={handleChange}
              error={!!errors.fn_precio_venta}
              helperText={errors.fn_precio_venta}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={registrar} disabled={guardando}>
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
