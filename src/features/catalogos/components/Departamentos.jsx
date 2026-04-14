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

export default function Departamentos() {
  const [form, setForm] = useState({ fi_departamento_id: null, fc_nombre: "" });
  const [departamentos, setDepartamentos] = useState([]);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => { obtenerDepartamentos(); }, []);

  const obtenerDepartamentos = async () => {
    try { const { data } = await axios.get("/departamentos"); setDepartamentos(data); } catch (e) { console.error(e); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm({ fi_departamento_id: null, fc_nombre: "" }); clearErrors(); };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await axios.post("/departamentos", { fc_nombre: form.fc_nombre });
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); alert("Error al registrar departamento"); }
  };

  const actualizar = async () => {
    if (!form.fi_departamento_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await axios.put(`/departamentos/${form.fi_departamento_id}`, { fc_nombre: form.fc_nombre, fb_activo: true });
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); alert("Error al actualizar departamento"); }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar el departamento "${nombre}"?`)) return;
    try {
      await axios.patch(`/departamentos/${id}/deactivate`);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); }
  };

  const seleccionar = (d) => {
    setForm({ fi_departamento_id: d.fi_departamento_id, fc_nombre: d.fc_nombre });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catalogo de Departamentos</Typography>
        <Typography variant="body2" color="text.secondary">Administra los departamentos del sistema</Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.fi_departamento_id ? "Editando Departamento" : "Nuevo Departamento"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField name="fc_nombre" label="Nombre del Departamento" fullWidth value={form.fc_nombre} onChange={handleChange} error={!!errors.fc_nombre} helperText={errors.fc_nombre} />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" color="success" onClick={registrar} disabled={!!form.fi_departamento_id}>Registrar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={actualizar} disabled={!form.fi_departamento_id}>Actualizar</Button>
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
              {departamentos.map((d) => (
                <TableRow key={d.fi_departamento_id} hover>
                  <TableCell>{d.fi_departamento_id}</TableCell>
                  <TableCell>{d.fc_nombre}</TableCell>
                  <TableCell>
                    <Chip label={d.fb_activo ? "Activo" : "Inactivo"} color={d.fb_activo ? "success" : "default"} size="small" />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" variant="outlined" sx={{ mr: 1 }} onClick={() => seleccionar(d)}>Seleccionar</Button>
                    {d.fb_activo && (
                      <Button size="small" variant="outlined" color="error" onClick={() => desactivar(d.fi_departamento_id, d.fc_nombre)}>Desactivar</Button>
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
