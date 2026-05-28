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
import { listTiposPiletaActivos } from "@features/catalogos/services/tiposPiletaService";
import {
  getTipoPiletaId,
  getTipoPiletaNombre,
} from "@features/catalogos/utils/catalogEntityGetters";
import { ESTADOS_CONSERVACION_PILETA } from "@shared/constants/estadosConservacionPileta";

import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";

const TRUNCAR_MAX = 60;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const TIPOS_PILETA = ["alevinaje", "reproductores", "engorda", "incubacion"];
const ESTADOS_PILETA = ["vacia", "ocupada"];
const MATERIALES = ["concreto", "geomembrana", "fibra", "tierra", "otro"];

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda", incubacion: "Incubación" };
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
export default function Pileta({ pageTitle = "Infraestructura Física" } = {}) {
  const showSnackbar = useSnackbar();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const [piletas, setPiletas] = useState([]);

  const cargarPiletas = useCallback(async () => {
    try {
      const resAll = await listPiletas();
      setPiletas(Array.isArray(resAll.data) ? resAll.data : []);
    } catch {
      setPiletas([]);
      showSnackbar("Error cargando piletas", "error");
    }
  }, [showSnackbar]);

  useEffect(() => {
    cargarPiletas();
  }, [cargarPiletas]);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        {pageTitle}
      </Typography>

      <Paper sx={{ p: 2, mb: 2, backgroundColor: "#E3F2FD" }} elevation={0}>
        <Typography variant="body2">
          <b>Piletas registradas:</b> {piletas.length}
        </Typography>
      </Paper>

      <PiletasTab
        piletas={piletas}
        onChange={cargarPiletas}
        showSnackbar={showSnackbar}
        confirm={confirm}
        ubicacionesGranja={ubicacionesGranja}
        defaultUbicacion={defaultUbicacion}
        getGroups={getGroups}
      />

      {ConfirmModal}
    </Box>
  );
}

/* ============================================================================
 *  Formulario + tabla — CRUD modelo `Pileta`
 * ========================================================================= */
function PiletasTab({
  piletas,
  onChange,
  showSnackbar,
  confirm,
  ubicacionesGranja,
  defaultUbicacion,
  getGroups,
}) {
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editId, setEditId] = useState(null);
  const [ubicacionForm, setUbicacionForm] = useState("");

  const [tiposPileta, setTiposPileta] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    largo: "",
    ancho: "",
    alto: "",
    material: "",
    estado: "vacia",
    tipo: "",
    estado_conservacion: "",
    tipo_pileta_id: "",
  });

  const required = [
    "nombre",
    "largo",
    "ancho",
    "alto",
    "material",
    "tipo",
    "estado_conservacion",
    "tipo_pileta_id",
  ];

  const ubicacionActual = useMemo(
    () => ubicacionesGranja.find((u) => u.value === ubicacionForm),
    [ubicacionesGranja, ubicacionForm],
  );

  const gruposPiletas = useMemo(
    () => getGroups(piletas, "fc_granja"),
    [getGroups, piletas],
  );

  useEffect(() => {
    listTiposPiletaActivos()
      .then(({ data }) => setTiposPileta(Array.isArray(data) ? data : []))
      .catch(() => setTiposPileta([]));
  }, []);

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
      estado_conservacion: "",
      tipo_pileta_id: "",
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
      estado_conservacion: "",
      tipo_pileta_id: "",
    });
  };

  const guardar = async () => {
    if (!validate(form, required)) return;
    if (!ubicacionForm) {
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
        estado_conservacion: form.estado_conservacion,
        tipo_pileta_id: Number(form.tipo_pileta_id),
        granja: ubicacionForm,
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
    setUbicacionForm(matchUbicacion?.value || defaultUbicacion || "");
    setForm({
      nombre: p.nombre || "",
      largo: p.largo ?? "",
      ancho: p.ancho ?? "",
      alto: p.alto ?? "",
      material: p.material || "",
      estado: p.estado || "vacia",
      tipo: p.tipo || "",
      estado_conservacion: p.fc_estado_conservacion || p.estado_conservacion || "",
      tipo_pileta_id: p.tipo_pileta_id != null ? String(p.tipo_pileta_id) : "",
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
          onClick={() => {
            if (mostrarFormulario) {
              limpiar(true);
            } else {
              setUbicacionForm(defaultUbicacion || ubicacionesGranja[0]?.value || "");
              setMostrarFormulario(true);
            }
          }}
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
                  value={ubicacionForm || ""}
                  onChange={(e) => setUbicacionForm(e.target.value)}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  required
                  label="Estado de conservación"
                  name="estado_conservacion"
                  value={form.estado_conservacion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.estado_conservacion}
                  helperText={errors.estado_conservacion}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {ESTADOS_CONSERVACION_PILETA.map((ec) => (
                    <MenuItem key={ec} value={ec}>
                      {ec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  required
                  label="Tipo de pileta"
                  name="tipo_pileta_id"
                  value={form.tipo_pileta_id}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.tipo_pileta_id}
                  helperText={
                    errors.tipo_pileta_id ||
                    (tiposPileta.length === 0
                      ? "Configure valores en Catálogos → Tipos de pileta"
                      : "")
                  }
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {tiposPileta.map((ti) => (
                    <MenuItem
                      key={getTipoPiletaId(ti)}
                      value={String(getTipoPiletaId(ti))}
                    >
                      {getTipoPiletaNombre(ti)}
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

      <TablasPorUbicacionGranja
        grupos={gruposPiletas}
        renderTabla={(rows) => (
          <Paper>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 1200 }}>
                <TableHead sx={{ background: "#E3F2FD" }}>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Etapa</TableCell>
                    <TableCell>Tipo de pileta</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Conservación</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Vol. m³</TableCell>
                    <TableCell>Material</TableCell>
                    <TableCell>Última observación</TableCell>
                    <TableCell align="center" sx={{ minWidth: 120 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        Sin piletas en esta ubicación.
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((p) => (
                    <TableRow key={p.fi_pileta_id} hover>
                      <TableCell>{p.nombre}</TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={tipoLabel(p.tipo)} />
                      </TableCell>
                      <TableCell>{p.fc_tipo_pileta || "—"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={p.estado === "ocupada" ? "warning" : "default"}
                          variant="outlined"
                          label={p.estado}
                        />
                      </TableCell>
                      <TableCell>{p.fc_estado_conservacion || "—"}</TableCell>
                      <TableCell align="right">{formatNumber(p.cantidad ?? p.fn_cantidad)}</TableCell>
                      <TableCell align="right">
                        {formatNumber(p.metros_cubicos, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 3,
                        })}
                      </TableCell>
                      <TableCell>{p.material}</TableCell>
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
        )}
      />
    </>
  );
}
