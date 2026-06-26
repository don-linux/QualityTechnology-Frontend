import React, { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import {
  listParametrosFisicoQuimicos,
  listEmpleadosParametrosFisicoQuimicos,
  createParametrosFisicoQuimico,
  updateParametrosFisicoQuimico,
} from "../services/bitacorasService";
import { listPiletas } from "@features/inventarios/services/piletasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import CampoNumericoConNA from "@shared/components/CampoNumericoConNA";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";
import { inferirTurnoMuestreo, TURNOS_MUESTREO } from "@shared/utils/turnoMuestreo";
import { esNoAplica, formatParametroNumerico } from "@shared/utils/parametroNumerico";

const COLORACIONES_AGUA = ["Agua transparente", "Agua roja", "Agua verde"];
const MAX_OBSERVACIONES = 500;

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = {
    alevinaje: "Alevinaje",
    reproductores: "Reproductores",
    engorda: "Engorda",
    incubacion: "Incubación",
  };
  return map[String(t).toLowerCase()] || t;
};

const emptyForm = (usuarioId, ubicacion = "") => ({
  ubicacion,
  fecha: "",
  hora: "",
  turno_muestreo: "",
  pileta_id: "",
  oxigeno: "",
  temperatura_agua: "",
  temperatura_ambiente: "",
  ph: "",
  ph_no_aplica: false,
  amonio: "",
  amonio_no_aplica: false,
  nitrito: "",
  nitrito_no_aplica: false,
  nitrato: "",
  nitrato_no_aplica: false,
  transparencia_sechhi: "",
  transparencia_sechhi_no_aplica: false,
  coloracion_agua: "Agua transparente",
  responsable: "",
  observaciones: "",
  usuario_id: usuarioId,
});

function validarCamposNA(form) {
  const campos = [
    { field: "ph", label: "pH" },
    { field: "amonio", label: "Amonio" },
    { field: "nitrito", label: "Nitrito" },
    { field: "nitrato", label: "Nitrato" },
    { field: "transparencia_sechhi", label: "Transparencia Secchi" },
  ];
  for (const { field, label } of campos) {
    if (!form[`${field}_no_aplica`] && (form[field] === "" || form[field] == null)) {
      return `${label} es obligatorio o debe marcarse N/A.`;
    }
  }
  return null;
}

