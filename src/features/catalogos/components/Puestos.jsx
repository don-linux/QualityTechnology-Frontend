import React, { useState, useEffect } from "react";
import axios from "../utils/axiosInstance.js";
import useFormValidation from "../hooks/useFormValidation";
import useConfirm from "../hooks/useConfirm";
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

export default function Puestos() {
  const [form, setForm] = useState({ fi_puesto_id: null, fc_nombre: "" });
  const [puestos, setPuestos] = useState([]);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => { obtenerPuestos(); }, []);

  const obtenerPuestos = async () => {
    try { const { data } = await axios.get("/puestos"); setPuestos(data); } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm({ fi_puesto_id: null, fc_nombre: "" }); clearErrors(); };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await axios.post("/puestos", { fc_nombre: form.fc_nombre });
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); alert("Error al registrar puesto"); }
  };

  const actualizar = async () => {
    if (!form.fi_puesto_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await axios.put(`/puestos/${form.fi_puesto_id}`, { fc_nombre: form.fc_nombre, fb_activo: true });
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); alert("Error al actualizar puesto"); }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar el puesto "${nombre}"?`)) return;
    try {
      await axios.patch(`/puestos/${id}/deactivate`);
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); }
  };

  const seleccionar = (p) => {
    setForm({ fi_puesto_id: p.fi_puesto_id, fc_nombre: p.fc_nombre });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catalogo de Puestos</Typography>
        <Typography variant="body2" color="text.secondary">Administra los puestos del sistema</Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.fi_puesto_id ? "Editando Puesto" : "Nuevo Puesto"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField name="fc_nombre" label="Nombre del Puesto" fullWidth value={form.fc_nombre} onChange={handleChange} error={!!errors.fc_nombre} helperText={errors.fc_nombre} />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" color="success" onClick={registrar} disabled={!!form.fi_puesto_id}>Registrar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={actualizar} disabled={!form.fi_puesto_id}>Actualizar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="outlined" onClick={limpiar}>Limpiar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
              {puestos.map((p) => (
                <TableRow key={p.fi_puesto_id} hover>
                  <TableCell>{p.fi_puesto_id}</TableCell>
                  <TableCell>{p.fc_nombre}</TableCell>
                  <TableCell>
                    <Chip label={p.fb_activo ? "Activo" : "Inactivo"} color={p.fb_activo ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => seleccionar(p)}>Seleccionar</Button>
                    {p.fb_activo && (
                      <Button size="small" variant="outlined" color="error" onClick={() => desactivar(p.fi_puesto_id, p.fc_nombre)}>Desactivar</Button>
                    )}
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
