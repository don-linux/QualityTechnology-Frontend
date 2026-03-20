import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api.js";
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

export default function UsuariosRegistro() {
  const [form, setForm] = useState({
    nombre: "",
    contraseña: "",
    rol_id: "",
  });

  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const data = await apiFetch("/usuarios");
      setUsuarios(data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error.message);
    }
  };

  const obtenerRoles = async () => {
    try {
      const data = await apiFetch("/roles");
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener roles:", error.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(form),
      });
      alert("Usuario registrado correctamente ");
      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert(" Error al registrar usuario");
    }
  };

  const handleUpdate = async () => {
    if (!usuarioSeleccionado) return;
    try {
      await apiFetch(`/usuarios/${usuarioSeleccionado.fi_usuario_id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: form.nombre,
          contraseña: form.contraseña,
          rol_id: form.rol_id,
        }),
      });
      alert("Usuario actualizado correctamente ");
      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert(" Error al actualizar usuario");
    }
  };

  const handleDelete = async () => {
    if (!usuarioSeleccionado) return;
    try {
      await apiFetch(`/usuarios/${usuarioSeleccionado.fi_usuario_id}`, {
        method: "DELETE",
      });
      alert("Usuario eliminado correctamente ");
      limpiarFormulario();
      obtenerUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert(" Error al eliminar usuario");
    }
  };

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setForm({
      nombre: usuario.fc_nombre,
      contraseña: "",
      rol_id: usuario.fi_rol_id,
    });
  };

  const limpiarFormulario = () => {
    setForm({ nombre: "", contraseña: "", rol_id: "" });
    setUsuarioSeleccionado(null);
  };

  //  Función para obtener el nombre del rol dado su ID
  const obtenerNombreRol = (rolId) => {
    const rol = roles.find((r) => r.fi_rol_id === rolId);
    return rol ? rol.fc_nombre : rolId;
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Registro de Usuarios
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="nombre"
                label="Nombre de Usuario"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name="contraseña"
                label="Contraseña"
                type="password"
                fullWidth
                value={form.contraseña}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                name="rol_id"
                label="Rol"
                fullWidth
                value={form.rol_id}
                onChange={handleChange}
              >
                {roles.map((rol) => (
                  <MenuItem key={rol.fi_rol_id} value={rol.fi_rol_id}>
                    {rol.fc_nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Button
                variant="contained"
                color="success"
                sx={{ mr: 1 }}
                onClick={handleSubmit}
              >
                Registrar
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 1 }}
                onClick={handleUpdate}
                disabled={!usuarioSeleccionado}
              >
                Actualizar
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ mr: 1 }}
                onClick={handleDelete}
                disabled={!usuarioSeleccionado}
              >
                Eliminar
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: "gray", color: "#fff" }}
                onClick={limpiarFormulario}
              >
                Limpiar
              </Button>
            </Grid>
            <Grid size={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.fi_usuario_id}>
                        <TableCell>{usuario.fi_usuario_id}</TableCell>
                        <TableCell>{usuario.fc_nombre}</TableCell>
                        <TableCell>{obtenerNombreRol(usuario.fi_rol_id)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => seleccionarUsuario(usuario)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
