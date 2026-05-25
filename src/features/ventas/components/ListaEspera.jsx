import React, { useState, useEffect, useMemo } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
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
  createRegistro,
  updateRegistro,
  removeRegistro,
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
import { ESTADOS_MX } from "@shared/constants/estadosMx";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const EMPTY_CLIENTE_RAPIDO = {
  fc_razon_social: "",
  fc_rfc: "",
  fi_unidad_negocio_id: "",
  fc_nombre_contacto: "",
  fc_telefono: "",
  fc_correo: "",
  fc_localidad: "",
  fc_estado: "",
  fi_ejecutivo_empleado_id: "",
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
  return Number(p?.cantidad ?? p?.fn_cantidad ?? 0);
}

function formatStock(num) {
  return Number(num ?? 0).toLocaleString("en-US");
}

function soloDigitos(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function nombreEmpleado(empleado) {
  return empleado.fc_nombre_completo
    || [empleado.fc_nombre, empleado.fc_apellido_paterno, empleado.fc_apellido_materno].filter(Boolean).join(" ");
}

export default function ListaEspera() {
  return <ListaEsperaContent />;
}

function ListaEsperaContent() {
  const showSnackbar = useSnackbar();
  const auth = useAuth();
  const rol = auth.rol;
  const nombreUsuario = auth.nombre;
  const {
    ubicacionesGranja,
    defaultUbicacion,
    resolveUnidadByRol,
  } = useUbicacionesGranja();
  const granjaDefault = resolveUnidadByRol(rol)?.fc_nombre || defaultUbicacion;

  const [editId, setEditId] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [openCliente, setOpenCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState(EMPTY_CLIENTE_RAPIDO);
  const [openConvertir, setOpenConvertir] = useState(false);
  const [itemConvertir, setItemConvertir] = useState(null);
  const [piletaOrigenId, setPiletaOrigenId] = useState("");
  const [piletas, setPiletas] = useState([]);
  const [cargandoPiletas, setCargandoPiletas] = useState(false);

  const emptyForm = {
    fd_fecha_entrega: "",
    fc_talla: "",
    fn_cantidad: "",
    fc_cliente: "",
    fc_lugar_entrega: "",
    fc_encargado_venta: nombreUsuario,
    fc_unidad_produccion: "",
    fc_hora_embolsado: "",
    fc_hora_entrega: "",
    fn_precio_venta: "",
    fc_uap_asignada: "",
    fc_granja_asignada: granjaDefault,
  };

  const [form, setForm] = useState(emptyForm);
  const [lista, setLista] = useState([]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fd_fecha_entrega", "fc_talla", "fn_cantidad", "fc_cliente",
    "fc_lugar_entrega", "fc_unidad_produccion", "fc_hora_embolsado",
    "fc_hora_entrega", "fn_precio_venta", "fc_uap_asignada",
    "fc_granja_asignada",
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
    if (!form.fc_granja_asignada && granjaDefault) {
      setForm((prev) => ({ ...prev, fc_granja_asignada: granjaDefault }));
    }
  }, [form.fc_granja_asignada, granjaDefault]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente({
      ...nuevoCliente,
      [name]: name === "fc_telefono" ? soloDigitos(value) : value,
    });
  };

  const registrar = async () => {
    if (!validate(form, requiredFields)) return;

    if (!form.fd_fecha_entrega) {
      showSnackbar("Debes seleccionar una fecha de entrega.", "error");
      return;
    }

    try {
      await createRegistro(form);
      showSnackbar("Registrado en Lista de Espera", "success");
      setForm(emptyForm);
      cargarLista();
    } catch (err) {
      console.error("Error al registrar en lista de espera:", err);
    }
  };

  const editar = (item) => {
    clearErrors();
    setEditId(item.fi_lista_id);
    setForm({
      fd_fecha_entrega: item.fd_fecha_entrega || "",
      fc_talla: item.fc_talla || "",
      fn_cantidad: item.fn_cantidad || "",
      fc_cliente: item.fc_cliente || "",
      fc_lugar_entrega: item.fc_lugar_entrega || "",
      fc_encargado_venta: item.fc_encargado_venta || nombreUsuario,
      fc_unidad_produccion: item.fc_unidad_produccion || "",
      fc_hora_embolsado: item.fc_hora_embolsado || "",
      fc_hora_entrega: item.fc_hora_entrega || "",
      fn_precio_venta: item.fn_precio_venta || "",
      fc_uap_asignada: item.fc_uap_asignada || "",
      fc_granja_asignada: item.fc_granja_asignada || granjaDefault,
    });
  };

  const actualizar = async () => {
    if (!validate(form, requiredFields)) return;

    try {
      await updateRegistro(editId, form);
      showSnackbar("Actualizado correctamente", "success");
      setEditId(null);
      setForm(emptyForm);
      cargarLista();
    } catch (err) {
      console.error("Error al actualizar en lista de espera:", err);
    }
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar este registro?")) return;

    try {
      await removeRegistro(id);
      showSnackbar("Eliminado", "success");
      cargarLista();
    } catch (err) {
      console.error("Error al eliminar en lista de espera:", err);
    }
  };

  const convertir = async (item) => {
    const tipo = item.fc_uap_asignada ?? item.tipo_venta;
    if (ventaRequierePileta(tipo)) {
      setItemConvertir(item);
      setPiletaOrigenId("");
      setOpenConvertir(true);
      await cargarPiletasParaVenta(item.fc_granja_asignada ?? item.granja, tipo);
      return;
    }

    if (!await confirm("¿Convertir a venta real?")) return;

    try {
      await convertirAVenta(item.fi_lista_id);
      showSnackbar("Convertido a venta correctamente", "success");
      cargarLista();
    } catch (err) {
      const message = err?.response?.data?.error || err.message;
      showSnackbar("Error al convertir: " + message, "error");
    }
  };

  const cargarPiletasParaVenta = async (granja, tipoVenta) => {
    const etapa = etapaPiletaParaTipo(tipoVenta);
    if (!etapa) {
      setPiletas([]);
      return;
    }
    setCargandoPiletas(true);
    try {
      const res = await listPiletas(granja || null, etapa);
      const rows = Array.isArray(res.data) ? res.data : [];
      setPiletas(rows.filter((p) => Number(p.cantidad ?? p.fn_cantidad ?? 0) > 0));
    } catch (err) {
      console.error("Error al cargar piletas:", err);
      setPiletas([]);
    } finally {
      setCargandoPiletas(false);
    }
  };

  const piletaSeleccionada = useMemo(() => {
    if (!piletaOrigenId) return null;
    return (
      piletas.find((p) => String(p.fi_pileta_id ?? p.pileta_id) === piletaOrigenId) ?? null
    );
  }, [piletaOrigenId, piletas]);

  const cantidadPedido = Number(itemConvertir?.fn_cantidad ?? 0);
  const stockOrigen = piletaSeleccionada != null ? stockPileta(piletaSeleccionada) : null;
  const cantidadExcedeStock =
    stockOrigen != null && cantidadPedido > 0 && cantidadPedido > stockOrigen;

  const confirmarConversion = async () => {
    if (!itemConvertir) return;
    if (!piletaOrigenId) {
      showSnackbar("Selecciona la pileta de origen para la venta.", "error");
      return;
    }
    if (cantidadExcedeStock) {
      showSnackbar(
        `La cantidad del pedido (${formatStock(cantidadPedido)}) supera el stock disponible (${formatStock(stockOrigen)}).`,
        "error",
      );
      return;
    }

    try {
      await convertirAVenta(itemConvertir.fi_lista_id, {
        pileta_origen_id: Number(piletaOrigenId),
      });
      showSnackbar("Convertido a venta correctamente", "success");
      setOpenConvertir(false);
      setItemConvertir(null);
      setPiletaOrigenId("");
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
    if (nuevoCliente.fc_rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres", "error");
      return;
    }
    if (!/^[0-9]{1,10}$/.test(nuevoCliente.fc_telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos", "error");
      return;
    }
    if (!EMAIL_RE.test(nuevoCliente.fc_correo)) {
      showSnackbar("Ingresa un correo electrónico válido", "error");
      return;
    }

    try {
      await createClienteRapido({
        ...nuevoCliente,
        fc_razon_social: nuevoCliente.fc_razon_social.trim(),
        fc_rfc: nuevoCliente.fc_rfc.trim(),
        fi_unidad_negocio_id: Number(nuevoCliente.fi_unidad_negocio_id),
        fc_nombre_contacto: nuevoCliente.fc_nombre_contacto.trim(),
        fc_correo: nuevoCliente.fc_correo.trim(),
        fc_localidad: nuevoCliente.fc_localidad.trim(),
        fi_ejecutivo_empleado_id: Number(nuevoCliente.fi_ejecutivo_empleado_id),
      });
      await cargarClientes();
      setOpenCliente(false);
      setNuevoCliente(EMPTY_CLIENTE_RAPIDO);
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "Error al registrar cliente", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
         Lista de Espera
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Registrar / Editar Pedido
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha de Entrega"
              name="fd_fecha_entrega"
              value={form.fd_fecha_entrega}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              error={!!errors.fd_fecha_entrega}
              helperText={errors.fd_fecha_entrega}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Talla" name="fc_talla" value={form.fc_talla} onChange={handleChange} error={!!errors.fc_talla} helperText={errors.fc_talla} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth type="number" label="Cantidad" name="fn_cantidad" value={form.fn_cantidad} onChange={handleChange} error={!!errors.fn_cantidad} helperText={errors.fn_cantidad} />
          </Grid>

          {/* CLIENTE AUTOCOMPLETE */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Grid container spacing={1}>
              <Grid size={10}>
                <Autocomplete
                  freeSolo
                  fullWidth
                  options={clientes}
                  getOptionLabel={(o) => (typeof o === "string" ? o : o.fc_razon_social || "")}
                  value={form.fc_cliente}
                  onChange={(e, val) => {
                    setForm({
                      ...form,
                      fc_cliente: typeof val === "string" ? val : val?.fc_razon_social || "",
                    });
                    clearFieldError("fc_cliente");
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Cliente" error={!!errors.fc_cliente} helperText={errors.fc_cliente} />
                  )}
                />
              </Grid>
              <Grid size={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={() => setOpenCliente(true)}
                >
                  <AddIcon />
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Lugar" name="fc_lugar_entrega" value={form.fc_lugar_entrega} onChange={handleChange} error={!!errors.fc_lugar_entrega} helperText={errors.fc_lugar_entrega} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Unidad Producción" name="fc_unidad_produccion" value={form.fc_unidad_produccion} onChange={handleChange} error={!!errors.fc_unidad_produccion} helperText={errors.fc_unidad_produccion} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Hora Embolsado" name="fc_hora_embolsado" value={form.fc_hora_embolsado} onChange={handleChange} error={!!errors.fc_hora_embolsado} helperText={errors.fc_hora_embolsado} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Hora Entrega" name="fc_hora_entrega" value={form.fc_hora_entrega} onChange={handleChange} error={!!errors.fc_hora_entrega} helperText={errors.fc_hora_entrega} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth label="Precio Venta" name="fn_precio_venta" value={form.fn_precio_venta} onChange={handleChange} error={!!errors.fn_precio_venta} helperText={errors.fn_precio_venta} />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth error={!!errors.fc_uap_asignada}>
              <InputLabel>Tipo de Venta</InputLabel>
              <Select
                name="fc_uap_asignada"
                value={form.fc_uap_asignada}
                onChange={handleChange}
                label="Tipo de Venta"
              >
                <MenuItem value="ALEVIN">Alevines (por pieza)</MenuItem>
                <MenuItem value="KG">Mojarra (por Kg)</MenuItem>
                <MenuItem value="ALIMENTO">Alimento</MenuItem>
                <MenuItem value="MEDICAMENTO">Medicamento</MenuItem>
              </Select>
              {errors.fc_uap_asignada && <FormHelperText>{errors.fc_uap_asignada}</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            {rol === "Administrador" ? (
              <TextField select fullWidth label="Granja" name="fc_granja_asignada" value={form.fc_granja_asignada} onChange={handleChange} error={!!errors.fc_granja_asignada} helperText={errors.fc_granja_asignada}>
                {ubicacionesGranja.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField fullWidth label="Granja" name="fc_granja_asignada" value={form.fc_granja_asignada} slotProps={{ input: { readOnly: true } }} />
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          {!editId ? (
            <Button variant="contained" onClick={registrar}>
              Registrar en Lista de Espera
            </Button>
          ) : (
            <>
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
            </>
          )}
        </Box>
      </Paper>

      {/* Tabla */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Lista de Pedidos
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Lugar</TableCell>
                <TableCell>Granja</TableCell>
                <TableCell>Precio</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lista.map((item) => (
                <TableRow key={item.fi_lista_id}>
                  <TableCell>{item.fd_fecha_entrega}</TableCell>
                  <TableCell>{item.fc_cliente}</TableCell>
                  <TableCell>{item.fn_cantidad}</TableCell>
                  <TableCell>{item.fc_lugar_entrega}</TableCell>
                <TableCell>{item.fc_granja_asignada ?? item.granja ?? "—"}</TableCell>
                <TableCell>${item.fn_precio_venta}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="warning" sx={{ mr: 1 }} onClick={() => editar(item)}>
                    Editar
                  </Button>
                  <Button variant="outlined" color="error" sx={{ mr: 1 }} onClick={() => eliminar(item.fi_lista_id)}>
                    Eliminar
                  </Button>
                  <Button variant="contained" color="success" onClick={() => convertir(item)}>
                    Convertir
                  </Button>
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openConvertir}
        onClose={() => {
          setOpenConvertir(false);
          setItemConvertir(null);
          setPiletaOrigenId("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Convertir a venta — trazabilidad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Seleccione la pileta de origen. El inventario se descontará y el movimiento
            quedará registrado en Trazabilidad.
          </Typography>
          {itemConvertir && (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Cliente: <strong>{itemConvertir.fc_cliente}</strong> · Cantidad:{" "}
              <strong>{itemConvertir.fn_cantidad}</strong>
            </Typography>
          )}
          <TextField
            select
            fullWidth
            label="Pileta origen"
            value={piletaOrigenId}
            onChange={(e) => setPiletaOrigenId(e.target.value)}
            disabled={cargandoPiletas}
            error={cantidadExcedeStock}
            helperText={
              cantidadExcedeStock
                ? `Stock insuficiente: disponible ${formatStock(stockOrigen)}, pedido ${formatStock(cantidadPedido)}`
                : cargandoPiletas
                  ? "Cargando piletas..."
                  : piletas.length === 0
                    ? "No hay piletas con stock en esta granja"
                    : stockOrigen != null
                      ? `Disponible en pileta: ${formatStock(stockOrigen)} organismos`
                      : "Solo piletas con inventario disponible"
            }
          >
            <MenuItem value="">— Seleccionar —</MenuItem>
            {piletas.map((p) => (
              <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                {etiquetaPileta(p)}
              </MenuItem>
            ))}
          </TextField>
          {piletaSeleccionada && (
            <Alert severity={cantidadExcedeStock ? "error" : "info"} sx={{ mt: 2 }}>
              {cantidadExcedeStock
                ? `El pedido requiere ${formatStock(cantidadPedido)} organismos, pero ${piletaSeleccionada.nombre} solo tiene ${formatStock(stockOrigen)}.`
                : `Stock en ${piletaSeleccionada.nombre}: ${formatStock(stockOrigen)} organismos · Pedido: ${formatStock(cantidadPedido)}`}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenConvertir(false);
              setItemConvertir(null);
              setPiletaOrigenId("");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmarConversion}
            disabled={!piletaOrigenId || piletas.length === 0 || cantidadExcedeStock}
          >
            Confirmar venta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para cliente rápido */}
      <Dialog open={openCliente} onClose={() => setOpenCliente(false)} fullWidth maxWidth="sm">
        <DialogTitle>Registrar nuevo cliente</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField name="fc_razon_social" label="Razón Social" fullWidth value={nuevoCliente.fc_razon_social} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="fc_rfc" label="RFC" fullWidth value={nuevoCliente.fc_rfc} onChange={handleNuevoClienteChange} inputProps={{ maxLength: 20 }} />
            </Grid>
            <Grid size={6}>
              <TextField select name="fi_unidad_negocio_id" label="UdN" fullWidth value={nuevoCliente.fi_unidad_negocio_id} onChange={handleNuevoClienteChange}>
                <MenuItem value="">Selecciona UdN</MenuItem>
                {unidadesNegocio.map((unidad) => (
                  <MenuItem key={unidad.fi_unidad_negocio_id} value={unidad.fi_unidad_negocio_id}>{unidad.fc_nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField name="fc_nombre_contacto" label="Nombre del contacto" fullWidth value={nuevoCliente.fc_nombre_contacto} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="fc_telefono" label="Teléfono" fullWidth value={nuevoCliente.fc_telefono} onChange={handleNuevoClienteChange} inputProps={{ maxLength: 10, inputMode: "numeric" }} />
            </Grid>
            <Grid size={6}>
              <TextField name="fc_correo" type="email" label="Correo" fullWidth value={nuevoCliente.fc_correo} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField name="fc_localidad" label="Localidad" fullWidth value={nuevoCliente.fc_localidad} onChange={handleNuevoClienteChange} />
            </Grid>
            <Grid size={6}>
              <TextField select name="fc_estado" label="Estado" fullWidth value={nuevoCliente.fc_estado} onChange={handleNuevoClienteChange}>
                <MenuItem value="">Selecciona Estado</MenuItem>
                {ESTADOS_MX.map((estado) => (
                  <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={6}>
              <TextField select name="fi_ejecutivo_empleado_id" label="Ejecutivo" fullWidth value={nuevoCliente.fi_ejecutivo_empleado_id} onChange={handleNuevoClienteChange}>
                <MenuItem value="">Selecciona Ejecutivo</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fi_empleado_id}>{nombreEmpleado(empleado)}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCliente(false)}>Cancelar</Button>
          <Button variant="contained" color="success" onClick={registrarClienteRapido}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      {ConfirmModal}
    </Box>
  );
}
