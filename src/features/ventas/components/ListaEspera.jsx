import React, { useState, useEffect, useMemo, useCallback } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import CampoNumerico from "@shared/components/CampoNumerico";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import AddIcon from "@mui/icons-material/Add";
import {
  listLista,
  listClientes,
  updateRegistro,
  cancelarRegistro,
  convertirAVenta,
  createClienteRapido,
} from "../services/listaEsperaService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
import { listEmpleadosActivosClientes } from "@features/catalogos/services/clientesService";
import { listPiletas } from "@features/inventarios/services/piletasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import FormHelperText from "@mui/material/FormHelperText";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import { formatFecha, formatPrecio } from "@shared/utils/formatters";
import { ESTADOS_MX } from "@shared/constants/estadosMx";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

const EMPTY_CLIENTE_RAPIDO = {
  nombre: "",
  rfc: "",
  unidad_negocio_id: "",
  empresa: "",
  telefono: "",
  email: "",
  localidad: "",
  estado: "",
  ejecutivo_empleado_id: "",
};

const CLIENTE_RAPIDO_REQUIRED = Object.keys(EMPTY_CLIENTE_RAPIDO);
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const TIPOS_VENTA_TRAZABLES = new Set(["ALEVIN", "ALEVINES", "KG", "MOJARRA_KG"]);

function ventaRequierePileta(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  return TIPOS_VENTA_TRAZABLES.has(t);
}

function etapaPiletaParaTipo(tipo) {
  const t = String(tipo ?? "").trim().toUpperCase();
  if (t === "ALEVIN" || t === "ALEVINES") return "alevinaje";
  if (t === "KG" || t === "MOJARRA_KG" || t === "MOJARRA") return "engorda";
  return null;
}

function stockPileta(p) {
  return Number(p?.cantidad ?? 0);
}

function formatStock(num) {
  return Number(num ?? 0).toLocaleString("en-US");
}

function etiquetaEstatus(item) {
  if (item.venta_id) return "Trazabilidad registrada";
  const tipo = String(item.tipo_venta ?? "").trim().toUpperCase();
  if (TIPOS_VENTA_TRAZABLES.has(tipo)) return "Pendiente trazabilidad";
  return "Pendiente";
}

