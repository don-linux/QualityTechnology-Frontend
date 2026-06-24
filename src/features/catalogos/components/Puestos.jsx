import React, { useState, useEffect } from "react";
import { listPuestos, createPuesto, updatePuesto, activatePuesto, deactivatePuesto } from "@features/catalogos/services/puestosService";
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
import { getPuestoId, getPuestoNombre, puestoActivo } from "@features/catalogos/utils/catalogEntityGetters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

export default function Puestos() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ fi_puesto_id: null, fc_nombre: "" });
  const [puestos, setPuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  useEffect(() => { obtenerPuestos(); }, []);

  const obtenerPuestos = async () => {
    setLoading(true);
    try {
      const { data } = await listPuestos();
      setPuestos(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar puestos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm({ fi_puesto_id: null, fc_nombre: "" }); clearErrors(); cerrarFormulario(); };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await createPuesto(form.fc_nombre);
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al registrar puesto", "error"); }
  };

  const actualizar = async () => {
    if (!form.fi_puesto_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await updatePuesto(form.fi_puesto_id, form.fc_nombre);
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar puesto", "error"); }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar el puesto "${nombre}"?`)) return;
    try {
      await deactivatePuesto(id);
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al desactivar puesto", "error"); }
  };

  const activar = async (id, nombre) => {
    if (!await confirm(`¿Activar el puesto "${nombre}"?`)) return;
    try {
      await activatePuesto(id);
      obtenerPuestos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al activar puesto", "error"); }
  };

  const seleccionar = (p) => {
    setForm({ fi_puesto_id: getPuestoId(p), fc_nombre: getPuestoNombre(p) });
    clearErrors();
    abrirFormulario();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Catalogo de Puestos</Typography>
        <Typography variant="body2" color="text.secondary">Administra los puestos del sistema</Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
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
              {ordenarYNumerar(puestos, ["puesto_id", "fi_puesto_id"]).map((p) => (
                <TableRow key={getPuestoId(p) ?? ""} hover>
                  <TableCell>{p._num}</TableCell>
                  <TableCell>{getPuestoNombre(p)}</TableCell>
                  <TableCell>
                    <Chip
                      label={puestoActivo(p) ? "Activo" : "Inactivo"}
                      color={puestoActivo(p) ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button size="small" variant="outlined" onClick={() => seleccionar(p)}>Editar</Button>
                      {puestoActivo(p) ? (
                        <Button size="small" variant="outlined" color="error" onClick={() => desactivar(getPuestoId(p), getPuestoNombre(p))}>Desactivar</Button>
                      ) : (
                        <Button size="small" variant="outlined" color="success" onClick={() => activar(getPuestoId(p), getPuestoNombre(p))}>Activar</Button>
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
