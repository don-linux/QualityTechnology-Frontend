import React, { useState, useEffect } from "react";
import { listDepartamentos, createDepartamento, updateDepartamento, activateDepartamento, deactivateDepartamento } from "@features/catalogos/services/departamentosService";
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
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import {
  getDepartamentoId,
  getDepartamentoNombre,
  departamentoActivo,
} from "@features/catalogos/utils/catalogEntityGetters";

export default function Departamentos() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ fi_departamento_id: null, fc_nombre: "" });
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  useEffect(() => { obtenerDepartamentos(); }, []);

  const obtenerDepartamentos = async () => {
    setLoading(true);
    try {
      const { data } = await listDepartamentos();
      setDepartamentos(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar departamentos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm({ fi_departamento_id: null, fc_nombre: "" }); clearErrors(); cerrarFormulario(); };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await createDepartamento(form.fc_nombre);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al registrar departamento", "error"); }
  };

  const actualizar = async () => {
    if (!form.fi_departamento_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await updateDepartamento(form.fi_departamento_id, form.fc_nombre);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar departamento", "error"); }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar el departamento "${nombre}"?`)) return;
    try {
      await deactivateDepartamento(id);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al desactivar departamento", "error"); }
  };

  const activar = async (id, nombre) => {
    if (!await confirm(`¿Activar el departamento "${nombre}"?`)) return;
    try {
      await activateDepartamento(id);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al activar departamento", "error"); }
  };

  const seleccionar = (d) => {
    setForm({
      fi_departamento_id: getDepartamentoId(d),
      fc_nombre: getDepartamentoNombre(d),
    });
    clearErrors();
    abrirFormulario();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catalogo de Departamentos</Typography>
        <Typography variant="body2" color="text.secondary">Administra los departamentos del sistema</Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
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
      </FormularioRegistroPanel>

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
              {departamentos.map((d) => (
                <TableRow key={getDepartamentoId(d) ?? ""} hover>
                  <TableCell>{getDepartamentoId(d)}</TableCell>
                  <TableCell>{getDepartamentoNombre(d)}</TableCell>
                  <TableCell>
                    <Chip
                      label={departamentoActivo(d) ? "Activo" : "Inactivo"}
                      color={departamentoActivo(d) ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button size="small" variant="outlined" onClick={() => seleccionar(d)}>Seleccionar</Button>
                      {departamentoActivo(d) ? (
                        <Button size="small" variant="outlined" color="error" onClick={() => desactivar(getDepartamentoId(d), getDepartamentoNombre(d))}>Desactivar</Button>
                      ) : (
                        <Button size="small" variant="outlined" color="success" onClick={() => activar(getDepartamentoId(d), getDepartamentoNombre(d))}>Activar</Button>
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
