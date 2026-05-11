import React, { useState, useEffect } from "react";
import {
  listUbicaciones,
  createUbicacion,
  updateUbicacion,
  activateUbicacion,
  deactivateUbicacion,
} from "@features/catalogos/services/ubicacionesService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
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
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

const EMPTY = { ubicacion_id: null, nombre: "", direccion: "", descripcion: "" };

export default function Ubicaciones() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

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

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar la ubicación "${nombre}"?`)) return;
    try {
      await deactivateUbicacion(id);
      showSnackbar("Ubicación desactivada", "info");
      cargar();
      limpiar();
    } catch {
      showSnackbar("Error al desactivar ubicación", "error");
    }
  };

  const activar = async (id, nombre) => {
    if (!await confirm(`¿Activar la ubicación "${nombre}"?`)) return;
    try {
      await activateUbicacion(id);
      showSnackbar("Ubicación activada", "success");
      cargar();
      limpiar();
    } catch {
      showSnackbar("Error al activar ubicación", "error");
    }
  };

  const seleccionar = (u) => {
    setForm({
      ubicacion_id: u.ubicacion_id,
      nombre:       u.nombre       ?? "",
      direccion:    u.direccion    ?? "",
      descripcion:  u.descripcion  ?? "",
    });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Ubicaciones</Typography>
        <Typography variant="body2" color="text.secondary">
          Administra las granjas y ubicaciones físicas del sistema
        </Typography>
      </Box>

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
            <Grid size={12}>
              <TextField
                name="descripcion"
                label="Descripción"
                fullWidth
                multiline
                rows={2}
                value={form.descripcion}
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
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ubicaciones.map((u) => (
                  <TableRow key={u.ubicacion_id} hover>
                    <TableCell>{u.ubicacion_id}</TableCell>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.direccion ?? "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 220, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {u.descripcion ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.activo ? "Activo" : "Inactivo"}
                        color={u.activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: "inline-flex", gap: 1, flexWrap: "nowrap" }}>
                        <Button size="small" variant="outlined" onClick={() => seleccionar(u)}>
                          Seleccionar
                        </Button>
                        {u.activo ? (
                          <Button
                            size="small" variant="outlined" color="error"
                            onClick={() => desactivar(u.ubicacion_id, u.nombre)}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            size="small" variant="outlined" color="success"
                            onClick={() => activar(u.ubicacion_id, u.nombre)}
                          >
                            Activar
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {ConfirmModal}
    </Container>
  );
}