export default function ParametrosFisicoQuimicos() {
  const auth = useAuth();
  const usuarioId = auth.usuarioId || "";
  const showSnackbar = useSnackbar();
  const {
    ubicacionesGranja,
    defaultUbicacion,
    getGroups,
    getLogo,
    getColor,
    resolveFiltroUbicacion,
  } = useUbicacionesGranja();

  const [form, setForm] = useState(emptyForm(usuarioId));
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [registroDetalle, setRegistroDetalle] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fecha",
    "hora",
    "pileta_id",
    "oxigeno",
    "temperatura_agua",
    "temperatura_ambiente",
    "coloracion_agua",
    "responsable",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "ubicacion") {
      setForm((prev) => ({ ...prev, ubicacion: value, pileta_id: "" }));
      return;
    }

    if (name === "hora") {
      setForm((prev) => ({
        ...prev,
        hora: value,
        turno_muestreo: inferirTurnoMuestreo(value),
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNoAplicaChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name.replace("_no_aplica", ""));
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(value ? { [name.replace("_no_aplica", "")]: "" } : {}),
    }));
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosParametrosFisicoQuimicos();
      setEmpleados(res.data ?? []);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  const cargarDatos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setData([]);
      return;
    }
    try {
      const granjas = ubicacionesGranja.map((op) => op.value);
      const rows = await fetchMergedPorUbicaciones(granjas, listParametrosFisicoQuimicos);
      setData(rows);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja]);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    const filtro = resolveFiltroUbicacion(form.ubicacion);
    if (!filtro) {
      setPiletas([]);
      return;
    }
    listPiletas(filtro)
      .then((res) => setPiletas(res.data ?? []))
      .catch(() => setPiletas([]));
  }, [form.ubicacion, resolveFiltroUbicacion]);

  const buildPayload = () => ({
    ubicacion: form.ubicacion,
    fecha: form.fecha,
    hora: form.hora,
    turno_muestreo: form.turno_muestreo || inferirTurnoMuestreo(form.hora),
    pileta_id: Number(form.pileta_id),
    oxigeno: Number(form.oxigeno),
    temperatura_agua: Number(form.temperatura_agua),
    temperatura_ambiente: Number(form.temperatura_ambiente),
    ph: form.ph_no_aplica ? 0 : Number(form.ph),
    ph_no_aplica: form.ph_no_aplica,
    amonio: form.amonio_no_aplica ? 0 : Number(form.amonio),
    amonio_no_aplica: form.amonio_no_aplica,
    nitrito: form.nitrito_no_aplica ? 0 : Number(form.nitrito),
    nitrito_no_aplica: form.nitrito_no_aplica,
    nitrato: form.nitrato_no_aplica ? 0 : Number(form.nitrato),
    nitrato_no_aplica: form.nitrato_no_aplica,
    transparencia_sechhi: form.transparencia_sechhi_no_aplica ? 0 : Number(form.transparencia_sechhi),
    transparencia_sechhi_no_aplica: form.transparencia_sechhi_no_aplica,
    coloracion_agua: form.coloracion_agua,
    responsable: form.responsable,
    observaciones: form.observaciones || null,
    usuario_id: form.usuario_id,
  });

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    const errorNA = validarCamposNA(form);
    if (errorNA) {
      showSnackbar(errorNA, "error");
      return;
    }

    try {
      const payload = buildPayload();
      if (editId) await updateParametrosFisicoQuimico(editId, payload);
      else await createParametrosFisicoQuimico(payload);

      const wasEdit = Boolean(editId);
      setEditId(null);
      cerrarFormulario();
      setForm(emptyForm(usuarioId, form.ubicacion));
      cargarDatos();
      showSnackbar(wasEdit ? "Registro actualizado" : "Registro guardado", "success");
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      ubicacion: r.ubicacion || defaultUbicacion,
      fecha: r.fecha?.split("T")[0] || "",
      hora: r.hora || "",
      turno_muestreo: r.turno_muestreo || inferirTurnoMuestreo(r.hora),
      pileta_id: r.pileta_id != null ? String(r.pileta_id) : "",
      oxigeno: r.oxigeno ?? "",
      temperatura_agua: r.temperatura_agua ?? "",
      temperatura_ambiente: r.temperatura_ambiente ?? "",
      ph: esNoAplica(r.ph) ? "" : (r.ph ?? ""),
      ph_no_aplica: esNoAplica(r.ph),
      amonio: esNoAplica(r.amonio) ? "" : (r.amonio ?? ""),
      amonio_no_aplica: esNoAplica(r.amonio),
      nitrito: esNoAplica(r.nitrito) ? "" : (r.nitrito ?? ""),
      nitrito_no_aplica: esNoAplica(r.nitrito),
      nitrato: esNoAplica(r.nitrato) ? "" : (r.nitrato ?? ""),
      nitrato_no_aplica: esNoAplica(r.nitrato),
      transparencia_sechhi: esNoAplica(r.transparencia_sechhi) ? "" : (r.transparencia_sechhi ?? ""),
      transparencia_sechhi_no_aplica: esNoAplica(r.transparencia_sechhi),
      coloracion_agua: r.coloracion_agua || "Agua transparente",
      responsable: r.responsable || "",
      observaciones: r.observaciones || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Folio", value: (r) => r.codigo || "", render: (r) => r.codigo || r._num },
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Hora", value: (r) => r.hora || "—" },
    { header: "Turno", value: (r) => r.turno_muestreo || "—" },
    {
      header: "Instalación",
      value: (r) => r.pileta_nombre || r.pileta_id || "—",
    },
    { header: "Oxígeno", value: (r) => r.oxigeno },
    { header: "Temp. agua", value: (r) => r.temperatura_agua },
    { header: "Temp. amb.", value: (r) => r.temperatura_ambiente },
    { header: "pH", value: (r) => formatParametroNumerico(r.ph) },
    { header: "Amonio", value: (r) => formatParametroNumerico(r.amonio) },
    { header: "Nitrito", value: (r) => formatParametroNumerico(r.nitrito) },
    { header: "Nitrato", value: (r) => formatParametroNumerico(r.nitrato) },
    {
      header: "Secchi",
      value: (r) => formatParametroNumerico(r.transparencia_sechhi),
    },
    { header: "Coloración", value: (r) => r.coloracion_agua || "—" },
    { header: "Responsable", value: (r) => r.responsable },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1600}
      numerar={false}
      accionesMinWidth={260}
      acciones={(r) => (
        <>
          <Button size="small" variant="outlined" color="info" onClick={() => setRegistroDetalle(r)}>
            Ver
          </Button>
          <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
            Editar
          </Button>
        </>
      )}
    />
  );

  const piletaSeleccionada = piletas.find((p) => String(p.pileta_id ?? p.id) === String(form.pileta_id));

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Parámetros Físico-Químicos
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Ubicación"
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.ubicacion}
                  helperText={errors.ubicacion}
                >
                  {ubicacionesGranja.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Fecha"
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.fecha}
                  helperText={errors.fecha}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Hora"
                  type="time"
                  name="hora"
                  value={form.hora}
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.hora}
                  helperText={errors.hora}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Turno de muestreo"
                  name="turno_muestreo"
                  value={form.turno_muestreo}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                >
                  {TURNOS_MUESTREO.map((turno) => (
                    <MenuItem key={turno} value={turno}>
                      {turno}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  select
                  label="Instalación"
                  name="pileta_id"
                  value={form.pileta_id}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.pileta_id}
                  helperText={errors.pileta_id}
                  SelectProps={{
                    renderValue: (selected) => {
                      const p = piletas.find((x) => String(x.pileta_id ?? x.id) === String(selected));
                      if (!p) return selected ? `#${selected}` : "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado || "—"}`;
                    },
                  }}
                >
                  <MenuItem value="">Selecciona instalación</MenuItem>
                  {piletas.map((p) => (
                    <MenuItem key={p.pileta_id ?? p.id} value={String(p.pileta_id ?? p.id)}>
                      {p.nombre} · {tipoLabel(p.tipo)} · {p.estado || "—"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumerico
                  label="Oxígeno"
                  name="oxigeno"
                  inputProps={{ min: 0, step: "any" }}
                  value={form.oxigeno}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.oxigeno}
                  helperText={errors.oxigeno}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumerico
                  label="Temperatura del agua"
                  name="temperatura_agua"
                  inputProps={{ step: "any" }}
                  value={form.temperatura_agua}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.temperatura_agua}
                  helperText={errors.temperatura_agua}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumerico
                  label="Temperatura ambiente"
                  name="temperatura_ambiente"
                  inputProps={{ step: "any" }}
                  value={form.temperatura_ambiente}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.temperatura_ambiente}
                  helperText={errors.temperatura_ambiente}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumericoConNA
                  label="pH"
                  name="ph"
                  inputProps={{ min: 0, max: 14, step: "any" }}
                  value={form.ph}
                  noAplica={form.ph_no_aplica}
                  onChange={handleChange}
                  onNoAplicaChange={handleNoAplicaChange}
                  error={!!errors.ph}
                  helperText={errors.ph}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumericoConNA
                  label="Amonio"
                  name="amonio"
                  inputProps={{ min: 0, step: "any" }}
                  value={form.amonio}
                  noAplica={form.amonio_no_aplica}
                  onChange={handleChange}
                  onNoAplicaChange={handleNoAplicaChange}
                  error={!!errors.amonio}
                  helperText={errors.amonio}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumericoConNA
                  label="Nitrito"
                  name="nitrito"
                  inputProps={{ min: 0, step: "any" }}
                  value={form.nitrito}
                  noAplica={form.nitrito_no_aplica}
                  onChange={handleChange}
                  onNoAplicaChange={handleNoAplicaChange}
                  error={!!errors.nitrito}
                  helperText={errors.nitrito}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumericoConNA
                  label="Nitrato"
                  name="nitrato"
                  inputProps={{ min: 0, step: "any" }}
                  value={form.nitrato}
                  noAplica={form.nitrato_no_aplica}
                  onChange={handleChange}
                  onNoAplicaChange={handleNoAplicaChange}
                  error={!!errors.nitrato}
                  helperText={errors.nitrato}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CampoNumericoConNA
                  label="Transparencia Secchi"
                  name="transparencia_sechhi"
                  inputProps={{ min: 0, step: "any" }}
                  value={form.transparencia_sechhi}
                  noAplica={form.transparencia_sechhi_no_aplica}
                  onChange={handleChange}
                  onNoAplicaChange={handleNoAplicaChange}
                  error={!!errors.transparencia_sechhi}
                  helperText={errors.transparencia_sechhi}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Coloración del agua"
                  name="coloracion_agua"
                  value={form.coloracion_agua}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.coloracion_agua}
                  helperText={errors.coloracion_agua}
                >
                  {COLORACIONES_AGUA.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Responsable"
                  name="responsable"
                  value={form.responsable}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.responsable}
                  helperText={errors.responsable}
                >
                  <MenuItem value="">Selecciona un empleado</MenuItem>
                  {empleados.map((empleado) => (
                    <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
                      {empleado.nombre_completo}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Observaciones"
                  name="observaciones"
                  value={form.observaciones}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  inputProps={{ maxLength: MAX_OBSERVACIONES }}
                  helperText={`${(form.observaciones || "").length}/${MAX_OBSERVACIONES}`}
                />
              </Grid>
            </Grid>

            {piletaSeleccionada && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Instalación: {piletaSeleccionada.nombre} · {tipoLabel(piletaSeleccionada.tipo)} ·{" "}
                {piletaSeleccionada.estado || "—"}
              </Typography>
            )}

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={guardar}>
                {editId ? "Actualizar" : "Guardar"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja
        grupos={gruposUbicacion}
        renderTabla={renderTabla}
        buscar
        searchKeys={["codigo", "pileta_nombre", "responsable", "turno_muestreo"]}
        placeholderBusqueda="Buscar folio, instalación o responsable"
        exportar={{
          columnas,
          titulo: "Parámetros Físico-Químicos",
          subtitulo: "Registro de parámetros físico-químicos del agua",
          nombreArchivo: "Parametros_Fisico_Quimicos",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />

      <Dialog open={Boolean(registroDetalle)} onClose={() => setRegistroDetalle(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Detalle del registro</DialogTitle>
        <DialogContent dividers>
          {registroDetalle && (
            <>
              {[
                { label: "Folio / ID", value: registroDetalle.codigo },
                { label: "Fecha", value: formatFecha(registroDetalle.fecha) },
                { label: "Hora", value: registroDetalle.hora },
                { label: "Turno", value: registroDetalle.turno_muestreo },
                {
                  label: "Instalación",
                  value: registroDetalle.pileta_nombre || registroDetalle.pileta_id,
                },
                { label: "Oxígeno", value: registroDetalle.oxigeno },
                { label: "Temperatura agua", value: registroDetalle.temperatura_agua },
                { label: "Temperatura ambiente", value: registroDetalle.temperatura_ambiente },
                { label: "pH", value: formatParametroNumerico(registroDetalle.ph) },
                { label: "Amonio", value: formatParametroNumerico(registroDetalle.amonio) },
                { label: "Nitrito", value: formatParametroNumerico(registroDetalle.nitrito) },
                { label: "Nitrato", value: formatParametroNumerico(registroDetalle.nitrato) },
                {
                  label: "Transparencia Secchi",
                  value: formatParametroNumerico(registroDetalle.transparencia_sechhi),
                },
                { label: "Coloración", value: registroDetalle.coloracion_agua },
                { label: "Responsable", value: registroDetalle.responsable },
                { label: "Observaciones", value: registroDetalle.observaciones || "—" },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2">{value ?? "—"}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistroDetalle(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
