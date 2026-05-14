import React, { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import {
  listPiletas,
  createPileta,
  updatePileta,
  removePileta,
} from "../services/piletasService";

import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const TRUNCAR_MAX = 60;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const TIPOS_PILETA = ["alevinaje", "reproductores", "engorda"];
const ESTADOS_PILETA = ["vacia", "ocupada"];
const MATERIALES = ["concreto", "geomembrana", "fibra", "tierra", "otro"];

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

const formatNumber = (num, opts = {}) =>
  num != null && num !== ""
    ? Number(num).toLocaleString("en-US", opts)
    : "—";

const formatFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-MX");
};

/* ============================================================================
 *  PANTALLA PRINCIPAL — solo piletas físicas (CRUD)
 * ========================================================================= */
export default function Pileta({ pageTitle = "Piletas físicas" } = {}) {
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion } =
    useUbicacionesGranja();

  const [granjaActiva, setGranjaActiva] = useState("");

  const filtroUbicacion = useMemo(
    () => (granjaActiva ? resolveFiltroUbicacion(granjaActiva) : null),
    [granjaActiva, resolveFiltroUbicacion],
  );

  const ubicacionSeleccionada = useMemo(
    () => ubicacionesGranja.find((op) => op.value === granjaActiva),
    [ubicacionesGranja, granjaActiva],
  );

  const [piletas, setPiletas] = useState([]);

  const cargarPiletas = useCallback(async () => {
    if (!filtroUbicacion?.granja && !filtroUbicacion?.ubicacion_id) {
      setPiletas([]);
      return;
    }
    try {
      const resAll = await listPiletas(filtroUbicacion);
      setPiletas(Array.isArray(resAll.data) ? resAll.data : []);
    } catch {
      setPiletas([]);
      showSnackbar("Error cargando piletas", "error");
    }
  }, [filtroUbicacion, showSnackbar]);

  useEffect(() => {
    if (!granjaActiva && defaultUbicacion) setGranjaActiva(defaultUbicacion);
  }, [defaultUbicacion, granjaActiva]);

  useEffect(() => {
    cargarPiletas();
  }, [cargarPiletas]);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        {pageTitle}
      </Typography>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#E3F2FD" }} elevation={0}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Typography variant="body2">
            <b>Ubicación (sede):</b> {granjaActiva || "—"}
            {ubicacionSeleccionada?.ubicacion_id ? (
              <span> · ID ubicación #{ubicacionSeleccionada.ubicacion_id}</span>
            ) : null}
          </Typography>
          <Typography variant="body2">
            <b>Piletas registradas:</b> {piletas.length}
          </Typography>
        </Stack>
      </Paper>

      <PiletasTab
        granjaActiva={granjaActiva}
        setGranjaActiva={setGranjaActiva}
        piletas={piletas}
        onChange={cargarPiletas}
        showSnackbar={showSnackbar}
        confirm={confirm}
        ubicacionesGranja={ubicacionesGranja}
      />

      {ConfirmModal}
    </Box>
  );
}

/* ============================================================================
 *  Formulario + tabla — CRUD modelo `Pileta`
 * ========================================================================= */
