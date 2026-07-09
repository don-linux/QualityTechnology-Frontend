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
import CampoNumerico from "@shared/components/CampoNumerico";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import { createRegistro, listClientes } from "../services/listaEsperaService";

const REQUIRED_FIELDS = [
  "fecha_entrega",
  "tipo_venta",
  "granja",
  "cantidad_peces",
  "cliente_nombre",
  "lugar_entrega",
  "unidad_produccion",
  "hora_embolsado",
  "hora_entrega",
  "precio_unitario",
];

function stockInfraestructuraFisica(p) {
  return Number(p?.cantidad ?? 0);
}

function formatStock(num) {
  return Number(num ?? 0).toLocaleString("en-US");
}

function ventaRequiereInfraestructuraFisica(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  return t === "ALEVIN" || t === "ALEVINES" || t === "KG" || t === "MOJARRA_KG";
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function buildEmptyForm(defaults = {}, nombreUsuario = "") {
  return {
    fecha_entrega: defaults.fecha_entrega ?? hoyISO(),
    tipo_venta: defaults.tipo_venta ?? "",
    granja: defaults.granja ?? "",
    infraestructura_fisica_origen_id: defaults.infraestructura_fisica_origen_id ? String(defaults.infraestructura_fisica_origen_id) : "",
    cantidad_peces: defaults.cantidad_peces ?? "",
    cliente_nombre: defaults.cliente_nombre ?? "",
    lugar_entrega: defaults.lugar_entrega ?? "",
    unidad_produccion: defaults.unidad_produccion ?? "",
    hora_embolsado: defaults.hora_embolsado ?? "",
    hora_entrega: defaults.hora_entrega ?? "",
    precio_unitario: defaults.precio_unitario ?? "",
    encargado_venta: defaults.encargado_venta ?? nombreUsuario,
  };
}

function idInfraestructuraFisica(p) {
  return p?.infraestructura_fisica_id ?? null;
}

export default function ProximaVentaModal({
  open,
  onClose,
  onCreated,
  defaults = {},
  infraestructurasFisicas = [],
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

  useEffect(() => {
    if (!open || !ventaRequiereInfraestructuraFisica(form.tipo_venta)) return;
    if (form.infraestructura_fisica_origen_id) return;

    const fromDefaults = defaults.infraestructura_fisica_origen_id ? String(defaults.infraestructura_fisica_origen_id) : "";
    const unica =
      infraestructurasFisicas.length === 1 && idInfraestructuraFisica(infraestructurasFisicas[0]) ? String(idInfraestructuraFisica(infraestructurasFisicas[0])) : "";
    const infraestructuraFisicaId = fromDefaults || unica;
    if (!infraestructuraFisicaId) return;

    setForm((prev) => {
      if (prev.infraestructura_fisica_origen_id) return prev;
      const infraestructuraFisica = infraestructurasFisicas.find((p) => String(idInfraestructuraFisica(p)) === infraestructuraFisicaId);
      const stock = infraestructuraFisica ? stockInfraestructuraFisica(infraestructuraFisica) : 0;
      return {
        ...prev,
        infraestructura_fisica_origen_id: infraestructuraFisicaId,
        cantidad_peces: prev.cantidad_peces || (stock > 0 ? String(stock) : ""),
      };
    });
  }, [open, defaults.infraestructura_fisica_origen_id, infraestructurasFisicas, form.infraestructura_fisica_origen_id, form.tipo_venta]);

  const infraestructuraFisicaOrigenSeleccionada = useMemo(() => {
    if (!form.infraestructura_fisica_origen_id) return null;
    return (
      infraestructurasFisicas.find(
        (p) => String(p.infraestructura_fisica_id) === String(form.infraestructura_fisica_origen_id),
      ) ?? null
    );
  }, [form.infraestructura_fisica_origen_id, infraestructurasFisicas]);

  const cantidadPedido = Number(form.cantidad_peces ?? 0);
  const stockOrigen = infraestructuraFisicaOrigenSeleccionada != null ? stockInfraestructuraFisica(infraestructuraFisicaOrigenSeleccionada) : null;
  const requiereValidacionStock =
    ventaRequiereInfraestructuraFisica(form.tipo_venta) && Boolean(form.infraestructura_fisica_origen_id);
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

  const validarInfraestructuraFisicaYCantidad = () => {
    if (ventaRequiereInfraestructuraFisica(form.tipo_venta) && !form.infraestructura_fisica_origen_id) {
      showSnackbar("Seleccione la infraestructura física de origen para ventas de alevines o mojarra.", "warning");
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
    if (!validarInfraestructuraFisicaYCantidad()) return;

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

  const etiquetaInfraestructuraFisica = (p) => `${p.nombre} — ${formatStock(stockInfraestructuraFisica(p))} org.`;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Registrar próxima venta</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
          Los campos de granja, tipo de venta e infraestructura física se completan según el movimiento en curso.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de entrega"
              name="fecha_entrega"
              value={form.fecha_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fecha_entrega}
              helperText={errors.fecha_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth error={!!errors.tipo_venta}>
              <InputLabel>Tipo de venta</InputLabel>
              <Select
                name="tipo_venta"
                value={form.tipo_venta}
                onChange={handleChange}
                label="Tipo de venta"
                disabled={lockTipoVenta}
              >
                <MenuItem value="ALEVIN">Alevines (por pieza)</MenuItem>
                <MenuItem value="KG">Mojarra (por Kg)</MenuItem>
              </Select>
              {errors.tipo_venta && <FormHelperText>{errors.tipo_venta}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Granja"
              name="granja"
              value={form.granja}
              onChange={handleChange}
              slotProps={{ input: { readOnly: lockGranja } }}
              error={!!errors.granja}
              helperText={errors.granja}
            />
          </Grid>

          {ventaRequiereInfraestructuraFisica(form.tipo_venta) && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                label="Infraestructura física origen"
                name="infraestructura_fisica_origen_id"
                value={form.infraestructura_fisica_origen_id}
                onChange={handleChange}
                error={cantidadExcedeStock}
                helperText={
                  cantidadExcedeStock
                    ? `Stock insuficiente: disponible ${formatStock(stockOrigen)}`
                    : infraestructurasFisicas.length === 0
                      ? "No hay infraestructurasFisicas con stock en esta granja"
                      : "Referencia para el egreso en trazabilidad"
                }
              >
                <MenuItem value="">— Seleccionar —</MenuItem>
                {infraestructurasFisicas.map((p) => (
                  <MenuItem key={p.infraestructura_fisica_id} value={String(p.infraestructura_fisica_id)}>
                    {etiquetaInfraestructuraFisica(p)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CampoNumerico
              fullWidth
              decimalScale={0}
              label="Cantidad"
              name="cantidad_peces"
              value={form.cantidad_peces}
              onChange={handleChange}
              error={!!errors.cantidad_peces || cantidadExcedeStock}
              helperText={
                errors.cantidad_peces
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
              getOptionLabel={(o) => (typeof o === "string" ? o : o.nombre || "")}
              value={form.cliente_nombre}
              onChange={(e, val) => {
                setForm((prev) => ({
                  ...prev,
                  cliente_nombre: typeof val === "string" ? val : val?.nombre || "",
                }));
                clearFieldError("cliente_nombre");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  error={!!errors.cliente_nombre}
                  helperText={errors.cliente_nombre}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Lugar de entrega"
              name="lugar_entrega"
              value={form.lugar_entrega}
              onChange={handleChange}
              error={!!errors.lugar_entrega}
              helperText={errors.lugar_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Unidad de producción"
              name="unidad_produccion"
              value={form.unidad_produccion}
              onChange={handleChange}
              error={!!errors.unidad_produccion}
              helperText={errors.unidad_produccion}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora embolsado"
              name="hora_embolsado"
              value={form.hora_embolsado}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_embolsado}
              helperText={errors.hora_embolsado}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora entrega"
              name="hora_entrega"
              value={form.hora_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_entrega}
              helperText={errors.hora_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <CampoNumerico
              fullWidth
              prefix="$" decimalScale={2}
              label="Precio unitario"
              name="precio_unitario"
              value={form.precio_unitario}
              onChange={handleChange}
              error={!!errors.precio_unitario}
              helperText={errors.precio_unitario}
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
