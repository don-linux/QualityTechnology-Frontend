import React, { useState, useEffect } from "react";
import {
  listTiposInstanciaPileta,
  createTipoInstanciaPileta,
  updateTipoInstanciaPileta,
  activateTipoInstanciaPileta,
  deactivateTipoInstanciaPileta,
} from "@features/catalogos/services/tiposInstanciaPiletaService";
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
  getTipoInstanciaPiletaId,
  getTipoInstanciaPiletaNombre,
  tipoInstanciaPiletaActivo,
} from "@features/catalogos/utils/catalogEntityGetters";

export default function TiposInstanciaPileta() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ tipo_instancia_pileta_id: null, nombre: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await listTiposInstanciaPileta();
      setItems(data);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar tipos de instancia", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => {
    setForm({ tipo_instancia_pileta_id: null, nombre: "" });
    clearErrors();
    cerrarFormulario();
  };

  const registrar = async () => {
    if (!validate(form, ["nombre"])) return;
    try {
      await createTipoInstanciaPileta(form.nombre);
      showSnackbar("Tipo de instancia registrado", "success");
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(e?.response?.data?.error ?? "Error al registrar", "error");
    }
  };

  const actualizar = async () => {
    if (!form.tipo_instancia_pileta_id) return;
    if (!validate(form, ["nombre"])) return;
    try {
      await updateTipoInstanciaPileta(form.tipo_instancia_pileta_id, form.nombre);
      showSnackbar("Tipo de instancia actualizado", "success");
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(e?.response?.data?.error ?? "Error al actualizar", "error");
    }
  };

  const desactivar = async (id, nombre) => {
    if (!(await confirm(`¿Desactivar el tipo "${nombre}"?`))) return;
    try {
      await deactivateTipoInstanciaPileta(id);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al desactivar", "error");
    }
  };

  const activar = async (id, nombre) => {
    if (!(await confirm(`¿Activar el tipo "${nombre}"?`))) return;
    try {
      await activateTipoInstanciaPileta(id);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al activar", "error");
    }
  };

  const seleccionar = (item) => {
    setForm({
      tipo_instancia_pileta_id: getTipoInstanciaPiletaId(item),
      nombre: getTipoInstanciaPiletaNombre(item),
    });
    clearErrors();
    abrirFormulario();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Tipos de instancia
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Catálogo de formatos físicos: piscina, estanque, sanja, cubeta, etc.
        </Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.tipo_instancia_pileta_id ? "Editando tipo" : "Nuevo tipo"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                name="nombre"
                label="Nombre"
                fullWidth
                value={form.nombre}
                onChange={handleChange}
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={registrar}
                disabled={!!form.tipo_instancia_pileta_id}
              >
                Registrar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={actualizar}
                disabled={!form.tipo_instancia_pileta_id}
              >
                Actualizar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button fullWidth variant="outlined" onClick={limpiar}>
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
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
                {items.map((item) => (
                  <TableRow key={getTipoInstanciaPiletaId(item) ?? ""} hover>
                    <TableCell>{getTipoInstanciaPiletaId(item)}</TableCell>
                    <TableCell>{getTipoInstanciaPiletaNombre(item)}</TableCell>
                    <TableCell>
                      <Chip
                        label={tipoInstanciaPiletaActivo(item) ? "Activo" : "Inactivo"}
                        color={tipoInstanciaPiletaActivo(item) ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        <Button size="small" variant="outlined" onClick={() => seleccionar(item)}>
                          Seleccionar
                        </Button>
                        {tipoInstanciaPiletaActivo(item) ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              desactivar(
                                getTipoInstanciaPiletaId(item),
                                getTipoInstanciaPiletaNombre(item),
                              )
                            }
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() =>
                              activar(
                                getTipoInstanciaPiletaId(item),
                                getTipoInstanciaPiletaNombre(item),
                              )
                            }
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