function PiletasTab({
  granjaActiva,
  setGranjaActiva,
  piletas,
  onChange,
  showSnackbar,
  confirm,
  ubicacionesGranja,
}) {
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    largo: "",
    ancho: "",
    alto: "",
    material: "",
    estado: "vacia",
    tipo: "",
  });

  const required = ["nombre", "largo", "ancho", "alto", "material", "tipo"];

  const ubicacionActual = useMemo(
    () => ubicacionesGranja.find((u) => u.value === granjaActiva),
    [ubicacionesGranja, granjaActiva],
  );

  const m3 = useMemo(() => {
    const l = Number(form.largo) || 0;
    const a = Number(form.ancho) || 0;
    const h = Number(form.alto) || 0;
    return (l * a * h).toFixed(3);
  }, [form.largo, form.ancho, form.alto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const limpiar = (cerrarPanel = false) => {
    clearErrors();
    setEditId(null);
    setForm({
      nombre: "",
      largo: "",
      ancho: "",
      alto: "",
      material: "",
      estado: "vacia",
      tipo: "",
    });
    if (cerrarPanel) setMostrarFormulario(false);
  };

  /** Tras crear/editar: deja el formulario abierto para otro alta rápido. */
  const reiniciarTrasGuardar = () => {
    clearErrors();
    setEditId(null);
    setForm({
      nombre: "",
      largo: "",
      ancho: "",
      alto: "",
      material: "",
      estado: "vacia",
      tipo: "",
    });
  };

  const guardar = async () => {
    if (!validate(form, required)) return;
    if (!granjaActiva) {
      showSnackbar("Selecciona una ubicación (sede)", "warning");
      return;
    }
    try {
      const body = {
        nombre: form.nombre,
        largo: form.largo,
        ancho: form.ancho,
        alto: form.alto,
        material: form.material,
        estado: form.estado,
        tipo: form.tipo,
        granja: granjaActiva,
      };
      if (ubicacionActual?.ubicacion_id != null) {
        body.ubicacion_id = ubicacionActual.ubicacion_id;
      }

      if (editId) {
        await updatePileta(editId, body);
        showSnackbar("Pileta actualizada", "success");
      } else {
        await createPileta(body);
        showSnackbar("Pileta creada", "success");
      }
      reiniciarTrasGuardar();
      onChange();
    } catch (err) {
      const data = err.response?.data ?? {};
      const msg =
        import.meta.env.DEV && data.detail
          ? `${data.error || "Error"}: ${String(data.detail).slice(0, 360)}`
          : data.error || data.detail || err.message || "Error";
      showSnackbar(msg, "error");
    }
  };

  const editar = (p) => {
    clearErrors();
    setEditId(p.fi_pileta_id);
    const matchUbicacion = ubicacionesGranja.find(
      (u) => u.value === p.fc_granja || u.label === p.fc_granja,
    );
    if (matchUbicacion) setGranjaActiva(matchUbicacion.value);
    setForm({
      nombre: p.nombre || "",
      largo: p.largo ?? "",
      ancho: p.ancho ?? "",
      alto: p.alto ?? "",
      material: p.material || "",
      estado: p.estado || "vacia",
      tipo: p.tipo || "",
    });
    setMostrarFormulario(true);
  };

  const eliminar = async (p) => {
    if (!(await confirm(`¿Eliminar pileta "${p.nombre}"?`))) return;
    try {
      await removePileta(p.fi_pileta_id);
      showSnackbar("Pileta eliminada", "success");
      onChange();
    } catch (err) {
      showSnackbar(err.response?.data?.error || "Error eliminando", "error");
    }
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={mostrarFormulario ? <CloseIcon /> : <AddIcon />}
          onClick={() => (mostrarFormulario ? limpiar(true) : setMostrarFormulario(true))}
          disabled={!granjaActiva}
        >
          {mostrarFormulario ? "Cerrar formulario" : "Nueva pileta"}
        </Button>
      </Stack>

      {mostrarFormulario && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              {editId ? "Editar pileta" : "Nueva pileta"}
            </Typography>

            {ubicacionesGranja.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No hay ubicaciones disponibles. Revisa el catálogo de ubicaciones y unidades de
                negocio.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  select
                  required
                  label="Ubicación (sede)"
                  value={granjaActiva || ""}
                  onChange={(e) => setGranjaActiva(e.target.value)}
                  fullWidth
                  disabled={ubicacionesGranja.length === 0}
                  helperText={
                    ubicacionActual?.ubicacion_id != null
                      ? `ID en catálogo de ubicaciones: ${ubicacionActual.ubicacion_id}`
                      : "El alta de la pileta queda ligado a la sede elegida"
                  }
                >
                  {ubicacionesGranja.length === 0 ? (
                    <MenuItem value="">Sin ubicaciones configuradas</MenuItem>
                  ) : (
                    ubicacionesGranja.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Etapa (tipo)"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.tipo}
                  helperText={errors.tipo}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {TIPOS_PILETA.map((t) => (
                    <MenuItem key={t} value={t}>
                      {tipoLabel(t)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  fullWidth
                >
                  {ESTADOS_PILETA.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Largo (m)"
                  name="largo"
                  type="number"
                  value={form.largo}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.largo}
                  helperText={errors.largo}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Ancho (m)"
                  name="ancho"
                  type="number"
                  value={form.ancho}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.ancho}
                  helperText={errors.ancho}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Alto (m)"
                  name="alto"
                  type="number"
                  value={form.alto}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.alto}
                  helperText={errors.alto}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  label="Volumen (m³)"
                  value={m3}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Calculado: largo × ancho × alto"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.material}
                  helperText={errors.material}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {MATERIALES.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                onClick={() => (editId ? limpiar(true) : limpiar(false))}
              >
                {editId ? "Cancelar" : "Limpiar campos"}
              </Button>
              <Button variant="contained" color="success" onClick={guardar}>
                {editId ? "Actualizar" : "Crear"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Paper>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1100 }}>
            <TableHead sx={{ background: "#E3F2FD" }}>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Etapa</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Vol. m³</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Última observación</TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {piletas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Sin piletas para esta ubicación.
                  </TableCell>
                </TableRow>
              )}
              {piletas.map((p) => (
                <TableRow key={p.fi_pileta_id} hover>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={tipoLabel(p.tipo)} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={p.estado === "ocupada" ? "warning" : "default"}
                      variant="outlined"
                      label={p.estado}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {formatNumber(p.metros_cubicos, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 3,
                    })}
                  </TableCell>
                  <TableCell>{p.material}</TableCell>
                  <TableCell>{p.fc_granja || "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    {p.ultima_observacion ? (
                      <>
                        <span title={p.ultima_observacion}>
                          {truncar(p.ultima_observacion)}
                        </span>
                        {(p.fc_ultima_observacion_proceso || p.fd_ultima_observacion) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {[
                              p.fc_ultima_observacion_proceso,
                              p.fd_ultima_observacion
                                ? formatFecha(p.fd_ultima_observacion)
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </Typography>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => editar(p)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton size="small" color="error" onClick={() => eliminar(p)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
