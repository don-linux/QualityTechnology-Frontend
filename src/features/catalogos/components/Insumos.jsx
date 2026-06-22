import React, { useState, useEffect, useMemo } from "react";
import {
  listInsumos,
  createInsumo,
  updateInsumo,
  activateInsumo,
  deactivateInsumo,
} from "@features/catalogos/services/insumosService";
import { listClientes } from "@features/catalogos/services/clientesService";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import { formatPrecio, formatNumero } from "@shared/utils/formatters";

const UNIDADES_MEDIDA = ["ml", "l", "mg", "g", "kg"];

const EMPTY_FORM = {
  fi_insumo_id: null,
  fc_codigo: "",
  fc_nombre: "",
  fc_marca: "",
  fc_unidad_medida: "",
  fi_cliente_id: "",
  fn_presentacion: "",
  fn_precio_bulto: "",
  fn_stock_minimo: "",
};

const REQUIRED_FIELDS = [
  "fc_nombre",
  "fc_unidad_medida",
  "fi_cliente_id",
  "fn_presentacion",
  "fn_precio_bulto",
  "fn_stock_minimo",
];

function calcularPrecioUnitario(precioBulto, presentacion) {
  const bulto = Number(precioBulto);
  const pres = Number(presentacion);
  if (!Number.isFinite(bulto) || !Number.isFinite(pres) || pres <= 0) return null;
  return Math.round((bulto / pres) * 10000) / 10000;
}

function formatConUdm(valor, udm) {
  if (valor == null || valor === "") return "—";
  return `${formatNumero(valor, 3)} ${udm || ""}`.trim();
}

