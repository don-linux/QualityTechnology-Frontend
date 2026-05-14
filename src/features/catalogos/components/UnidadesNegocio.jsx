import React, { useState, useEffect } from "react";
import {
  listUnidadesNegocio,
  createUnidadNegocio,
  updateUnidadNegocio,
  activateUnidadNegocio,
  deactivateUnidadNegocio,
} from "@features/catalogos/services/unidadesNegocioService";
import { listUbicaciones } from "@features/catalogos/services/ubicacionesService";
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
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import useSnackbar from "@shared/hooks/useSnackbar";
import {
  getUnidadNegocioId,
  getUnidadNegocioNombre,
  unidadNegocioActivo,
  getUbicacionId,
  getUbicacionNombre,
  getUnidadNegocioUbicacionId,
  getUnidadNegocioUbicacionNombre,
} from "@features/catalogos/utils/catalogEntityGetters";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const EMPTY_FORM = { fi_unidad_negocio_id: null, fc_nombre: "", fi_ubicacion_id: "" };

export default function UnidadesNegocio() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState(EMPTY_FORM);
  const [unidades, setUnidades] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  useEffect(() => {
    obtenerUnidades();
    cargarUbicaciones();
  }, []);

  const cargarUbicaciones = async () => {
    try {
      const { data } = await listUbicaciones();
      setUbicaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      showSnackbar("Error al cargar ubicaciones", "error");
    }
  };

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

  const limpiar = () => {
    setForm(EMPTY_FORM);
    clearErrors();
  };

  const parseUbicacionId = () => {
    const raw = form.fi_ubicacion_id?.trim?.() ?? "";
    if (raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre", "fi_ubicacion_id"])) return;
    const ubicacionId = parseUbicacionId();
    if (ubicacionId == null) {
      showSnackbar("Seleccione una ubicación física válida", "error");
      return;
    }
    try {
      await createUnidadNegocio(form.fc_nombre, ubicacionId);
      obtenerUnidades();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al registrar unidad de negocio", "error");
    }
  };

  const actualizar = async () => {
    if (!form.fi_unidad_negocio_id) return;
    if (!validate(form, ["fc_nombre", "fi_ubicacion_id"])) return;
    const ubicacionId = parseUbicacionId();
    if (ubicacionId == null) {
      showSnackbar("Seleccione una ubicación física válida", "error");
      return;
    }
    try {
      await updateUnidadNegocio(form.fi_unidad_negocio_id, form.fc_nombre, ubicacionId);
      obtenerUnidades();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al actualizar unidad de negocio", "error");
    }
  };

  const desactivar = async (id, nombre) => {
    if (!(await confirm(`¿Desactivar la unidad de negocio "${nombre}"?`))) return;
    try {
      await deactivateUnidadNegocio(id);
      obtenerUnidades();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al desactivar unidad de negocio", "error");
    }
  };

  const activar = async (id, nombre) => {
    if (!(await confirm(`¿Activar la unidad de negocio "${nombre}"?`))) return;
    try {
      await activateUnidadNegocio(id);
      obtenerUnidades();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar("Error al activar unidad de negocio", "error");
    }
  };

  const seleccionar = (u) => {
    setForm({
      fi_unidad_negocio_id: getUnidadNegocioId(u),
      fc_nombre: getUnidadNegocioNombre(u),
      fi_ubicacion_id: getUnidadNegocioUbicacionId(u),
    });
    clearErrors();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Catálogo de Unidades de Negocio
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra las unidades de negocio del grupo y su sede física (catálogo Ubicaciones)
        </Typography>
      </Box>

      <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
        <CardContent>
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            {form.fi_unidad_negocio_id ? "Editando Unidad de Negocio" : "Nueva Unidad de Negocio"}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required error={!!errors.fi_ubicacion_id}>
                <InputLabel id="fi_ubicacion_id-label">Ubicación física</InputLabel>
                <Select
                  labelId="fi_ubicacion_id-label"
                  name="fi_ubicacion_id"
                  label="Ubicación física"
                  value={form.fi_ubicacion_id}
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Seleccionar ubicación…</em>
                  </MenuItem>
                  {ubicaciones.map((ub) => (
                    <MenuItem key={getUbicacionId(ub)} value={String(getUbicacionId(ub))}>
                      {getUbicacionNombre(ub)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.fi_ubicacion_id ? (
                  <FormHelperText>{errors.fi_ubicacion_id}</FormHelperText>
                ) : null}
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2} mt={1}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                color="success"
                onClick={registrar}
                disabled={!!form.fi_unidad_negocio_id}
              >
                Registrar
              </Button>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={actualizar}
                disabled={!form.fi_unidad_negocio_id}
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

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%" }}>
          <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 960 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>Ubicación física</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unidades.map((u) => {
                    const ubicNom = getUnidadNegocioUbicacionNombre(u);
                    return (
                      <TableRow key={getUnidadNegocioId(u) ?? ""} hover>
                        <TableCell>{getUnidadNegocioId(u)}</TableCell>
                        <TableCell>{getUnidadNegocioNombre(u)}</TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          <span title={ubicNom}>{truncar(ubicNom || "—")}</span>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={unidadNegocioActivo(u) ? "Activo" : "Inactivo"}
                            color={unidadNegocioActivo(u) ? "success" : "default"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              flexWrap: "nowrap",
                            }}
                          >
                            <Button size="small" variant="outlined" onClick={() => seleccionar(u)}>
                              Seleccionar
                            </Button>
                            {unidadNegocioActivo(u) ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  desactivar(getUnidadNegocioId(u), getUnidadNegocioNombre(u))
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
                                  activar(getUnidadNegocioId(u), getUnidadNegocioNombre(u))
                                }
                              >
                                Activar
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {unidades.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay unidades de negocio registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}
      {ConfirmModal}
    </Container>
  );
}
