import React, { useState, useEffect } from "react";
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
  Box,
} from "@mui/material";
import axios from "axios";

export default function Estados() {
  const [form, setForm] = useState({
    fi_estado_id: null,
    fc_nombre: "",
  });

  const [estados, setEstados] = useState([]);

  useEffect(() => {
    obtenerEstados();
  }, []);

  const obtenerEstados = async () => {
    try {
      const res = await axios.get(`${API_URL}/estados`);
      setEstados(res.data);
    } catch (error) {
      console.error("Error al obtener estados", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const limpiarFormulario = () => {
    setForm({
      fi_estado_id: null,
      fc_nombre: "",
    });
  };

  const registrarEstado = async () => {
    if (!form.fc_nombre.trim()) return alert("El nombre es obligatorio");
    try {
      await axios.post(`${API_URL}/estados`, {
        fc_nombre: form.fc_nombre,
      });
      obtenerEstados();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar estado", error);
      alert("❌ Error al registrar estado");
    }
  };

  const actualizarEstado = async () => {
    if (!form.fi_estado_id)
      return alert("Selecciona un estado para actualizar");

    try {
      await axios.put(
        `${API_URL}/estados/${form.fi_estado_id}`,
        { fc_nombre: form.fc_nombre }
      );
      obtenerEstados();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al actualizar estado", error);
      alert("❌ Error al actualizar estado");
    }
  };

  const eliminarEstado = async () => {
    if (!form.fi_estado_id)
      return alert("Selecciona un estado para eliminar");

    if (!window.confirm("¿Seguro que deseas eliminar este estado?")) return;

    try {
      await axios.delete(
        `${API_URL}/estados/${form.fi_estado_id}`
      );
      obtenerEstados();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al eliminar estado", error);
      alert("❌ Error al eliminar estado");
    }
  };

  const seleccionarEstado = (estado) => {
    setForm({
      fi_estado_id: estado.fi_estado_id,
      fc_nombre: estado.fc_nombre,
    });
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb:6 }}>
    {/* TITULO */}
    <Box textAlign="center" mb={3}>
      <Typography variant="h4" fontWeight="bold">
        Catálogo de Estados
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Administra los estados registrados en el sistema
      </Typography>
    </Box>

    {/* FORM CARD */}
    <Card
      sx={{
        mb: 4,
        borderRadius: 4,
        boxShadow: 4,
        border: "1px solid #eee"
      }}
    >
      <CardContent>

        <Typography variant="subtitle1" mb={2} fontWeight="bold">
          {form.fi_estado_id ? "Editando Estado" : "Nuevo Estado"}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="fc_nombre"
              label="Nombre del Estado"
              fullWidth
              value={form.fc_nombre}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* BOTONES */}
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6} sm={3}>
              <Button fullWidth variant="contained" color="success"
                onClick={registrarEstado}
                disabled={!!form.fi_estado_id}>
                Registrar
              </Button>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Button fullWidth variant="contained"
                onClick={actualizarEstado}
                disabled={!form.fi_estado_id}>
                Actualizar
              </Button>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Button fullWidth variant="contained" color="error"
                onClick={eliminarEstado}
                disabled={!form.fi_estado_id}>
                Eliminar
              </Button>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Button fullWidth variant="outlined" onClick={limpiarFormulario}>
                Limpiar
              </Button>
            </Grid>
          </Grid>
      </CardContent>
    </Card>

      {/* TABLA */}
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {estados.map((estado) => (
                <TableRow key={estado.fi_estado_id} hover>
                  <TableCell>{estado.fi_estado_id}</TableCell>
                  <TableCell>{estado.fc_nombre}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => seleccionarEstado(estado)}
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}