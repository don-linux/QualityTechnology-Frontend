import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { getPerfil, updatePerfil } from "../services/perfilService";
import DocumentosEmpleado from "./DocumentosEmpleado";
import useSnackbar from "@shared/hooks/useSnackbar";

export default function MiExpediente() {
  const showSnackbar = useSnackbar();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    nombre: "", apellido_paterno: "", apellido_materno: "",
    genero: "", fecha_nacimiento: "",
    estado: "", ciudad: "", calle: "", codigo_postal: "",
    referencias: "", comentarios_adicionales: "",
  });

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const { data } = await getPerfil();
      setPerfil(data);
      setForm({
        nombre: data.nombre || "",
        apellido_paterno: data.apellido_paterno || "",
        apellido_materno: data.apellido_materno || "",
        genero: data.genero || "",
        fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.substring(0, 10) : "",
        estado: data.estado || "",
        ciudad: data.ciudad || "",
        calle: data.calle || "",
        codigo_postal: data.codigo_postal || "",
        referencias: data.referencias || "",
        comentarios_adicionales: data.comentarios_adicionales || "",
      });
      setError(null);
    } catch (e) {
      setError("No se encontro perfil de empleado vinculado. Contacta al administrador.");
      setPerfil(null);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async () => {
    if (!form.nombre || !form.apellido_paterno || !form.apellido_materno) {
      return showSnackbar("Nombre y apellidos son obligatorios", "success");
    }
    try {
      await updatePerfil(form);
      showSnackbar("Perfil actualizado correctamente", "success");
      await cargarPerfil();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar perfil", "error"); }
  };

  if (loading) return <Typography textAlign="center" sx={{ mt: 4 }}>Cargando...</Typography>;

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">{error}</Alert>
      </Container>
    );
  }

  const camposVacios = !perfil.fecha_nacimiento || !perfil.calle || !perfil.estado;

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Mi Expediente</Typography>
      </Box>

      {camposVacios && (
        <Alert severity="info" sx={{ mb: 2 }}>Completa tu perfil con tus datos personales y direccion.</Alert>
      )}

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Datos Personales</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="nombre" label="Nombre" fullWidth value={form.nombre} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="apellido_paterno" label="Apellido Paterno" fullWidth value={form.apellido_paterno} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="apellido_materno" label="Apellido Materno" fullWidth value={form.apellido_materno} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select name="genero" label="Genero" fullWidth value={form.genero} onChange={handleChange}>
                <MenuItem value="">Sin especificar</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fecha_nacimiento" label="Fecha Nacimiento" type="date" fullWidth value={form.fecha_nacimiento} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="estado" label="Estado" fullWidth value={form.estado} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="ciudad" label="Ciudad" fullWidth value={form.ciudad} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="codigo_postal" label="Codigo Postal" fullWidth value={form.codigo_postal} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="calle" label="Calle / Direccion" fullWidth value={form.calle} onChange={handleChange} />
            </Grid>
            <Grid size={12}>
              <TextField name="referencias" label="Referencias" fullWidth value={form.referencias} onChange={handleChange} />
            </Grid>
            <Grid size={12}>
              <TextField name="comentarios_adicionales" label="Comentarios" fullWidth multiline rows={2} value={form.comentarios_adicionales} onChange={handleChange} />
            </Grid>
            <Grid size={12}>
              <Button variant="contained" color="primary" onClick={guardar}>Guardar cambios</Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="bold" mb={2}>Datos Laborales (solo lectura)</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Puesto" fullWidth value={perfil.puesto_nombre || "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Departamento" fullWidth value={perfil.departamento_nombre || "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Unidad de Negocio" fullWidth value={perfil.unidad_negocio_nombre || "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Fecha Contratacion" fullWidth value={perfil.fecha_contratacion ? perfil.fecha_contratacion.substring(0, 10) : "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Fecha Baja" fullWidth value={perfil.fecha_baja ? perfil.fecha_baja.substring(0, 10) : "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Uniformes" fullWidth value={perfil.uniformes ? "Entregado" : "Sin uniforme"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <DocumentosEmpleado selfService />
        </CardContent>
      </Card>
    </Container>
  );
}
