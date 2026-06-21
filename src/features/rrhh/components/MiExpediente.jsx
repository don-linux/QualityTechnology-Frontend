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
    fc_nombre: "", fc_apellido_paterno: "", fc_apellido_materno: "",
    fc_genero: "", fd_fecha_nacimiento: "",
    fc_estado: "", fc_ciudad: "", fc_calle: "", fc_codigo_postal: "",
    fc_referencias: "", ft_comentarios_adicionales: "",
  });

  useEffect(() => { cargarPerfil(); }, []);

  const cargarPerfil = async () => {
    setLoading(true);
    try {
      const { data } = await getPerfil();
      setPerfil(data);
      setForm({
        fc_nombre: data.fc_nombre || "",
        fc_apellido_paterno: data.fc_apellido_paterno || "",
        fc_apellido_materno: data.fc_apellido_materno || "",
        fc_genero: data.fc_genero || "",
        fd_fecha_nacimiento: data.fd_fecha_nacimiento ? data.fd_fecha_nacimiento.substring(0, 10) : "",
        fc_estado: data.fc_estado || "",
        fc_ciudad: data.fc_ciudad || "",
        fc_calle: data.fc_calle || "",
        fc_codigo_postal: data.fc_codigo_postal || "",
        fc_referencias: data.fc_referencias || "",
        ft_comentarios_adicionales: data.ft_comentarios_adicionales || "",
      });
      setError(null);
    } catch (e) {
      setError("No se encontro perfil de empleado vinculado. Contacta al administrador.");
      setPerfil(null);
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async () => {
    if (!form.fc_nombre || !form.fc_apellido_paterno || !form.fc_apellido_materno) {
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

  const camposVacios = !perfil.fd_fecha_nacimiento || !perfil.fc_calle || !perfil.fc_estado;

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
              <TextField name="fc_nombre" label="Nombre" fullWidth value={form.fc_nombre} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_apellido_paterno" label="Apellido Paterno" fullWidth value={form.fc_apellido_paterno} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_apellido_materno" label="Apellido Materno" fullWidth value={form.fc_apellido_materno} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select name="fc_genero" label="Genero" fullWidth value={form.fc_genero} onChange={handleChange}>
                <MenuItem value="">Sin especificar</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Femenino">Femenino</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fd_fecha_nacimiento" label="Fecha Nacimiento" type="date" fullWidth value={form.fd_fecha_nacimiento} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_estado" label="Estado" fullWidth value={form.fc_estado} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_ciudad" label="Ciudad" fullWidth value={form.fc_ciudad} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_codigo_postal" label="Codigo Postal" fullWidth value={form.fc_codigo_postal} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField name="fc_calle" label="Calle / Direccion" fullWidth value={form.fc_calle} onChange={handleChange} />
            </Grid>
            <Grid size={12}>
              <TextField name="fc_referencias" label="Referencias" fullWidth value={form.fc_referencias} onChange={handleChange} />
            </Grid>
            <Grid size={12}>
              <TextField name="ft_comentarios_adicionales" label="Comentarios" fullWidth multiline rows={2} value={form.ft_comentarios_adicionales} onChange={handleChange} />
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
              <TextField label="Fecha Contratacion" fullWidth value={perfil.fd_fecha_contratacion ? perfil.fd_fecha_contratacion.substring(0, 10) : "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Fecha Baja" fullWidth value={perfil.fd_fecha_baja ? perfil.fd_fecha_baja.substring(0, 10) : "-"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField label="Uniformes" fullWidth value={perfil.fn_uniformes ? "Entregado" : "Sin uniforme"} slotProps={{ input: { readOnly: true } }} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <DocumentosEmpleado selfService />
        </CardContent>
      </Card>
    </Container>
  );
}
