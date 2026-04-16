import React, { useState, useEffect } from "react";
import { listClientes, createCliente, updateCliente, removeCliente } from "@features/catalogos/services/clientesService";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
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
import dayjs from "dayjs";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

export default function Cliente() {
  const showSnackbar = useSnackbar();
  const auth = useAuth();
  const usuarioId = auth.usuarioId || "";
  const [form, setForm] = useState({
    fi_cliente_id: null,
    fc_nombre: "",
    fc_telefono: "",
    fc_correo: "",
    fc_localidad: "",
    fc_cp: "",
    fi_usuario_id: usuarioId,
  });

  const [clientes, setClientes] = useState([]);

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = ["fc_nombre", "fc_telefono", "fc_correo", "fc_localidad", "fc_cp"];

  useEffect(() => {
    obtenerClientes();
  }, []);

  const obtenerClientes = async () => {
    try {
      const res = await listClientes();
      setClientes(res.data);
    } catch (error) {
      console.error("Error al obtener clientes", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiarFormulario = () => {
    clearErrors();
    setForm({
      fi_cliente_id: null,
      fc_nombre: "",
      fc_telefono: "",
      fc_correo: "",
      fc_localidad: "",
      fc_cp: "",
      fi_usuario_id: usuarioId,
    });
  };

  const registrarCliente = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      await createCliente(form);
      obtenerClientes();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar cliente", error);
      showSnackbar(" Error al registrar cliente", "error");
    }
  };

  const actualizarCliente = async () => {
    if (!form.fi_cliente_id) return showSnackbar("Selecciona un cliente para actualizar", "error");
    if (!validate(form, requiredFields)) return;
    try {
      await updateCliente(form.fi_cliente_id, form);
      obtenerClientes();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al actualizar cliente", error);
      showSnackbar(" Error al actualizar cliente", "error");
    }
  };

  const eliminarCliente = async () => {
    if (!form.fi_cliente_id) return showSnackbar("Selecciona un cliente para eliminar", "error");
    if (!await confirm("¿Seguro que deseas eliminar este cliente?")) return;
    try {
      await removeCliente(form.fi_cliente_id);
      obtenerClientes();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al eliminar cliente", error);
      showSnackbar(" Error al eliminar cliente", "error");
    }
  };

  const seleccionarCliente = (cliente) => {
    clearErrors();
    setForm({
      fi_cliente_id: cliente.fi_cliente_id,
      fc_nombre: cliente.fc_nombre || "",
      fc_telefono: cliente.fc_telefono || "",
      fc_correo: cliente.fc_correo || "",
      fc_localidad: cliente.fc_localidad || "",
      fc_cp: cliente.fc_cp || "",
      fi_usuario_id: cliente.fi_usuario_id ? String(cliente.fi_usuario_id) : usuarioId,
    });
  };

  return (
    <Container maxWidth="md" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }} align="center">
         Registro de Clientes
      </Typography>

      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="fc_nombre"
                label="Nombre o Razón Social"
                fullWidth
                value={form.fc_nombre}
                onChange={handleChange}
                error={!!errors.fc_nombre}
                helperText={errors.fc_nombre}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                name="fc_telefono"
                label="Teléfono"
                fullWidth
                value={form.fc_telefono}
                onChange={handleChange}
                error={!!errors.fc_telefono}
                helperText={errors.fc_telefono}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                name="fc_correo"
                label="Correo Electrónico"
                fullWidth
                value={form.fc_correo}
                onChange={handleChange}
                error={!!errors.fc_correo}
                helperText={errors.fc_correo}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                name="fc_localidad"
                label="Localidad"
                fullWidth
                value={form.fc_localidad}
                onChange={handleChange}
                error={!!errors.fc_localidad}
                helperText={errors.fc_localidad}
              />
            </Grid>

            <Grid size={6}>
              <TextField
                name="fc_cp"
                label="Código Postal"
                fullWidth
                value={form.fc_cp}
                onChange={handleChange}
                error={!!errors.fc_cp}
                helperText={errors.fc_cp}
              />
            </Grid>
          </Grid>

          {/* Botones */}
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

      {/* Tabla de Clientes */}
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Localidad</TableCell>
                <TableCell>CP</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cli) => (
                <TableRow key={cli.fi_cliente_id} hover>
                  <TableCell>{cli.fc_nombre}</TableCell>
                  <TableCell>{cli.fc_telefono}</TableCell>
                  <TableCell>{cli.fc_correo}</TableCell>
                  <TableCell>{cli.fc_localidad}</TableCell>
                  <TableCell>{cli.fc_cp}</TableCell>
                  <TableCell>
                    {cli.fd_fecha_registro ? dayjs(cli.fd_fecha_registro).format("DD/MM/YYYY") : ""}
                  </TableCell>
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
