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
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

export default function Departamentos() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ departamento_id: null, nombre: "" });
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

  const limpiar = () => { setForm({ departamento_id: null, nombre: "" }); clearErrors(); cerrarFormulario(); };

  const registrar = async () => {
    if (!validate(form, ["nombre"])) return;
    try {
      await createDepartamento(form.nombre);
      obtenerDepartamentos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al registrar departamento", "error"); }
  };

  const actualizar = async () => {
    if (!form.departamento_id) return;
    if (!validate(form, ["nombre"])) return;
    try {
      await updateDepartamento(form.departamento_id, form.nombre);
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
      departamento_id: d.departamento_id ?? d.id,
      nombre: d.nombre,
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
            {form.departamento_id ? "Editando Departamento" : "Nuevo Departamento"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField name="nombre" label="Nombre del Departamento" fullWidth value={form.nombre} onChange={handleChange} error={!!errors.nombre} helperText={errors.nombre} />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" color="success" onClick={registrar} disabled={!!form.departamento_id}>Registrar</Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="contained" onClick={actualizar} disabled={!form.departamento_id}>Actualizar</Button>
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
              {ordenarYNumerar(departamentos, ["departamento_id", "id"]).map((d) => (
                <TableRow key={(d.departamento_id ?? d.id) ?? ""} hover>
                  <TableCell>{d._num}</TableCell>
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>
                    <Chip
                      label={d.activo ? "Activo" : "Inactivo"}
                      color={d.activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button size="small" variant="outlined" onClick={() => seleccionar(d)}>Editar</Button>
                      {d.activo ? (
                        <Button size="small" variant="outlined" color="error" onClick={() => desactivar(d.departamento_id ?? d.id, d.nombre)}>Desactivar</Button>
                      ) : (
                        <Button size="small" variant="outlined" color="success" onClick={() => activar(d.departamento_id ?? d.id, d.nombre)}>Activar</Button>
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
