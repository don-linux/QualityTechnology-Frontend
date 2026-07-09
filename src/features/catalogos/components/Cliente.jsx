import React, { useState, useEffect, useMemo } from "react";
import {
  listClientes,
  listEmpleadosActivosClientes,
  createCliente,
  updateCliente,
  deactivateCliente,
  activateCliente,
} from "@features/catalogos/services/clientesService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
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
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import useAuth from "@app/providers/AuthProvider";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import { ESTADOS_MX } from "@shared/constants/estadosMx";

const EMPTY_FORM = {
  cliente_id: null,
  nombre: "",
  rfc: "",
  unidad_negocio_id: "",
  empresa: "",
  telefono: "",
  email: "",
  localidad: "",
  estado: "",
  ejecutivo_empleado_id: "",
  activo: true,
};

const REQUIRED_FIELDS = [
  "nombre",
  "rfc",
  "unidad_negocio_id",
  "empresa",
  "telefono",
  "email",
  "localidad",
  "estado",
  "ejecutivo_empleado_id",
];

const CAMPOS_FORM = [
  { label: "Razón Social", name: "nombre", size: 12 },
  { label: "RFC", name: "rfc", maxLength: 20 },
  { label: "UdN", name: "unidad_negocio_id", select: "udn" },
  { label: "Nombre del contacto", name: "empresa" },
  { label: "Teléfono", name: "telefono", inputMode: "numeric", maxLength: 10 },
  { label: "Correo Electrónico", name: "email", type: "email" },
  { label: "Localidad", name: "localidad" },
  { label: "Estado", name: "estado", select: "estado" },
  { label: "Ejecutivo", name: "ejecutivo_empleado_id", select: "ejecutivo" },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function soloDigitos(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function nombreEmpleado(empleado) {
  return empleado.nombre_completo
    || [empleado.nombre, empleado.apellido_paterno, empleado.apellido_materno].filter(Boolean).join(" ");
}

export default function Cliente() {
  const showSnackbar = useSnackbar();
  const auth = useAuth();
  const puedeElegirUdN = auth.granja === "ALL";
  const unidadNegocioIdUsuario = localStorage.getItem("unidad_negocio_id") || "";
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientes, setClientes] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

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

  useEffect(() => {
    obtenerDatos();
  }, []);

  useEffect(() => {
    if (puedeElegirUdN || auth.granja === "SIN_UNIDAD" || form.cliente_id) return;
    const udnId = unidadNegocioIdUsuario || String(unidadesDisponibles[0]?.unidad_negocio_id || "");
    if (udnId && form.unidad_negocio_id !== udnId) {
      setForm((prev) => ({ ...prev, unidad_negocio_id: udnId }));
    }
  }, [
    auth.granja,
    form.cliente_id,
    form.unidad_negocio_id,
    puedeElegirUdN,
    unidadNegocioIdUsuario,
    unidadesDisponibles,
  ]);

  const obtenerDatos = async () => {
    const [clientesRes, unidadesRes, empleadosRes] = await Promise.allSettled([
      listClientes(),
      listUnidadesNegocioActivas(),
      listEmpleadosActivosClientes(),
    ]);

    if (clientesRes.status === "fulfilled") {
      setClientes(clientesRes.value.data);
    } else {
      console.error("Error al obtener clientes", clientesRes.reason);
      setClientes([]);
      showSnackbar(clientesRes.reason?.response?.data?.error || "Error al obtener clientes", "error");
    }

    if (unidadesRes.status === "fulfilled") {
      setUnidadesNegocio(unidadesRes.value.data);
    } else {
      console.error("Error al obtener unidades de negocio", unidadesRes.reason);
      setUnidadesNegocio([]);
      showSnackbar("Error al obtener unidades de negocio", "error");
    }

    if (empleadosRes.status === "fulfilled") {
      setEmpleados(empleadosRes.value.data);
    } else {
      console.error("Error al obtener empleados activos", empleadosRes.reason);
      setEmpleados([]);
      showSnackbar("Error al obtener empleados activos", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === "telefono" ? soloDigitos(value) : value;
    setForm({ ...form, [name]: nextValue });
    clearFieldError(name);
  };

  const limpiarFormulario = () => {
    clearErrors();
    const udnDefault = !puedeElegirUdN && auth.granja !== "SIN_UNIDAD"
      ? (unidadNegocioIdUsuario || String(unidadesDisponibles[0]?.unidad_negocio_id || ""))
      : "";
    setForm({ ...EMPTY_FORM, unidad_negocio_id: udnDefault });
    cerrarFormulario();
  };

  const validarFormato = () => {
    if (form.rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres", "error");
      return false;
    }
    if (!/^[0-9]{1,10}$/.test(form.telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos", "error");
      return false;
    }
    if (!EMAIL_RE.test(form.email)) {
      showSnackbar("Ingresa un correo electrónico válido", "error");
      return false;
    }
    return true;
  };

  const construirPayload = () => ({
    nombre: form.nombre.trim(),
    rfc: form.rfc.trim(),
    unidad_negocio_id: Number(form.unidad_negocio_id),
    empresa: form.empresa.trim(),
    telefono: form.telefono,
    email: form.email.trim(),
    localidad: form.localidad.trim(),
    estado: form.estado,
    ejecutivo_empleado_id: Number(form.ejecutivo_empleado_id),
  });

  const guardarConValidacion = async (operacion) => {
    if (!validate(form, REQUIRED_FIELDS) || !validarFormato()) return false;

    await operacion(construirPayload());
    await obtenerDatos();
    limpiarFormulario();
    return true;
  };

  const registrarCliente = async () => {
    try {
      if (await guardarConValidacion(createCliente)) {
        showSnackbar("Cliente registrado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al registrar cliente", error);
      showSnackbar(error?.response?.data?.error || "Error al registrar cliente", "error");
    }
  };

  const actualizarCliente = async () => {
    if (!form.cliente_id) return showSnackbar("Selecciona un cliente para actualizar", "error");
    try {
      if (await guardarConValidacion((payload) => updateCliente(form.cliente_id, payload))) {
        showSnackbar("Cliente actualizado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al actualizar cliente", error);
      showSnackbar(error?.response?.data?.error || "Error al actualizar cliente", "error");
    }
  };

  const toggleActivoCliente = async () => {
    if (!form.cliente_id) return showSnackbar("Selecciona un cliente", "error");
    const activo = form.activo !== false;
    if (!await confirm(activo ? "¿Desactivar este cliente?" : "¿Activar este cliente?")) return;
    try {
      if (activo) await deactivateCliente(form.cliente_id);
      else await activateCliente(form.cliente_id);
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al cambiar el estado del cliente", error);
      showSnackbar(error?.response?.data?.error || "Error al cambiar el estado del cliente", "error");
    }
  };

  const seleccionarCliente = (cliente) => {
    clearErrors();
    setForm({
      cliente_id: cliente.cliente_id,
      nombre: cliente.nombre || "",
      rfc: cliente.rfc || "",
      unidad_negocio_id: cliente.unidad_negocio_id ? String(cliente.unidad_negocio_id) : "",
      empresa: cliente.empresa || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      localidad: cliente.localidad || "",
      estado: cliente.estado || "",
      ejecutivo_empleado_id: cliente.ejecutivo_empleado_id ? String(cliente.ejecutivo_empleado_id) : "",
      activo: cliente.activo,
    });
    abrirFormulario();
  };

  const renderOpciones = (campo) => {
    if (campo.select === "estado") {
      return ESTADOS_MX.map((estado) => (
        <MenuItem key={estado} value={estado}>
          {estado}
        </MenuItem>
      ));
    }

    if (campo.select === "udn") {
      return unidadesDisponibles.map((unidad) => (
        <MenuItem key={unidad.unidad_negocio_id} value={unidad.unidad_negocio_id}>
          {unidad.nombre}
        </MenuItem>
      ));
    }

    if (campo.select === "ejecutivo") {
      return empleados.map((empleado) => (
        <MenuItem key={empleado.empleado_id} value={empleado.empleado_id}>
          {nombreEmpleado(empleado)}
        </MenuItem>
      ));
    }

    return null;
  };

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }} align="center">
         Registro de Clientes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
        {auth.granja === "ALL"
          ? "Se muestran los clientes de todas las unidades de negocio."
          : auth.granja === "SIN_UNIDAD"
            ? "Tu usuario no tiene una unidad de negocio asignada; no hay clientes visibles."
            : `Solo se muestran los clientes de tu unidad de negocio (${auth.granja}).`}
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {CAMPOS_FORM.map((campo) => (
              <Grid key={campo.name} size={campo.size || { xs: 12, md: 6 }}>
                {campo.select === "udn" && !puedeElegirUdN ? (
                  <TextField
                    name={campo.name}
                    label={campo.label}
                    fullWidth
                    value={unidadesDisponibles[0]?.nombre || auth.granja || ""}
                    slotProps={{ input: { readOnly: true } }}
                  />
                ) : (
                <TextField
                  name={campo.name}
                  label={campo.label}
                  type={campo.type || "text"}
                  select={!!campo.select}
                  fullWidth
                  value={form[campo.name]}
                  onChange={handleChange}
                  error={!!errors[campo.name]}
                  helperText={errors[campo.name]}
                  inputProps={{
                    maxLength: campo.maxLength,
                    inputMode: campo.inputMode,
                  }}
                >
                  {campo.select && <MenuItem value="">Selecciona {campo.label}</MenuItem>}
                  {renderOpciones(campo)}
                </TextField>
                )}
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button variant="contained" color="success" onClick={registrarCliente} disabled={!!form.cliente_id}>
              Registrar
            </Button>

            <Button variant="contained" color="primary" onClick={actualizarCliente} disabled={!form.cliente_id}>
              Actualizar
            </Button>

            <Button
              variant="contained"
              color={form.activo !== false ? "warning" : "success"}
              onClick={toggleActivoCliente}
              disabled={!form.cliente_id}
            >
              {form.activo !== false ? "Desactivar" : "Activar"}
            </Button>

            <Button variant="outlined" onClick={limpiarFormulario}>
              Limpiar
            </Button>
          </Stack>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      <Box sx={{ maxHeight: 460, overflow: "auto" }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Razón Social</TableCell>
                <TableCell>RFC</TableCell>
                <TableCell>UdN</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Localidad</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Ejecutivo</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenarYNumerar(clientes, ["cliente_id", "id"]).map((cli) => (
                <TableRow key={cli.cliente_id} hover sx={{ opacity: cli.activo !== false ? 1 : 0.5 }}>
                  <TableCell>{cli._num}</TableCell>
                  <TableCell>{cli.nombre}</TableCell>
                  <TableCell>{cli.rfc}</TableCell>
                  <TableCell>{cli.unidad_negocio_nombre}</TableCell>
                  <TableCell>{cli.empresa}</TableCell>
                  <TableCell>{cli.telefono}</TableCell>
                  <TableCell>{cli.email}</TableCell>
                  <TableCell>{cli.localidad}</TableCell>
                  <TableCell>{cli.estado}</TableCell>
                  <TableCell>{cli.ejecutivo_nombre}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => seleccionarCliente(cli)}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {ConfirmModal}
    </Container>
  );
}