export default function Insumos() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY_FORM);
  const [insumos, setInsumos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  const precioUnitarioPreview = useMemo(
    () => calcularPrecioUnitario(form.fn_precio_bulto, form.fn_presentacion),
    [form.fn_precio_bulto, form.fn_presentacion],
  );

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    setLoading(true);
    const [insumosRes, clientesRes] = await Promise.allSettled([
      listInsumos(),
      listClientes(),
    ]);

    if (insumosRes.status === "fulfilled") {
      setInsumos(insumosRes.value.data);
    } else {
      console.error("Error al obtener insumos", insumosRes.reason);
      setInsumos([]);
      showSnackbar(insumosRes.reason?.response?.data?.error || "Error al obtener insumos", "error");
    }

    if (clientesRes.status === "fulfilled") {
      setClientes(clientesRes.value.data.filter((c) => c.activo !== false));
    } else {
      console.error("Error al obtener clientes", clientesRes.reason);
      setClientes([]);
      showSnackbar("Error al obtener clientes", "error");
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const limpiarFormulario = () => {
    clearErrors();
    setForm(EMPTY_FORM);
    cerrarFormulario();
  };

  const validarFormato = () => {
    const presentacion = Number(form.fn_presentacion);
    const precioBulto = Number(form.fn_precio_bulto);
    const stockMinimo = Number(form.fn_stock_minimo);

    if (!Number.isFinite(presentacion) || presentacion <= 0) {
      showSnackbar("La presentación debe ser un número mayor a 0", "error");
      return false;
    }
    if (!Number.isFinite(precioBulto) || precioBulto < 0) {
      showSnackbar("El precio bulto debe ser un número mayor o igual a 0", "error");
      return false;
    }
    if (!Number.isFinite(stockMinimo) || stockMinimo < 0) {
      showSnackbar("El stock mínimo debe ser un número mayor o igual a 0", "error");
      return false;
    }
    return true;
  };

  const construirPayload = () => ({
    fc_nombre: form.fc_nombre.trim(),
    fc_marca: form.fc_marca.trim() || null,
    fc_unidad_medida: form.fc_unidad_medida,
    fi_cliente_id: Number(form.fi_cliente_id),
    fn_presentacion: Number(form.fn_presentacion),
    fn_precio_bulto: Number(form.fn_precio_bulto),
    fn_stock_minimo: Number(form.fn_stock_minimo),
  });

  const guardarConValidacion = async (operacion) => {
    if (!validate(form, REQUIRED_FIELDS) || !validarFormato()) return false;

    await operacion(construirPayload());
    await obtenerDatos();
    limpiarFormulario();
    return true;
  };

  const registrarInsumo = async () => {
    try {
      if (await guardarConValidacion(createInsumo)) {
        showSnackbar("Insumo registrado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al registrar insumo", error);
      showSnackbar(error?.response?.data?.error || "Error al registrar insumo", "error");
    }
  };

  const actualizarInsumo = async () => {
    if (!form.fi_insumo_id) return showSnackbar("Selecciona un insumo para actualizar", "error");
    try {
      if (await guardarConValidacion((payload) => updateInsumo(form.fi_insumo_id, payload))) {
        showSnackbar("Insumo actualizado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al actualizar insumo", error);
      showSnackbar(error?.response?.data?.error || "Error al actualizar insumo", "error");
    }
  };

  const desactivarInsumo = async (id, nombre) => {
    if (!await confirm(`¿Desactivar el insumo "${nombre}"?`)) return;
    try {
      await deactivateInsumo(id);
      obtenerDatos();
      limpiarFormulario();
      showSnackbar("Insumo desactivado correctamente", "success");
    } catch (error) {
      console.error("Error al desactivar insumo", error);
      showSnackbar(error?.response?.data?.error || "Error al desactivar insumo", "error");
    }
  };

  const activarInsumoItem = async (id, nombre) => {
    if (!await confirm(`¿Activar el insumo "${nombre}"?`)) return;
    try {
      await activateInsumo(id);
      obtenerDatos();
      limpiarFormulario();
      showSnackbar("Insumo activado correctamente", "success");
    } catch (error) {
      console.error("Error al activar insumo", error);
      showSnackbar(error?.response?.data?.error || "Error al activar insumo", "error");
    }
  };

  const seleccionarInsumo = (insumo) => {
    clearErrors();
    setForm({
      fi_insumo_id: insumo.fi_insumo_id,
      fc_codigo: insumo.fc_codigo || "",
      fc_nombre: insumo.fc_nombre || "",
      fc_marca: insumo.fc_marca || "",
      fc_unidad_medida: insumo.fc_unidad_medida || "",
      fi_cliente_id: insumo.fi_cliente_id ? String(insumo.fi_cliente_id) : "",
      fn_presentacion: insumo.fn_presentacion != null ? String(insumo.fn_presentacion) : "",
      fn_precio_bulto: insumo.fn_precio_bulto != null ? String(insumo.fn_precio_bulto) : "",
      fn_stock_minimo: insumo.fn_stock_minimo != null ? String(insumo.fn_stock_minimo) : "",
    });
    abrirFormulario();
  };

  const udmAdornment = form.fc_unidad_medida ? (
    <InputAdornment position="end">{form.fc_unidad_medida}</InputAdornment>
  ) : null;

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }} align="center">
        Catálogo de Insumos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
        Administra los insumos del sistema con código autogenerado IN-NNN
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
              {form.fi_insumo_id ? `Editando ${form.fc_codigo}` : "Nuevo Insumo"}
            </Typography>
            <Grid container spacing={2}>
              {form.fc_codigo && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ID"
                    fullWidth
                    value={form.fc_codigo}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: form.fc_codigo ? 8 : 12 }}>
                <TextField
                  name="fc_nombre"
                  label="Nombre"
                  fullWidth
                  value={form.fc_nombre}
                  onChange={handleChange}
                  error={!!errors.fc_nombre}
                  helperText={errors.fc_nombre}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="fc_marca"
                  label="Marca"
                  fullWidth
                  value={form.fc_marca}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="fc_unidad_medida"
                  label="UdM (Unidad de Medida)"
                  select
                  fullWidth
                  value={form.fc_unidad_medida}
                  onChange={handleChange}
                  error={!!errors.fc_unidad_medida}
                  helperText={errors.fc_unidad_medida}
                >
                  <MenuItem value="">Selecciona UdM</MenuItem>
                  {UNIDADES_MEDIDA.map((udm) => (
                    <MenuItem key={udm} value={udm}>
                      {udm}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="fi_cliente_id"
                  label="Razón Social"
                  select
                  fullWidth
                  value={form.fi_cliente_id}
                  onChange={handleChange}
                  error={!!errors.fi_cliente_id}
                  helperText={errors.fi_cliente_id}
                >
                  <MenuItem value="">Selecciona cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.fi_cliente_id} value={cliente.fi_cliente_id}>
                      {cliente.fc_razon_social || cliente.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoNumerico
                  name="fn_presentacion"
                  label="Presentación"
                  fullWidth
                  value={form.fn_presentacion}
                  onChange={handleChange}
                  decimalScale={3}
                  error={!!errors.fn_presentacion}
                  helperText={errors.fn_presentacion}
                  slotProps={{
                    input: {
                      endAdornment: udmAdornment,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoNumerico
                  name="fn_precio_bulto"
                  label="Precio bulto"
                  fullWidth
                  value={form.fn_precio_bulto}
                  onChange={handleChange}
                  decimalScale={2}
                  prefix="$"
                  error={!!errors.fn_precio_bulto}
                  helperText={errors.fn_precio_bulto}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Precio unitario"
                  fullWidth
                  value={
                    precioUnitarioPreview != null
                      ? formatPrecio(precioUnitarioPreview)
                      : ""
                  }
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Calculado: precio bulto / presentación"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoNumerico
                  name="fn_stock_minimo"
                  label="Stock mínimo"
                  fullWidth
                  value={form.fn_stock_minimo}
                  onChange={handleChange}
                  decimalScale={3}
                  error={!!errors.fn_stock_minimo}
                  helperText={errors.fn_stock_minimo}
                  slotProps={{
                    input: {
                      endAdornment: udmAdornment,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="center" mt={3} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                color="success"
                onClick={registrarInsumo}
                disabled={!!form.fi_insumo_id}
              >
                Registrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={actualizarInsumo}
                disabled={!form.fi_insumo_id}
              >
                Actualizar
              </Button>
              <Button variant="outlined" onClick={limpiarFormulario}>
                Limpiar
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ maxHeight: 460, overflow: "auto" }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table stickyHeader>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>UdM</TableCell>
                  <TableCell>Razón Social</TableCell>
                  <TableCell>Presentación</TableCell>
                  <TableCell>Precio bulto</TableCell>
                  <TableCell>Precio unitario</TableCell>
                  <TableCell>Stock mínimo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenarYNumerar(insumos, ["fi_insumo_id", "insumo_id"]).map((insumo) => (
                  <TableRow key={insumo.fi_insumo_id} hover>
                    <TableCell>{insumo.fc_codigo}</TableCell>
                    <TableCell>{insumo.fc_nombre}</TableCell>
                    <TableCell>{insumo.fc_marca || "—"}</TableCell>
                    <TableCell>{insumo.fc_unidad_medida}</TableCell>
                    <TableCell>{insumo.fc_razon_social || "—"}</TableCell>
                    <TableCell>
                      {formatConUdm(insumo.fn_presentacion, insumo.fc_unidad_medida)}
                    </TableCell>
                    <TableCell>{formatPrecio(insumo.fn_precio_bulto)}</TableCell>
                    <TableCell>{formatPrecio(insumo.fn_precio_unitario)}</TableCell>
                    <TableCell>
                      {formatConUdm(insumo.fn_stock_minimo, insumo.fc_unidad_medida)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={insumo.activo !== false ? "Activo" : "Inactivo"}
                        color={insumo.activo !== false ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => seleccionarInsumo(insumo)}
                        >
                          Seleccionar
                        </Button>
                        {insumo.activo !== false ? (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => desactivarInsumo(insumo.fi_insumo_id, insumo.fc_nombre)}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            onClick={() => activarInsumoItem(insumo.fi_insumo_id, insumo.fc_nombre)}
                          >
                            Activar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {ConfirmModal}
    </Container>
  );
}
