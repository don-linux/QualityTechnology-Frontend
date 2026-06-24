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
  insumo_id: null,
  codigo: "",
  nombre: "",
  marca: "",
  unidad_medida: "",
  cliente_id: "",
  presentacion: "",
  precio_bulto: "",
  stock_minimo: "",
};

const REQUIRED_FIELDS = [
  "nombre",
  "unidad_medida",
  "cliente_id",
  "presentacion",
  "precio_bulto",
  "stock_minimo",
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
    () => calcularPrecioUnitario(form.precio_bulto, form.presentacion),
    [form.precio_bulto, form.presentacion],
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
    const presentacion = Number(form.presentacion);
    const precioBulto = Number(form.precio_bulto);
    const stockMinimo = Number(form.stock_minimo);

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
    nombre: form.nombre.trim(),
    marca: form.marca.trim() || null,
    unidad_medida: form.unidad_medida,
    cliente_id: Number(form.cliente_id),
    presentacion: Number(form.presentacion),
    precio_bulto: Number(form.precio_bulto),
    stock_minimo: Number(form.stock_minimo),
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
    if (!form.insumo_id) return showSnackbar("Selecciona un insumo para actualizar", "error");
    try {
      if (await guardarConValidacion((payload) => updateInsumo(form.insumo_id, payload))) {
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
      insumo_id: insumo.insumo_id,
      codigo: insumo.codigo || "",
      nombre: insumo.nombre || "",
      marca: insumo.marca || "",
      unidad_medida: insumo.unidad_medida || "",
      cliente_id: insumo.cliente_id ? String(insumo.cliente_id) : "",
      presentacion: insumo.presentacion != null ? String(insumo.presentacion) : "",
      precio_bulto: insumo.precio_bulto != null ? String(insumo.precio_bulto) : "",
      stock_minimo: insumo.stock_minimo != null ? String(insumo.stock_minimo) : "",
    });
    abrirFormulario();
  };

  const udmAdornment = form.unidad_medida ? (
    <InputAdornment position="end">{form.unidad_medida}</InputAdornment>
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
              {form.insumo_id ? `Editando ${form.codigo}` : "Nuevo Insumo"}
            </Typography>
            <Grid container spacing={2}>
              {form.codigo && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="ID"
                    fullWidth
                    value={form.codigo}
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: form.codigo ? 8 : 12 }}>
                <TextField
                  name="nombre"
                  label="Nombre"
                  fullWidth
                  value={form.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="marca"
                  label="Marca"
                  fullWidth
                  value={form.marca}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="unidad_medida"
                  label="UdM (Unidad de Medida)"
                  select
                  fullWidth
                  value={form.unidad_medida}
                  onChange={handleChange}
                  error={!!errors.unidad_medida}
                  helperText={errors.unidad_medida}
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
                  name="cliente_id"
                  label="Razón Social"
                  select
                  fullWidth
                  value={form.cliente_id}
                  onChange={handleChange}
                  error={!!errors.cliente_id}
                  helperText={errors.cliente_id}
                >
                  <MenuItem value="">Selecciona cliente</MenuItem>
                  {clientes.map((cliente) => (
                    <MenuItem key={cliente.cliente_id} value={cliente.cliente_id}>
                      {cliente.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoNumerico
                  name="presentacion"
                  label="Presentación"
                  fullWidth
                  value={form.presentacion}
                  onChange={handleChange}
                  decimalScale={3}
                  error={!!errors.presentacion}
                  helperText={errors.presentacion}
                  slotProps={{
                    input: {
                      endAdornment: udmAdornment,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoNumerico
                  name="precio_bulto"
                  label="Precio bulto"
                  fullWidth
                  value={form.precio_bulto}
                  onChange={handleChange}
                  decimalScale={2}
                  prefix="$"
                  error={!!errors.precio_bulto}
                  helperText={errors.precio_bulto}
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
                  name="stock_minimo"
                  label="Stock mínimo"
                  fullWidth
                  value={form.stock_minimo}
                  onChange={handleChange}
                  decimalScale={3}
                  error={!!errors.stock_minimo}
                  helperText={errors.stock_minimo}
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
                disabled={!!form.insumo_id}
              >
                Registrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={actualizarInsumo}
                disabled={!form.insumo_id}
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
                {ordenarYNumerar(insumos, ["insumo_id", "id"]).map((insumo) => (
                  <TableRow key={insumo.insumo_id} hover>
                    <TableCell>{insumo.codigo}</TableCell>
                    <TableCell>{insumo.nombre}</TableCell>
                    <TableCell>{insumo.marca || "—"}</TableCell>
                    <TableCell>{insumo.unidad_medida}</TableCell>
                    <TableCell>{insumo.razon_social || "—"}</TableCell>
                    <TableCell>
                      {formatConUdm(insumo.presentacion, insumo.unidad_medida)}
                    </TableCell>
                    <TableCell>{formatPrecio(insumo.precio_bulto)}</TableCell>
                    <TableCell>{formatPrecio(insumo.precio_unitario)}</TableCell>
                    <TableCell>
                      {formatConUdm(insumo.stock_minimo, insumo.unidad_medida)}
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
                          Editar
                        </Button>
                        {insumo.activo !== false ? (
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => desactivarInsumo(insumo.insumo_id, insumo.nombre)}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            onClick={() => activarInsumoItem(insumo.insumo_id, insumo.nombre)}
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
