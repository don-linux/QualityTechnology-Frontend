import React, { useState, useEffect } from 'react';
import { API_URL } from "../utils/api.js";
import {
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from '@mui/material';
import axios from 'axios';

export default function Roles() {
  const [form, setForm] = useState({ rol_id: '', nombre: '' });
  const [roles, setRoles] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    obtenerRoles();
  }, []);

  const obtenerRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/roles`);
      setRoles(res.data);
    } catch (error) {
      console.error('Error al obtener roles', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({ rol_id: '', nombre: '' });
    setMensaje('');
  };

  const registrarRol = async () => {
    if (form.nombre.trim() === '') return setMensaje(' El nombre no puede estar vacío');
    try {
      await axios.post(`${API_URL}/roles`, { nombre: form.nombre });
      setMensaje(' Rol registrado correctamente');
      limpiarFormulario();
      obtenerRoles();
    } catch (error) {
      console.error('Error al registrar rol', error);
      setMensaje(' Error al registrar rol');
    }
  };

  const actualizarRol = async () => {
    if (!form.rol_id) return setMensaje(' Selecciona un rol para actualizar');
    try {
      await axios.put(`${API_URL}/roles/${form.rol_id}`, { nombre: form.nombre });
      setMensaje(' Rol actualizado correctamente');
      limpiarFormulario();
      obtenerRoles();
    } catch (error) {
      console.error('Error al actualizar rol', error);
      setMensaje(' Error al actualizar rol');
    }
  };

  const eliminarRol = async () => {
    if (!form.rol_id) return setMensaje(' Selecciona un rol para eliminar');
    try {
      await axios.delete(`${API_URL}/roles/${form.rol_id}`);
      setMensaje(' Rol eliminado correctamente');
      limpiarFormulario();
      obtenerRoles();
    } catch (error) {
      console.error('Error al eliminar rol', error);
      setMensaje(' Error al eliminar rol');
    }
  };

  const seleccionarRol = (rol) => {
    setForm({ rol_id: rol.fi_rol_id, nombre: rol.fc_nombre });
    setMensaje('');
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
         Registro de Roles
      </Typography>

      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="nombre"
                label="Nombre del Rol"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
              />
            </Grid>

            {mensaje && (
              <Grid size={12}>
                <Typography color={mensaje.includes('correctamente') ? 'green' : 'error'}>{mensaje}</Typography>
              </Grid>
            )}

            <Grid size={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={registrarRol}
                  disabled={!!form.rol_id}
                >
                  Registrar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={actualizarRol}
                  disabled={!form.rol_id}
                >
                  Actualizar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={eliminarRol}
                  disabled={!form.rol_id}
                >
                  Eliminar
                </Button>
                <Button
                  variant="contained"
                  onClick={limpiarFormulario}
                  sx={{ backgroundColor: 'gray', color: 'white' }}
                >
                  Limpiar
                </Button>
              </Stack>
            </Grid>

            <Grid size={12}>
              <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Acción</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((rol) => (
                      <TableRow key={rol.fi_rol_id} hover>
                        <TableCell>{rol.fc_nombre}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => seleccionarRol(rol)}
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
