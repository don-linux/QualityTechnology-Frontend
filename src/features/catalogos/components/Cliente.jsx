import React, { useState, useEffect } from "react";
import {
  listClientes,
  listEmpleadosActivosClientes,
  createCliente,
  updateCliente,
  removeCliente,
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
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import { ESTADOS_MX } from "@shared/constants/estadosMx";

const EMPTY_FORM = {
  fi_cliente_id: null,
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

const REQUIRED_FIELDS = [
  "fc_razon_social",
  "fc_rfc",
  "fi_unidad_negocio_id",
  "fc_nombre_contacto",
  "fc_telefono",
  "fc_correo",
  "fc_localidad",
  "fc_estado",
  "fi_ejecutivo_empleado_id",
];

const CAMPOS_FORM = [
  { label: "Razón Social", name: "fc_razon_social", size: 12 },
  { label: "RFC", name: "fc_rfc", maxLength: 20 },
  { label: "UdN", name: "fi_unidad_negocio_id", select: "udn" },
  { label: "Nombre del contacto", name: "fc_nombre_contacto" },
  { label: "Teléfono", name: "fc_telefono", inputMode: "numeric", maxLength: 10 },
  { label: "Correo Electrónico", name: "fc_correo", type: "email" },
  { label: "Localidad", name: "fc_localidad" },
  { label: "Estado", name: "fc_estado", select: "estado" },
  { label: "Ejecutivo", name: "fi_ejecutivo_empleado_id", select: "ejecutivo" },
];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function soloDigitos(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function nombreEmpleado(empleado) {
  return empleado.fc_nombre_completo
    || [empleado.fc_nombre, empleado.fc_apellido_paterno, empleado.fc_apellido_materno].filter(Boolean).join(" ");
}

export default function Cliente() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientes, setClientes] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  useEffect(() => {
    obtenerDatos();
  }, []);

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
    const nextValue = name === "fc_telefono" ? soloDigitos(value) : value;
    setForm({ ...form, [name]: nextValue });
    clearFieldError(name);
  };

  const limpiarFormulario = () => {
    clearErrors();
    setForm(EMPTY_FORM);
    cerrarFormulario();
  };

  const validarFormato = () => {
    if (form.fc_rfc.length > 20) {
      showSnackbar("El RFC debe tener máximo 20 caracteres", "error");
      return false;
    }
    if (!/^[0-9]{1,10}$/.test(form.fc_telefono)) {
      showSnackbar("El teléfono debe contener solo números y máximo 10 dígitos", "error");
      return false;
    }
    if (!EMAIL_RE.test(form.fc_correo)) {
      showSnackbar("Ingresa un correo electrónico válido", "error");
      return false;
    }
    return true;
  };

  const construirPayload = () => ({
    fc_razon_social: form.fc_razon_social.trim(),
    fc_rfc: form.fc_rfc.trim(),
    fi_unidad_negocio_id: Number(form.fi_unidad_negocio_id),
    fc_nombre_contacto: form.fc_nombre_contacto.trim(),
    fc_telefono: form.fc_telefono,
    fc_correo: form.fc_correo.trim(),
    fc_localidad: form.fc_localidad.trim(),
    fc_estado: form.fc_estado,
    fi_ejecutivo_empleado_id: Number(form.fi_ejecutivo_empleado_id),
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
    if (!form.fi_cliente_id) return showSnackbar("Selecciona un cliente para actualizar", "error");
    try {
      if (await guardarConValidacion((payload) => updateCliente(form.fi_cliente_id, payload))) {
        showSnackbar("Cliente actualizado correctamente", "success");
      }
    } catch (error) {
      console.error("Error al actualizar cliente", error);
      showSnackbar(error?.response?.data?.error || "Error al actualizar cliente", "error");
    }
  };

  const eliminarCliente = async () => {
    if (!form.fi_cliente_id) return showSnackbar("Selecciona un cliente para eliminar", "error");
    if (!await confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await removeCliente(form.fi_cliente_id);
      obtenerDatos();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
      showSnackbar("Error al eliminar cliente", "error");
    }
  };

  const seleccionarCliente = (cliente) => {
    clearErrors();
    setForm({
      fi_cliente_id: cliente.fi_cliente_id,
      fc_razon_social: cliente.fc_razon_social || "",
      fc_rfc: cliente.fc_rfc || "",
      fi_unidad_negocio_id: cliente.fi_unidad_negocio_id ? String(cliente.fi_unidad_negocio_id) : "",
      fc_nombre_contacto: cliente.fc_nombre_contacto || "",
      fc_telefono: cliente.fc_telefono || "",
      fc_correo: cliente.fc_correo || "",
      fc_localidad: cliente.fc_localidad || "",
      fc_estado: cliente.fc_estado || "",
      fi_ejecutivo_empleado_id: cliente.fi_ejecutivo_empleado_id ? String(cliente.fi_ejecutivo_empleado_id) : "",
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
      return unidadesNegocio.map((unidad) => (
        <MenuItem key={unidad.fi_unidad_negocio_id} value={unidad.fi_unidad_negocio_id}>
          {unidad.fc_nombre}
        </MenuItem>
      ));
    }

    if (campo.select === "ejecutivo") {
      return empleados.map((empleado) => (
        <MenuItem key={empleado.fi_empleado_id} value={empleado.fi_empleado_id}>
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

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {CAMPOS_FORM.map((campo) => (
              <Grid key={campo.name} size={campo.size || { xs: 12, md: 6 }}>
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
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button variant="contained" color="success" onClick={registrarCliente} disabled={!!form.fi_cliente_id}>
              Registrar
            </Button>

            <Button variant="contained" color="primary" onClick={actualizarCliente} disabled={!form.fi_cliente_id}>
              Actualizar
            </Button>

            <Button variant="contained" color="error" onClick={eliminarCliente} disabled={!form.fi_cliente_id}>
              Eliminar
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
              {ordenarYNumerar(clientes, ["fi_cliente_id", "cliente_id"]).map((cli) => (
                <TableRow key={cli.fi_cliente_id} hover>
                  <TableCell>{cli._num}</TableCell>
                  <TableCell>{cli.fc_razon_social}</TableCell>
                  <TableCell>{cli.fc_rfc}</TableCell>
                  <TableCell>{cli.unidad_negocio_nombre}</TableCell>
                  <TableCell>{cli.fc_nombre_contacto}</TableCell>
                  <TableCell>{cli.fc_telefono}</TableCell>
                  <TableCell>{cli.fc_correo}</TableCell>
                  <TableCell>{cli.fc_localidad}</TableCell>
                  <TableCell>{cli.fc_estado}</TableCell>
                  <TableCell>{cli.ejecutivo_nombre}</TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => seleccionarCliente(cli)}>
                      Seleccionar
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
