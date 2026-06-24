import React, { useState, useEffect } from "react";
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

export default function CatalogoNombreSimple({
  title,
  subtitle,
  idField,
  entityLabel,
  entityLabelPlural,
  registerSuccessMsg,
  updateSuccessMsg,
  listFn,
  createFn,
  updateFn,
  activateFn,
  deactivateFn,
  getId = (it) => it?.[idField] ?? it?.id,
  getNombre = (it) => it?.nombre ?? "",
  isActivo = (it) => it?.activo ?? it?.esta_activo ?? false,
}) {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ [idField]: null, nombre: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await listFn();
      setItems(data);
    } catch (e) {
      console.error(e);
      showSnackbar(`Error al cargar ${entityLabelPlural}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => {
    setForm({ [idField]: null, nombre: "" });
    clearErrors();
    cerrarFormulario();
  };

  const registrar = async () => {
    if (!validate(form, ["nombre"])) return;
    try {
      await createFn(form.nombre);
      showSnackbar(registerSuccessMsg, "success");
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(e?.response?.data?.error ?? "Error al registrar", "error");
    }
  };

  const actualizar = async () => {
    if (!form[idField]) return;
    if (!validate(form, ["nombre"])) return;
    try {
      await updateFn(form[idField], form.nombre);
      showSnackbar(updateSuccessMsg, "success");
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(e?.response?.data?.error ?? "Error al actualizar", "error");
    }
  };

  const desactivar = async (id, nombre) => {
    if (!(await confirm(`¿Desactivar ${entityLabel} "${nombre}"?`))) return;
    try {
      await deactivateFn(id);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al desactivar", "error");
    }
  };

  const activar = async (id, nombre) => {
    if (!(await confirm(`¿Activar ${entityLabel} "${nombre}"?`))) return;
    try {
      await activateFn(id);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al activar", "error");
    }
  };

  const seleccionar = (item) => {
    setForm({
      [idField]: getId(item),
      nombre: getNombre(item),
    });
    clearErrors();
    abrirFormulario();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
          <CardContent>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
              {form[idField] ? "Editando registro" : "Nuevo registro"}
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
                  disabled={!!form[idField]}
                >
                  Registrar
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={actualizar}
                  disabled={!form[idField]}
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
                {ordenarYNumerar(items, [idField, "id"]).map((item) => (
                  <TableRow key={getId(item) ?? ""} hover>
                    <TableCell>{item._num}</TableCell>
                    <TableCell>{getNombre(item)}</TableCell>
                    <TableCell>
                      <Chip
                        label={isActivo(item) ? "Activo" : "Inactivo"}
                        color={isActivo(item) ? "success" : "default"}
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
                          Editar
                        </Button>
                        {isActivo(item) ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => desactivar(getId(item), getNombre(item))}
                          >
                            Desactivar
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => activar(getId(item), getNombre(item))}
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
