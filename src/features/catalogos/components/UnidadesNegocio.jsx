import React, { useState, useEffect } from "react";
import {
  listUnidadesNegocio,
  createUnidadNegocio,
  updateUnidadNegocio,
  activateUnidadNegocio,
  deactivateUnidadNegocio,
} from "@features/catalogos/services/unidadesNegocioService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
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
import useSnackbar from "@shared/hooks/useSnackbar";

export default function UnidadesNegocio() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ fi_unidad_negocio_id: null, fc_nombre: "" });
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => { obtenerUnidades(); }, []);

  const obtenerUnidades = async () => {
    setLoading(true);
    try {
      const { data } = await listUnidadesNegocio();
      setUnidades(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar unidades de negocio", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm({ fi_unidad_negocio_id: null, fc_nombre: "" }); clearErrors(); };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await createUnidadNegocio(form.fc_nombre);
      obtenerUnidades();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al registrar unidad de negocio", "error"); }
  };

  const actualizar = async () => {
    if (!form.fi_unidad_negocio_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await updateUnidadNegocio(form.fi_unidad_negocio_id, form.fc_nombre);
      obtenerUnidades();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar unidad de negocio", "error"); }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar la unidad de negocio "${nombre}"?`)) return;
    try {
      await deactivateUnidadNegocio(id);
      obtenerUnidades();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al desactivar unidad de negocio", "error"); }
  };

  const activar = async (id, nombre) => {
    if (!await confirm(`¿Activar la unidad de negocio "${nombre}"?`)) return;
    try {
      await activateUnidadNegocio(id);
      obtenerUnidades();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al activar unidad de negocio", "error"); }
  };

  const seleccionar = (u) => {
    setForm({ fi_unidad_negocio_id: u.fi_unidad_negocio_id, fc_nombre: u.fc_nombre });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catálogo de Unidades de Negocio</Typography>
        <Typography variant="body2" color="text.secondary">Administra las unidades de negocio del grupo</Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.fi_unidad_negocio_id ? "Editando Unidad de Negocio" : "Nueva Unidad de Negocio"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="fc_nombre"
                label="Nombre de la Unidad de Negocio"
                fullWidth
                value={form.fc_nombre}
                onChange={handleChange}
                error={!!errors.fc_nombre}
                helperText={errors.fc_nombre}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" color="success" onClick={registrar} disabled={!!form.fi_unidad_negocio_id}>Registrar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={actualizar} disabled={!form.fi_unidad_negocio_id}>Actualizar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="outlined" onClick={limpiar}>Limpiar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
      ) : (
      <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unidades.map((u) => (
                <TableRow key={u.fi_unidad_negocio_id} hover>
                  <TableCell>{u.fi_unidad_negocio_id}</TableCell>
                  <TableCell>{u.fc_nombre}</TableCell>
                  <TableCell>
                    <Chip label={u.fb_activo ? "Activo" : "Inactivo"} color={u.fb_activo ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button size="small" variant="outlined" onClick={() => seleccionar(u)}>Seleccionar</Button>
                      {u.fb_activo ? (
                        <Button size="small" variant="outlined" color="error" onClick={() => desactivar(u.fi_unidad_negocio_id, u.fc_nombre)}>Desactivar</Button>
                      ) : (
                        <Button size="small" variant="outlined" color="success" onClick={() => activar(u.fi_unidad_negocio_id, u.fc_nombre)}>Activar</Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {unidades.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay unidades de negocio registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      )}
      {ConfirmModal}
    </Container>
  );
}
