import React, { useState, useEffect } from "react";
import {
  listUbicaciones,
  createUbicacion,
  updateUbicacion,
} from "@features/catalogos/services/ubicacionesService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";

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
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const EMPTY = { ubicacion_id: null, nombre: "", direccion: "" };

export default function Ubicaciones({
  titulo = "Ubicaciones",
  subtitulo = "Administra las granjas y ubicaciones físicas del sistema",
  alertSeverity = "info",
  alertText = "El modelo actual solo guarda nombre y dirección. No hay activación/desactivación en servidor.",
} = {}) {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await listUbicaciones();
      setUbicaciones(data);
    } catch {
      showSnackbar("Error al cargar ubicaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm(EMPTY); clearErrors(); };

  const registrar = async () => {
    if (!validate(form, ["nombre"])) return;
    try {
      await createUbicacion(form);
      showSnackbar("Ubicación registrada correctamente", "success");
      cargar();
      limpiar();
    } catch (e) {
      showSnackbar(e?.response?.data?.error ?? "Error al registrar ubicación", "error");
    }
  };

  const actualizar = async () => {
    if (!form.ubicacion_id) return;
    if (!validate(form, ["nombre"])) return;
    try {
      await updateUbicacion(form.ubicacion_id, form);
      showSnackbar("Ubicación actualizada correctamente", "success");
      cargar();
      limpiar();
    } catch (e) {
      showSnackbar(e?.response?.data?.error ?? "Error al actualizar ubicación", "error");
    }
  };

  const seleccionar = (u) => {
    setForm({
      ubicacion_id: u.ubicacion_id,
      nombre:       u.nombre       ?? "",
      direccion:    u.direccion    ?? "",
    });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">{titulo}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitulo}
        </Typography>
      </Box>

      {alertText ? (
        <Alert severity={alertSeverity} sx={{ mb: 3 }}>
          {alertText}
        </Alert>
      ) : null}

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.ubicacion_id ? "Editando Ubicación" : "Nueva Ubicación"}
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="nombre"
                label="Nombre *"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="direccion"
                label="Dirección"
                fullWidth
                value={form.direccion}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth variant="contained" color="success"
                onClick={registrar} disabled={!!form.ubicacion_id}
              >
                Registrar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth variant="contained"
                onClick={actualizar} disabled={!form.ubicacion_id}
              >
                Actualizar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="outlined" onClick={limpiar}>Limpiar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ubicaciones.map((u) => (
                  <TableRow key={u.ubicacion_id} hover>
                    <TableCell>{u.ubicacion_id}</TableCell>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.direccion ?? "—"}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "inline-flex", gap: 1, flexWrap: "nowrap" }}>
                        <Button size="small" variant="outlined" onClick={() => seleccionar(u)}>
                          Seleccionar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
