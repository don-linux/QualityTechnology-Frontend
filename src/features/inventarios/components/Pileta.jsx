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
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
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
import {
  listAlevinaje,
  createAlevinaje,
  updateAlevinaje,
  removeAlevinaje,
} from "../services/alevinajeService";

import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const MAX_OBSERVACION = 500;
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

const calcDias = (fecha) => {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
};

const colorDias = (dias) => {
  if (dias == null) return "default";
  if (dias <= 10) return "success";
  if (dias <= 20) return "warning";
  return "error";
};

/* ============================================================================
 *  PANTALLA PRINCIPAL
 * ========================================================================= */
export default function Pileta() {
  const auth = useAuth();
  const usuarioId = auth.usuarioId;
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion } = useUbicacionesGranja();

  const [tab, setTab] = useState(0);
  const [granjaActiva, setGranjaActiva] = useState("");

  const [piletas, setPiletas] = useState([]);
  const [piletasAlevinaje, setPiletasAlevinaje] = useState([]);
  const [alevinajes, setAlevinajes] = useState([]);

  /* ------------------------------------------------------------------ DATA */

  const cargarPiletas = useCallback(async () => {
    if (!granjaActiva) {
      setPiletas([]);
      setPiletasAlevinaje([]);
      return;
    }
    try {
      const [resAll, resAlev] = await Promise.all([
        listPiletas(granjaActiva),
        listPiletas(granjaActiva, "alevinaje"),
      ]);
      setPiletas(Array.isArray(resAll.data) ? resAll.data : []);
      setPiletasAlevinaje(Array.isArray(resAlev.data) ? resAlev.data : []);
    } catch {
      setPiletas([]);
      setPiletasAlevinaje([]);
      showSnackbar("Error cargando piletas", "error");
    }
  }, [granjaActiva, showSnackbar]);

  const cargarAlevinajes = useCallback(async () => {
    if (!granjaActiva) {
      setAlevinajes([]);
      return;
    }
    try {
      const res = await listAlevinaje(granjaActiva);
      setAlevinajes(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAlevinajes([]);
      showSnackbar("Error cargando registros de alevinaje", "error");
    }
  }, [granjaActiva, showSnackbar]);

  useEffect(() => {
    if (!granjaActiva && defaultUbicacion) setGranjaActiva(defaultUbicacion);
  }, [defaultUbicacion, granjaActiva]);

  useEffect(() => {
    cargarPiletas();
    cargarAlevinajes();
  }, [cargarPiletas, cargarAlevinajes]);

  const totalOrganismosAlevinaje = useMemo(
    () =>
      alevinajes.reduce(
        (acc, r) => acc + ((r.alevines_iniciales || 0) - (r.mortalidad || 0)),
        0,
      ),
    [alevinajes],
  );

  /* ----------------------------------------------------------------- RENDER */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        Alevinaje
      </Typography>

      {/* Selector granja */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {ubicacionesGranja.map((op) => (
          <Button
            key={op.value}
            variant={granjaActiva === op.value ? "contained" : "outlined"}
            color="primary"
            onClick={() => setGranjaActiva(op.value)}
          >
            {op.label}
          </Button>
        ))}
      </Stack>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#E3F2FD" }} elevation={0}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Typography variant="body2">
            <b>Granja activa:</b> {granjaActiva || "—"}
          </Typography>
          <Typography variant="body2">
            <b>Piletas:</b> {piletas.length} ({piletasAlevinaje.length} de alevinaje)
          </Typography>
          <Typography variant="body2">
            <b>Alevines vivos (alevinaje):</b>{" "}
            {totalOrganismosAlevinaje.toLocaleString("en-US")}
          </Typography>
        </Stack>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Alevinaje (${alevinajes.length})`} />
        <Tab label={`Piletas físicas (${piletas.length})`} />
      </Tabs>

      {tab === 0 && (
        <AlevinajeTab
          granjaActiva={granjaActiva}
          piletasAlevinaje={piletasAlevinaje}
          piletas={piletas}
          alevinajes={alevinajes}
          usuarioId={usuarioId}
          onChange={cargarAlevinajes}
          onChangePiletas={cargarPiletas}
          showSnackbar={showSnackbar}
          confirm={confirm}
        />
      )}

      {tab === 1 && (
        <PiletasTab
          granjaActiva={granjaActiva}
          piletas={piletas}
          onChange={cargarPiletas}
          showSnackbar={showSnackbar}
          confirm={confirm}
          ubicacionesGranja={ubicacionesGranja}
        />
      )}

      {ConfirmModal}
    </Box>
  );
}

/* ============================================================================
 *  TAB 1 — ALEVINAJE (modelo `alevinaje`)
 * ========================================================================= */
function AlevinajeTab({
  granjaActiva,
  piletasAlevinaje,
  piletas,
  alevinajes,
  usuarioId,
  onChange,
  onChangePiletas,
  showSnackbar,
  confirm,
}) {
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    pileta_id: "",
    fecha: "",
    lote: "",
    huevos_ml: "",
    ovadas: "",
    alevines_iniciales: "",
    mortalidad: "",
    observacion: "",
  });

  const required = ["pileta_id", "lote", "alevines_iniciales", "fecha"];

  const piletaSel = useMemo(
    () => piletasAlevinaje.find((p) => String(p.fi_pileta_id) === String(form.pileta_id)),
    [piletasAlevinaje, form.pileta_id],
  );

  const mortalidadPorc = useMemo(() => {
    const i = Number(form.alevines_iniciales) || 0;
    const m = Number(form.mortalidad) || 0;
    if (i <= 0) return "";
    return ((m * 100) / i).toFixed(2);
  }, [form.alevines_iniciales, form.mortalidad]);

  const limpiar = () => {
    clearErrors();
    setEditId(null);
    setForm({
      pileta_id: "",
      fecha: "",
      lote: "",
      huevos_ml: "",
      ovadas: "",
      alevines_iniciales: "",
      mortalidad: "",
      observacion: "",
    });
    setMostrarFormulario(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardar = async () => {
    if (!validate(form, required)) return;
    if (!granjaActiva) {
      showSnackbar("Selecciona una granja", "warning");
      return;
    }
    try {
      const body = {
        pileta_id: Number(form.pileta_id),
        fecha: form.fecha,
        lote: form.lote,
        huevos_ml: form.huevos_ml || null,
        ovadas: form.ovadas || 0,
        alevines_iniciales: Number(form.alevines_iniciales),
        mortalidad: Number(form.mortalidad) || 0,
        observacion: form.observacion,
        fi_usuario_id: usuarioId,
      };

      if (editId) {
        await updateAlevinaje(editId, body);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createAlevinaje(body);
        showSnackbar("Registro creado", "success");
      }

      limpiar();
      onChange();
      onChangePiletas();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error";
      showSnackbar(msg, "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
      pileta_id: row.pileta_id != null ? String(row.pileta_id) : "",
      fecha: row.fd_fecha?.split("T")[0] || "",
      lote: row.no_lote || "",
      huevos_ml: row.huevos_ml ?? "",
      ovadas: row.ovadas ?? "",
      alevines_iniciales: row.alevines_iniciales ?? "",
      mortalidad: row.mortalidad ?? "",
      observacion: row.fc_observacion ?? "",
    });
    setMostrarFormulario(true);
  };

  const eliminar = async (id) => {
    if (!(await confirm("¿Eliminar este registro de alevinaje?"))) return;
    try {
      await removeAlevinaje(id);
      onChange();
      showSnackbar("Registro eliminado", "success");
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
          onClick={() => (mostrarFormulario ? limpiar() : setMostrarFormulario(true))}
          disabled={!granjaActiva}
        >
          {mostrarFormulario ? "Cerrar formulario" : "Nuevo registro"}
        </Button>
      </Stack>

      {mostrarFormulario && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" mb={2}>
              {editId ? "Editar alevinaje" : "Nuevo alevinaje"}
            </Typography>

            {piletasAlevinaje.length === 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                No hay piletas tipo <b>alevinaje</b> en esta granja. Crea una en la
                pestaña <b>Piletas físicas</b> primero.
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Pileta (alevinaje)"
                  name="pileta_id"
                  value={form.pileta_id}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.pileta_id}
                  helperText={errors.pileta_id}
                  slotProps={{
                    select: {
                      renderValue: (val) => {
                        const p = piletasAlevinaje.find(
                          (x) => String(x.fi_pileta_id) === String(val),
                        );
                        return p ? `${p.nombre} · ${p.estado}` : "";
                      },
                    },
                  }}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {piletasAlevinaje.map((p) => (
                    <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
                      {p.nombre} · {p.estado}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  type="date"
                  label="Fecha"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fecha}
                  helperText={errors.fecha}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Lote"
                  name="lote"
                  value={form.lote}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.lote}
                  helperText={errors.lote || "Identificador del lote en esta pileta"}
                  inputProps={{ maxLength: 60 }}
                />
              </Grid>

              {piletaSel?.ultima_observacion && (
                <Grid size={12}>
                  <Alert severity="info">
                    <Typography variant="caption">
                      Última observación de {piletaSel.nombre}
                      {piletaSel.fc_ultima_observacion_proceso
                        ? ` (proceso ${piletaSel.fc_ultima_observacion_proceso})`
                        : ""}
                      :
                    </Typography>
                    <Typography variant="body2">{piletaSel.ultima_observacion}</Typography>
                  </Alert>
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Huevos/ml"
                  name="huevos_ml"
                  value={form.huevos_ml}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "decimal" }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Ovadas"
                  name="ovadas"
                  value={form.ovadas}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Alevines iniciales"
                  name="alevines_iniciales"
                  value={form.alevines_iniciales}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "numeric" }}
                  error={!!errors.alevines_iniciales}
                  helperText={errors.alevines_iniciales}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Mortalidad"
                  name="mortalidad"
                  value={form.mortalidad}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "numeric" }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Mortalidad %"
                  value={mortalidadPorc}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Calculado automáticamente"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Alevines vivos"
                  value={
                    form.alevines_iniciales
                      ? Number(form.alevines_iniciales) - Number(form.mortalidad || 0)
                      : ""
                  }
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  helperText="Iniciales − mortalidad"
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  label="Observación"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  inputProps={{ maxLength: MAX_OBSERVACION }}
                  helperText={`Se guarda como observación de la pileta (proceso "alevinaje"). ${String(form.observacion).length}/${MAX_OBSERVACION}`}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button variant="outlined" onClick={limpiar}>
                {editId ? "Cancelar" : "Limpiar"}
              </Button>
              <Button variant="contained" color="success" onClick={guardar}>
                {editId ? "Actualizar" : "Registrar"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      <Paper>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}>
            <TableHead sx={{ background: "#E8F5E9" }}>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Pileta</TableCell>
                <TableCell>Lote</TableCell>
                <TableCell align="right">Iniciales</TableCell>
                <TableCell align="right">Mortalidad</TableCell>
                <TableCell align="right">Mort. %</TableCell>
                <TableCell align="right">Vivos</TableCell>
                <TableCell>Días</TableCell>
                <TableCell>Última nota (pileta)</TableCell>
                <TableCell align="center" sx={{ minWidth: 120 }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alevinajes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Sin registros para esta granja.
                  </TableCell>
                </TableRow>
              )}
              {alevinajes.map((r) => {
                const dias = calcDias(r.fd_fecha);
                const vivos =
                  (Number(r.alevines_iniciales) || 0) - (Number(r.mortalidad) || 0);
                return (
                  <TableRow key={r.fi_id} hover>
                    <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
                    <TableCell>{r.nombre_pileta || "—"}</TableCell>
                    <TableCell>{r.no_lote}</TableCell>
                    <TableCell align="right">{formatNumber(r.alevines_iniciales)}</TableCell>
                    <TableCell align="right">{formatNumber(r.mortalidad)}</TableCell>
                    <TableCell align="right">
                      {formatNumber(r.mortalidad_porcentaje, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <b>{formatNumber(vivos)}</b>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={colorDias(dias)}
                        label={dias != null ? `${dias} d` : "—"}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <span title={r.fc_ultima_observacion_pileta || ""}>
                        {r.fc_ultima_observacion_pileta
                          ? truncar(r.fc_ultima_observacion_pileta)
                          : "—"}
                      </span>
                      {r.fc_ultima_observacion_proceso && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {r.fc_ultima_observacion_proceso}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => editar(r)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => eliminar(r.fi_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

/* ============================================================================
 *  TAB 2 — PILETAS FÍSICAS (CRUD del modelo `Pileta`)
 * ========================================================================= */
function PiletasTab({
  granjaActiva,
  piletas,
  onChange,
  showSnackbar,
  confirm,
  ubicacionesGranja,
}) {
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
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

  const limpiar = () => {
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
    setMostrarFormulario(false);
  };

  const guardar = async () => {
    if (!validate(form, required)) return;
    if (!granjaActiva) {
      showSnackbar("Selecciona una granja", "warning");
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

      if (editId) {
        await updatePileta(editId, body);
        showSnackbar("Pileta actualizada", "success");
      } else {
        await createPileta(body);
        showSnackbar("Pileta creada", "success");
      }
      limpiar();
      onChange();
    } catch (err) {
      showSnackbar(err.response?.data?.error || err.message || "Error", "error");
    }
  };

  const editar = (p) => {
    clearErrors();
    setEditId(p.fi_pileta_id);
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
          onClick={() => (mostrarFormulario ? limpiar() : setMostrarFormulario(true))}
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

            {!granjaActiva && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Selecciona primero una granja para asignar la pileta.
              </Alert>
            )}

            <Grid container spacing={2}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Granja"
                  value={ubicacionActual?.label || granjaActiva || ""}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
                  helperText="La granja se toma del selector superior"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={3}>
              <Button variant="outlined" onClick={limpiar}>
                {editId ? "Cancelar" : "Limpiar"}
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
                <TableCell>Granja</TableCell>
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
                    Sin piletas para esta granja.
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
