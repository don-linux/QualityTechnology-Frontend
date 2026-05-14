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

function uid(u) {
  return u?.usuario_id ?? u?.fi_usuario_id ?? u?.id;
}
function unombre(u) {
  return u?.nombre ?? u?.fc_nombre ?? "";
}
function uactivo(u) {
  return Boolean(u?.activo ?? u?.fb_activo);
}
function rid(r) {
  return r?.rol_id ?? r?.fi_rol_id ?? r?.id;
}
function rnombre(r) {
  return r?.nombre ?? r?.fc_nombre ?? "";
}
function rroot(r) {
  return Boolean(r?.es_root ?? r?.fb_es_root);
}
function deptKey(d) {
  return d?.departamento_id ?? d?.fi_departamento_id;
}
function deptLabel(d) {
  return d?.nombre ?? d?.fc_nombre ?? "";
}
function puestoKey(p) {
  return p?.puesto_id ?? p?.fi_puesto_id;
}
function puestoLabel(p) {
  return p?.nombre ?? p?.fc_nombre ?? "";
}
function udnKey(udn) {
  return udn?.unidad_negocio_id ?? udn?.fi_unidad_negocio_id;
}
function udnLabel(udn) {
  return udn?.nombre ?? udn?.fc_nombre ?? "";
}
function usuarioRolId(usuario) {
  return usuario?.rol_id ?? usuario?.fi_rol_id;
}

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
    fi_unidad_negocio_id: "",
  });

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { usuarios, roles, departamentos, puestos, unidadesNegocio, crearUsuario, actualizarUsuario, toggleActivo } = useUsuarios();

  const rolSeleccionado = roles.find((r) => rid(r) === Number(form.rol_id));
  const esRoot = rroot(rolSeleccionado);

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
    const ok = await actualizarUsuario(uid(usuarioSeleccionado), {
      nombre: form.nombre,
      contraseña: form.contraseña,
      rol_id: form.rol_id,
    });
    if (ok) limpiarFormulario();
  };

  const handleToggleActive = async (usuario) => {
    const accion = uactivo(usuario) ? "desactivar" : "activar";
    if (!await confirm(`¿Seguro que deseas ${accion} al usuario "${unombre(usuario)}"?`)) return;
    await toggleActivo(usuario);
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setForm({
      nombre: unombre(usuario),
      contraseña: "",
      rol_id: usuarioRolId(usuario) ?? "",
      fc_nombre_empleado: "",
      fc_apellido_paterno: "",
      fc_apellido_materno: "",
      fi_departamento_id: "",
      fi_puesto_id: "",
      fi_unidad_negocio_id: "",
    });
    clearErrors();
  };

  const limpiarFormulario = () => {
    setForm({
      nombre: "", contraseña: "", rol_id: "",
      fc_nombre_empleado: "", fc_apellido_paterno: "", fc_apellido_materno: "",
      fi_departamento_id: "", fi_puesto_id: "", fi_unidad_negocio_id: "",
    });
    setUsuarioSeleccionado(null);
    clearErrors();
  };

  const obtenerNombreRol = (rolId) => {
    if (rolId == null || rolId === "") return "";
    const n = Number(rolId);
    const rol = roles.find((r) => Number(rid(r)) === n);
    return rol ? rnombre(rol) : rolId;
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
                  <MenuItem key={rid(rol)} value={rid(rol)}>{rnombre(rol)}</MenuItem>
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
                      <MenuItem key={deptKey(d)} value={deptKey(d)}>{deptLabel(d)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select name="fi_puesto_id" label="Puesto" fullWidth value={form.fi_puesto_id} onChange={handleChange}>
                    <MenuItem value="">Sin asignar</MenuItem>
                    {puestos.map((p) => (
                      <MenuItem key={puestoKey(p)} value={puestoKey(p)}>{puestoLabel(p)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select name="fi_unidad_negocio_id" label="Unidad de Negocio" fullWidth value={form.fi_unidad_negocio_id} onChange={handleChange}>
                    <MenuItem value="">Sin asignar</MenuItem>
                    {unidadesNegocio.map((u) => (
                      <MenuItem key={udnKey(u)} value={udnKey(u)}>{udnLabel(u)}</MenuItem>
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
              <TableRow key={uid(usuario)} hover sx={{ opacity: uactivo(usuario) ? 1 : 0.5 }}>
                <TableCell>{uid(usuario)}</TableCell>
                <TableCell>{unombre(usuario)}</TableCell>
                <TableCell>{obtenerNombreRol(usuarioRolId(usuario))}</TableCell>
                <TableCell>
                  <Chip
                    label={uactivo(usuario) ? "Activo" : "Inactivo"}
                    color={uactivo(usuario) ? "success" : "default"}
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
                    color={uactivo(usuario) ? "error" : "success"}
                    onClick={() => handleToggleActive(usuario)}
                  >
                    {uactivo(usuario) ? "Desactivar" : "Activar"}
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
