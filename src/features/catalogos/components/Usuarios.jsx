import React, { useState } from "react";
import useFormValidation from "@shared/hooks/useFormValidation";
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
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import PasswordField from "@shared/components/PasswordField";
import useConfirm from "@shared/hooks/useConfirm";
import useUsuarios from "../hooks/useUsuarios";

export default function UsuariosRegistro() {
  const [form, setForm] = useState({
    nombre: "",
    contraseña: "",
    rol_id: "",
    fc_nombre_empleado: "",
    fc_apellido_paterno: "",
    fc_apellido_materno: "",
    fi_departamento_id: "",
    fi_puesto_id: "",
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { usuarios, roles, departamentos, puestos, crearUsuario, actualizarUsuario, toggleActivo } = useUsuarios();

  const rolSeleccionado = roles.find((r) => r.fi_rol_id === Number(form.rol_id));
  const esRoot = rolSeleccionado?.fb_es_root === true;

  const requiredFields = esRoot || usuarioSeleccionado
    ? ["nombre", "contraseña", "rol_id"]
    : ["nombre", "contraseña", "rol_id", "fc_nombre_empleado", "fc_apellido_paterno", "fc_apellido_materno", "fi_departamento_id"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const handleSubmit = async () => {
    if (!validate(form, requiredFields)) return;
    if (await crearUsuario(form)) limpiarFormulario();
  };

  const handleUpdate = async () => {
    if (!usuarioSeleccionado) return;
    if (!validate(form, ["nombre", "contraseña", "rol_id"])) return;
    const ok = await actualizarUsuario(usuarioSeleccionado.fi_usuario_id, {
      nombre: form.nombre,
      contraseña: form.contraseña,
      rol_id: form.rol_id,
    });
    if (ok) limpiarFormulario();
  };

  const handleToggleActive = async (usuario) => {
    const accion = usuario.fb_activo ? "desactivar" : "activar";
    if (!await confirm(`¿Seguro que deseas ${accion} al usuario "${usuario.fc_nombre}"?`)) return;
    await toggleActivo(usuario);
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setForm({
      nombre: usuario.fc_nombre,
      contraseña: "",
      rol_id: usuario.fi_rol_id,
      fc_nombre_empleado: "",
      fc_apellido_paterno: "",
      fc_apellido_materno: "",
      fi_departamento_id: "",
      fi_puesto_id: "",
    });
    clearErrors();
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "", contraseña: "", rol_id: "",
      fc_nombre_empleado: "", fc_apellido_paterno: "", fc_apellido_materno: "",
      fi_departamento_id: "", fi_puesto_id: "",
    });
    setUsuarioSeleccionado(null);
    clearErrors();
  };

  const obtenerNombreRol = (rolId) => {
    const rol = roles.find((r) => r.fi_rol_id === rolId);
    return rol ? rol.fc_nombre : rolId;
  };

  const mostrarCamposEmpleado = !usuarioSeleccionado && form.rol_id && !esRoot;

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Registro de Usuarios</Typography>
        <Typography variant="body2" color="text.secondary">
          Administra los usuarios del sistema
        </Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {usuarioSeleccionado ? "Editando Usuario" : "Nuevo Usuario"}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField name="nombre" label="Nombre de Usuario" fullWidth value={form.nombre} onChange={handleChange} error={!!errors.nombre} helperText={errors.nombre} />
            </Grid>
            <Grid size={12}>
              <PasswordField name="contraseña" label="Contraseña" fullWidth value={form.contraseña} onChange={handleChange} error={!!errors.contraseña} helperText={errors.contraseña} />
            </Grid>
            <Grid size={12}>
              <TextField select name="rol_id" label="Rol" fullWidth value={form.rol_id} onChange={handleChange} error={!!errors.rol_id} helperText={errors.rol_id}>
                {roles.map((rol) => (
                  <MenuItem key={rol.fi_rol_id} value={rol.fi_rol_id}>{rol.fc_nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {mostrarCamposEmpleado && (
              <>
                <Grid size={12}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Datos del empleado (se crea automaticamente)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name="fc_nombre_empleado" label="Nombre" fullWidth value={form.fc_nombre_empleado} onChange={handleChange} error={!!errors.fc_nombre_empleado} helperText={errors.fc_nombre_empleado} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name="fc_apellido_paterno" label="Apellido Paterno" fullWidth value={form.fc_apellido_paterno} onChange={handleChange} error={!!errors.fc_apellido_paterno} helperText={errors.fc_apellido_paterno} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField name="fc_apellido_materno" label="Apellido Materno" fullWidth value={form.fc_apellido_materno} onChange={handleChange} error={!!errors.fc_apellido_materno} helperText={errors.fc_apellido_materno} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select name="fi_departamento_id" label="Departamento" fullWidth value={form.fi_departamento_id} onChange={handleChange} error={!!errors.fi_departamento_id} helperText={errors.fi_departamento_id}>
                    {departamentos.map((d) => (
                      <MenuItem key={d.fi_departamento_id} value={d.fi_departamento_id}>{d.fc_nombre}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select name="fi_puesto_id" label="Puesto" fullWidth value={form.fi_puesto_id} onChange={handleChange}>
                    <MenuItem value="">Sin asignar</MenuItem>
                    {puestos.map((p) => (
                      <MenuItem key={p.fi_puesto_id} value={p.fi_puesto_id}>{p.fc_nombre}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            <Grid size={12}>
              <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={handleSubmit} disabled={!!usuarioSeleccionado}>
                Registrar
              </Button>
              <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={handleUpdate} disabled={!usuarioSeleccionado}>
                Actualizar
              </Button>
              <Button variant="outlined" onClick={limpiarFormulario}>
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.fi_usuario_id} hover sx={{ opacity: usuario.fb_activo ? 1 : 0.5 }}>
                <TableCell>{usuario.fi_usuario_id}</TableCell>
                <TableCell>{usuario.fc_nombre}</TableCell>
                <TableCell>{obtenerNombreRol(usuario.fi_rol_id)}</TableCell>
                <TableCell>
                  <Chip
                    label={usuario.fb_activo ? "Activo" : "Inactivo"}
                    color={usuario.fb_activo ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => seleccionarUsuario(usuario)}>
                    Seleccionar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color={usuario.fb_activo ? "error" : "success"}
                    onClick={() => handleToggleActive(usuario)}
                  >
                    {usuario.fb_activo ? "Desactivar" : "Activar"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {ConfirmModal}
    </Container>
  );
}