function soloDigitos(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function nombreEmpleado(empleado) {
  return empleado.nombre_completo
    || [empleado.nombre, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean).join(" ");
}

export default function ListaEspera() {
  return <ListaEsperaContent />;
}

function ListaEsperaContent() {
  const showSnackbar = useSnackbar();
  const auth = useAuth();
  const nombreUsuario = auth.nombre;
  const {
    ubicacionesGranja,
    defaultUbicacion,
  } = useUbicacionesGranja();
  const puedeElegirGranja = auth.granja === "ALL";
  const puedeElegirUdN = auth.granja === "ALL";
  const unidadNegocioIdUsuario = localStorage.getItem("unidad_negocio_id") || "";
  const granjaDefault = puedeElegirGranja
    ? defaultUbicacion
    : auth.granja !== "SIN_UNIDAD"
      ? auth.granja
      : "";

  const [editId, setEditId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [openCliente, setOpenCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState(EMPTY_CLIENTE_RAPIDO);
  const [piletas, setPiletas] = useState([]);
  const [cargandoPiletas, setCargandoPiletas] = useState(false);

  const emptyForm = {
    fecha_entrega: "",
    tipo_venta: "",
    granja: granjaDefault,
    pileta_origen_id: "",
    cantidad_peces: "",
    cliente_nombre: "",
    lugar_entrega: "",
    unidad_produccion: "",
    hora_embolsado: "",
    hora_entrega: "",
    precio_unitario: "",
    encargado_venta: nombreUsuario,
  };

  const [form, setForm] = useState(emptyForm);
  const [lista, setLista] = useState([]);

  const filasPedidos = useMemo(() => ordenarYNumerar(lista, ["lista_id"]), [lista]);

  const unidadesDisponibles = useMemo(() => {
    if (puedeElegirUdN) return unidadesNegocio;
    if (auth.granja === "SIN_UNIDAD") return [];
    if (unidadNegocioIdUsuario) {
      return unidadesNegocio.filter(
        (unidad) => String(unidad.unidad_negocio_id) === unidadNegocioIdUsuario,
      );
    }
    return unidadesNegocio.filter((unidad) => unidad.nombre === auth.granja);
  }, [auth.granja, puedeElegirUdN, unidadNegocioIdUsuario, unidadesNegocio]);

  const udnDefaultClienteRapido = useMemo(() => {
    if (puedeElegirUdN || auth.granja === "SIN_UNIDAD") return "";
    return unidadNegocioIdUsuario || String(unidadesDisponibles[0]?.unidad_negocio_id || "");
  }, [auth.granja, puedeElegirUdN, unidadNegocioIdUsuario, unidadesDisponibles]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
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

  const cargarLista = async () => {
    try {
      const res = await listLista();
      setLista(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar lista de espera:", err);
      setLista([]);
    }
  };

  const cargarClientes = async () => {
    try {
      const res = await listClientes();
      setClientes(res.data);
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    }
  };

  const cargarOpcionesCliente = async () => {
    try {
      const [unidadesRes, empleadosRes] = await Promise.all([
        listUnidadesNegocioActivas(),
        listEmpleadosActivosClientes(),
      ]);
      setUnidadesNegocio(unidadesRes.data);
      setEmpleados(empleadosRes.data);
    } catch (err) {
      console.error("Error al cargar opciones de cliente:", err);
    }
  };

  useEffect(() => {
    cargarLista();
    cargarClientes();
    cargarOpcionesCliente();
  }, []);

  useEffect(() => {
    if (!form.granja && granjaDefault) {
      setForm((prev) => ({ ...prev, granja: granjaDefault }));
    }
  }, [form.granja, granjaDefault]);

  const cargarPiletasForm = useCallback(async (granja, tipoVenta) => {
    const etapa = etapaPiletaParaTipo(tipoVenta);
    if (!etapa || !granja) {
      setPiletas([]);
      return;
    }
    setCargandoPiletas(true);
    try {
      const res = await listPiletas(granja, etapa);
      const rows = Array.isArray(res.data) ? res.data : [];
      setPiletas(rows.filter((p) => Number(p.cantidad ?? 0) > 0));
    } catch (err) {
      console.error("Error al cargar piletas:", err);
      setPiletas([]);
    } finally {
      setCargandoPiletas(false);
    }
  }, []);

  useEffect(() => {
    if (ventaRequierePileta(form.tipo_venta) && form.granja) {
      cargarPiletasForm(form.granja, form.tipo_venta);
    } else {
      setPiletas([]);
      setForm((prev) => (prev.pileta_origen_id ? { ...prev, pileta_origen_id: "" } : prev));
    }
  }, [form.tipo_venta, form.granja, cargarPiletasForm]);

  const piletaOrigenSeleccionada = useMemo(() => {
    if (!form.pileta_origen_id) return null;
    return (
      piletas.find(
        (p) => String(p.pileta_id) === form.pileta_origen_id,
      ) ?? null
    );
  }, [form.pileta_origen_id, piletas]);

  const cantidadPedido = Number(form.cantidad_peces ?? 0);
  const stockOrigen = piletaOrigenSeleccionada != null ? stockPileta(piletaOrigenSeleccionada) : null;
  const requiereValidacionStock =
    ventaRequierePileta(form.tipo_venta) && Boolean(form.pileta_origen_id);
  const cantidadExcedeStock =
    requiereValidacionStock
    && stockOrigen != null
    && cantidadPedido > 0
    && cantidadPedido > stockOrigen;

  const validarPiletaYCantidad = () => {
    if (ventaRequierePileta(form.tipo_venta) && !form.pileta_origen_id) {
      showSnackbar("Seleccione la pileta de origen para ventas de alevines o mojarra.", "warning");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "granja" || name === "tipo_venta") {
        next.pileta_origen_id = "";
      }
      return next;
    });
    clearFieldError(name);
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente({
      ...nuevoCliente,
      [name]: name === "telefono" ? soloDigitos(value) : value,
    });
  };

  const abrirModalCliente = () => {
    setNuevoCliente({ ...EMPTY_CLIENTE_RAPIDO, unidad_negocio_id: udnDefaultClienteRapido });
    setOpenCliente(true);
  };

  const cerrarModalCliente = () => {
    setOpenCliente(false);
    setNuevoCliente({ ...EMPTY_CLIENTE_RAPIDO, unidad_negocio_id: udnDefaultClienteRapido });
  };

  const editar = (item) => {
    clearErrors();
    setEditId(item.lista_id);
    setForm({
      fecha_entrega: item.fecha_entrega?.split?.("T")?.[0] || item.fecha_entrega || "",
      tipo_venta: item.tipo_venta || "",
      granja: item.granja || granjaDefault,
      pileta_origen_id: item.pileta_origen_id ? String(item.pileta_origen_id) : "",
      cantidad_peces: item.cantidad_peces || "",
      cliente_nombre: item.cliente_nombre || "",
      lugar_entrega: item.lugar_entrega || "",
      encargado_venta: item.encargado_venta || nombreUsuario,
      unidad_produccion: item.unidad_produccion || "",
      hora_embolsado: item.hora_embolsado || "",
      hora_entrega: item.hora_entrega || "",
      precio_unitario: item.precio_unitario || "",
    });
  };

  const actualizar = async () => {
    if (!validate(form, requiredFields)) return;
    if (!validarPiletaYCantidad()) return;

    try {
      await updateRegistro(editId, form);
      showSnackbar("Actualizado correctamente", "success");
      setEditId(null);
      setForm({ ...emptyForm, granja: granjaDefault, encargado_venta: nombreUsuario });
      cargarLista();
    } catch (err) {
      console.error("Error al actualizar en lista de espera:", err);
      showSnackbar(err?.response?.data?.error || "Error al actualizar", "error");
    }
  };

  const cancelar = async (item) => {
    const tieneTrazabilidad = Boolean(item.venta_id);
    const esTrazable = ventaRequierePileta(item.tipo_venta);
    const mensaje = tieneTrazabilidad && esTrazable
      ? "¿Cancelar este pedido? Se registrará la devolución en trazabilidad y los organismos volverán a su pileta de origen."
      : "¿Cancelar este pedido?";

    if (!await confirm(mensaje)) return;

    try {
      const res = await cancelarRegistro(item.lista_id);
      showSnackbar(res.data?.mensaje || "Pedido cancelado", "success");
      if (editId === item.lista_id) {
        setEditId(null);
        setForm(emptyForm);
        clearErrors();
      }
      cargarLista();
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      showSnackbar(err?.response?.data?.error || "Error al cancelar el pedido", "error");
    }
  };

  const convertir = async (item) => {
    const tipo = item.tipo_venta;
    const tieneVenta = Boolean(item.venta_id);

    if (ventaRequierePileta(tipo) && !tieneVenta) {
      showSnackbar(
        "Registre primero la venta en el módulo de Trazabilidad (tipo Venta).",
        "warning",
      );
      return;
    }

    if (ventaRequierePileta(tipo) && !item.pileta_origen_id) {
      showSnackbar("El pedido debe tener pileta de origen. Edítelo antes de convertir.", "warning");
      return;
    }

    if (!await confirm("¿Convertir a venta real y retirar de la lista?")) return;

    try {
      const payload = item.pileta_origen_id
        ? { pileta_origen_id: item.pileta_origen_id }
        : {};
      await convertirAVenta(item.lista_id, payload);
      showSnackbar("Convertido a venta correctamente", "success");
      cargarLista();
    } catch (err) {
      const message = err?.response?.data?.error || err.message;
      showSnackbar("Error al convertir: " + message, "error");
    }
  };

  const etiquetaPileta = (p) => `${p.nombre} — ${formatStock(stockPileta(p))} org.`;

  const registrarClienteRapido = async () => {
    const missingField = CLIENTE_RAPIDO_REQUIRED.find((field) => !nuevoCliente[field]);
    if (missingField) {
      showSnackbar("Completa todos los campos del cliente", "error");
      return;
    }
    if (nuevoCliente.rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres", "error");
      return;
    }
    if (!/^[0-9]{1,10}$/.test(nuevoCliente.telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos", "error");
      return;
    }
    if (!EMAIL_RE.test(nuevoCliente.email)) {
      showSnackbar("Ingresa un correo electrónico válido", "error");
      return;
    }

    try {
      await createClienteRapido({
        ...nuevoCliente,
        nombre: nuevoCliente.nombre.trim(),
        rfc: nuevoCliente.rfc.trim(),
        unidad_negocio_id: Number(nuevoCliente.unidad_negocio_id),
        empresa: nuevoCliente.empresa.trim(),
        email: nuevoCliente.email.trim(),
        localidad: nuevoCliente.localidad.trim(),
        ejecutivo_empleado_id: Number(nuevoCliente.ejecutivo_empleado_id),
      });
      await cargarClientes();
      cerrarModalCliente();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "Error al registrar cliente", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
         Lista de Espera
      </Typography>

      {editId && (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Editar Pedido
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Entrega"
              name="fecha_entrega"
              value={form.fecha_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fecha_entrega}
              helperText={errors.fecha_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth error={!!errors.tipo_venta}>
              <InputLabel>Tipo de Venta</InputLabel>
              <Select
                name="tipo_venta"
                value={form.tipo_venta}
                onChange={handleChange}
                label="Tipo de Venta"
              >
                <MenuItem value="ALEVIN">Alevines (por pieza)</MenuItem>
                <MenuItem value="KG">Mojarra (por Kg)</MenuItem>
                <MenuItem value="ALIMENTO">Alimento</MenuItem>
                <MenuItem value="MEDICAMENTO">Medicamento</MenuItem>
              </Select>
              {errors.tipo_venta && <FormHelperText>{errors.tipo_venta}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            {puedeElegirGranja ? (
              <TextField select fullWidth label="Granja" name="granja" value={form.granja} onChange={handleChange} error={!!errors.granja} helperText={errors.granja}>
                {ubicacionesGranja.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField fullWidth label="Granja" name="granja" value={form.granja} slotProps={{ input: { readOnly: true } }} />
            )}
          </Grid>

          {ventaRequierePileta(form.tipo_venta) && form.granja && (
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                fullWidth
                label="Pileta origen"
                name="pileta_origen_id"
                value={form.pileta_origen_id}
                onChange={handleChange}
                disabled={cargandoPiletas}
                error={cantidadExcedeStock}
                helperText={
                  cantidadExcedeStock
                    ? `Stock insuficiente: disponible ${formatStock(stockOrigen)}`
                    : cargandoPiletas
                      ? "Cargando piletas..."
                        : piletas.length === 0
                        ? "No hay piletas con stock en esta granja"
                        : "Referencia para el egreso en Trazabilidad"
                }
              >
                <MenuItem value="">— Seleccionar —</MenuItem>
                {piletas.map((p) => (
                  <MenuItem key={p.pileta_id} value={String(p.pileta_id)}>
                    {etiquetaPileta(p)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid size={{ xs: 12, md: 3 }}>
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
                || (cantidadExcedeStock
                  ? `Supera el stock (${formatStock(stockOrigen)} organismos)`
                  : requiereValidacionStock && stockOrigen != null
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

          {requiereValidacionStock && piletaOrigenSeleccionada && (
            <Grid size={12}>
              <Alert severity={cantidadExcedeStock ? "error" : "info"} sx={{ py: 0.5 }}>
                Stock en <strong>{piletaOrigenSeleccionada.nombre}</strong>:{" "}
                {formatStock(stockOrigen)} organismos
                {cantidadPedido > 0 && (
                  <>
                    {" "}
                    · Pedido: {formatStock(cantidadPedido)}
                    {cantidadExcedeStock && " — cantidad superior al disponible"}
                  </>
                )}
              </Alert>
            </Grid>
          )}

          {/* CLIENTE AUTOCOMPLETE */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container spacing={1}>
              <Grid size={10}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={clientes}
                  getOptionLabel={(o) => (typeof o === "string" ? o : o.nombre || "")}
                  value={form.cliente_nombre}
                  onChange={(e, val) => {
                    setForm({
                      ...form,
                      cliente_nombre: typeof val === "string" ? val : val?.nombre || "",
                    });
                    clearFieldError("cliente_nombre");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cliente" error={!!errors.cliente_nombre} helperText={errors.cliente_nombre} />
                  )}
                />
              </Grid>
              <Grid size={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={abrirModalCliente}
                >
                  <AddIcon />
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Lugar" name="lugar_entrega" value={form.lugar_entrega} onChange={handleChange} error={!!errors.lugar_entrega} helperText={errors.lugar_entrega} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Unidad Producción" name="unidad_produccion" value={form.unidad_produccion} onChange={handleChange} error={!!errors.unidad_produccion} helperText={errors.unidad_produccion} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora Embolsado"
              name="hora_embolsado"
              value={form.hora_embolsado}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_embolsado}
              helperText={errors.hora_embolsado}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="time"
              label="Hora Entrega"
              name="hora_entrega"
              value={form.hora_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.hora_entrega}
              helperText={errors.hora_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <CampoNumerico fullWidth prefix="$" decimalScale={2} label="Precio Venta" name="precio_unitario" value={form.precio_unitario} onChange={handleChange} error={!!errors.precio_unitario} helperText={errors.precio_unitario} inputProps={{ min: 0, step: "0.01" }} />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button variant="contained" color="warning" onClick={actualizar}>
            Actualizar
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
            onClick={() => {
              setEditId(null);
              setForm(emptyForm);
              clearErrors();
            }}
          >
            Cancelar
          </Button>
        </Box>
      </Paper>
      )}

      {/* Tabla */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        Lista de Pedidos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {auth.granja === "ALL"
          ? "Se muestran los pedidos de todas las unidades de negocio."
          : auth.granja === "SIN_UNIDAD"
            ? "Tu usuario no tiene una unidad de negocio asignada; no hay pedidos visibles."
            : `Solo se muestran los pedidos de tu unidad de negocio (${auth.granja}).`}
      </Typography>

      <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead sx={{ backgroundColor: "#006d77" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cliente</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cantidad</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pileta</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lugar</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Granja</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Precio</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Estatus</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filasPedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No hay pedidos registrados.
                  </TableCell>
                </TableRow>
              ) : (
                filasPedidos.map((item) => (
                  <TableRow key={item.lista_id}>
                    <TableCell>{item._num}</TableCell>
                    <TableCell>{formatFecha(item.fecha_entrega)}</TableCell>
                    <TableCell>{item.tipo_venta ?? "—"}</TableCell>
                    <TableCell>{item.cliente_nombre}</TableCell>
                    <TableCell>{item.cantidad_peces}</TableCell>
                    <TableCell>{item.nombre_pileta_origen ?? "—"}</TableCell>
                    <TableCell>{item.lugar_entrega}</TableCell>
                    <TableCell>{item.granja ?? "—"}</TableCell>
                    <TableCell>{formatPrecio(item.precio_unitario)}</TableCell>
                    <TableCell>{etiquetaEstatus(item)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="warning"
                        sx={{ mr: 1 }}
                        onClick={() => editar(item)}
                        disabled={Boolean(item.venta_id)}
                      >
                        Editar
                      </Button>
                      <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => cancelar(item)}>
                        Cancelar
                      </Button>
                      <Button variant="contained" color="success" onClick={() => convertir(item)}>
                        Convertir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para cliente rápido */}
      <Dialog open={openCliente} onClose={cerrarModalCliente} fullWidth maxWidth="sm">
        <DialogTitle>Registrar nuevo cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField name="nombre" label="Razón Social" fullWidth value={nuevoCliente.nombre} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="rfc" label="RFC" fullWidth value={nuevoCliente.rfc} onChange={handleNuevoClienteChange} inputProps={{ maxLength: 20 }} />
            </Grid>
            <Grid size={6}>
              {puedeElegirUdN ? (
                <TextField select name="unidad_negocio_id" label="UdN" fullWidth value={nuevoCliente.unidad_negocio_id} onChange={handleNuevoClienteChange}>
                  <MenuItem value="">Selecciona UdN</MenuItem>
                  {unidadesDisponibles.map((unidad) => (
                    <MenuItem key={unidad.unidad_negocio_id} value={unidad.unidad_negocio_id}>{unidad.nombre}</MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  label="UdN"
                  fullWidth
                  value={unidadesDisponibles[0]?.nombre || auth.granja || ""}
                  slotProps={{ input: { readOnly: true } }}
                />
              )}
            </Grid>
            <Grid size={6}>
              <TextField name="empresa" label="Nombre del contacto" fullWidth value={nuevoCliente.empresa} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="telefono" label="Teléfono" fullWidth value={nuevoCliente.telefono} onChange={handleNuevoClienteChange} inputProps={{ maxLength: 10, inputMode: "numeric" }} />
            </Grid>
            <Grid size={6}>
              <TextField name="email" type="email" label="Correo" fullWidth value={nuevoCliente.email} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="localidad" label="Localidad" fullWidth value={nuevoCliente.localidad} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField select name="estado" label="Estado" fullWidth value={nuevoCliente.estado} onChange={handleNuevoClienteChange}>
                <MenuItem value="">Selecciona Estado</MenuItem>
                {ESTADOS_MX.map((estado) => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField select name="ejecutivo_empleado_id" label="Ejecutivo" fullWidth value={nuevoCliente.ejecutivo_empleado_id} onChange={handleNuevoClienteChange}>
                <MenuItem value="">Selecciona Ejecutivo</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.empleado_id} value={empleado.empleado_id}>{nombreEmpleado(empleado)}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalCliente}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={registrarClienteRapido}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {ConfirmModal}
    </Box>
  );
}
