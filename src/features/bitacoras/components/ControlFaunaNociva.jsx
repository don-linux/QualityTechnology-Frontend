import React, { useState, useEffect, useCallback } from "react";
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
  listControlFaunaNociva,
  listEmpleadosControlFaunaNociva,
  createControlFaunaNociva,
  updateControlFaunaNociva,
} from "../services/bitacorasService";
import { listAreasInstalacionActivos } from "@features/catalogos/services/areasInstalacionService";
import { listFaunasDetectadasActivos } from "@features/catalogos/services/faunasDetectadasService";
import { listEvidenciasFaunaActivos } from "@features/catalogos/services/evidenciasFaunaService";
import { listEstadosTrampaActivos } from "@features/catalogos/services/estadosTrampaService";
import { listAccionesCorrectivasActivos } from "@features/catalogos/services/accionesCorrectivasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";

const CONDICIONES_MALLA = ["Bueno", "Regular", "Malo"];

const emptyForm = (usuarioId, ubicacion = "") => ({
  fecha: "",
  ubicacion,
  area_instalacion_id: "",
  fauna_detectada_id: "",
  evidencia_fauna_id: "",
  estado_trampa_id: "",
  condicion_malla: "",
  accion_correctiva_id: "",
  responsable: "",
  usuario_id: usuarioId,
});

function CatalogSelect({
  label,
  name,
  value,
  onChange,
  items,
  getId,
  getNombre,
  error,
  helperText,
}) {
  const selected = items.find((item) => String(getId(item)) === String(value));
  const showFallback =
    value && !selected ? (
      <MenuItem value={value}>Valor registrado (#{value})</MenuItem>
    ) : null;

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      error={!!error}
      helperText={helperText}
    >
      <MenuItem value="">Selecciona una opción</MenuItem>
      {items.map((item) => (
        <MenuItem key={getId(item)} value={String(getId(item))}>
          {getNombre(item)}
        </MenuItem>
      ))}
      {showFallback}
    </TextField>
  );
}

function ControlFaunaNocivaContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } =
    useUbicacionesGranja();

  const [form, setForm] = useState(emptyForm(usuarioId));
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [areasInstalacion, setAreasInstalacion] = useState([]);
  const [faunasDetectadas, setFaunasDetectadas] = useState([]);
  const [evidenciasFauna, setEvidenciasFauna] = useState([]);
  const [estadosTrampa, setEstadosTrampa] = useState([]);
  const [accionesCorrectivas, setAccionesCorrectivas] = useState([]);
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
    "area_instalacion_id",
    "fauna_detectada_id",
    "evidencia_fauna_id",
    "estado_trampa_id",
    "condicion_malla",
    "accion_correctiva_id",
    "responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarCatalogos = async () => {
    try {
      const [areasRes, faunasRes, evidenciasRes, estadosRes, accionesRes, empleadosRes] =
        await Promise.all([
          listAreasInstalacionActivos(),
          listFaunasDetectadasActivos(),
          listEvidenciasFaunaActivos(),
          listEstadosTrampaActivos(),
          listAccionesCorrectivasActivos(),
          listEmpleadosControlFaunaNociva(),
        ]);
      setAreasInstalacion(areasRes.data ?? []);
      setFaunasDetectadas(faunasRes.data ?? []);
      setEvidenciasFauna(evidenciasRes.data ?? []);
      setEstadosTrampa(estadosRes.data ?? []);
      setAccionesCorrectivas(accionesRes.data ?? []);
      setEmpleados(empleadosRes.data ?? []);
    } catch {
      showSnackbar("Error al cargar catálogos o empleados.", "error");
    }
  };

  const cargarDatos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setData([]);
      return;
    }

    try {
      const granjas = ubicacionesGranja.map((op) => op.value);
      const rows = await fetchMergedPorUbicaciones(granjas, listControlFaunaNociva);
      setData(rows);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      const payload = {
        ...form,
        area_instalacion_id: Number(form.area_instalacion_id),
        fauna_detectada_id: Number(form.fauna_detectada_id),
        evidencia_fauna_id: Number(form.evidencia_fauna_id),
        estado_trampa_id: Number(form.estado_trampa_id),
        accion_correctiva_id: Number(form.accion_correctiva_id),
      };
      if (editId) await updateControlFaunaNociva(editId, payload);
      else await createControlFaunaNociva(payload);

      const wasEdit = Boolean(editId);
      setEditId(null);
      cerrarFormulario();
      setForm(emptyForm(usuarioId, form.ubicacion));
      cargarDatos();
      showSnackbar(wasEdit ? "Registro actualizado" : "Registro guardado", "success");
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      fecha: r.fecha?.split("T")[0] || "",
      ubicacion: r.ubicacion || defaultUbicacion,
      area_instalacion_id: r.area_instalacion_id != null ? String(r.area_instalacion_id) : "",
      fauna_detectada_id: r.fauna_detectada_id != null ? String(r.fauna_detectada_id) : "",
      evidencia_fauna_id: r.evidencia_fauna_id != null ? String(r.evidencia_fauna_id) : "",
      estado_trampa_id: r.estado_trampa_id != null ? String(r.estado_trampa_id) : "",
      condicion_malla: r.condicion_malla || "",
      accion_correctiva_id: r.accion_correctiva_id != null ? String(r.accion_correctiva_id) : "",
      responsable: r.responsable || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Folio", value: (r) => r.codigo || "", render: (r) => r.codigo || r._num },
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Área / Instalación", value: (r) => r.area_instalacion_nombre },
    { header: "Fauna detectada", value: (r) => r.fauna_detectada_nombre },
    { header: "Evidencia", value: (r) => r.evidencia_fauna_nombre },
    { header: "Estado trampa", value: (r) => r.estado_trampa_nombre },
    { header: "Malla antipájaro", value: (r) => r.condicion_malla },
    { header: "Acción correctiva", value: (r) => r.accion_correctiva_nombre },
    { header: "Responsable", value: (r) => r.responsable },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1200}
      numerar={false}
      accionesMinWidth={260}
      acciones={(r) => (
        <>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => setRegistroDetalle(r)}
          >
            Ver
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => editar(r)}
          >
            Editar
          </Button>
        </>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Control de Fauna Nociva
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
                <CatalogSelect
                  label="Área / Instalación"
                  name="area_instalacion_id"
                  value={form.area_instalacion_id}
                  onChange={handleChange}
                  items={areasInstalacion}
                  getId={(item) => item.area_instalacion_id ?? item.id}
                  getNombre={(item) => item.nombre}
                  error={errors.area_instalacion_id}
                  helperText={errors.area_instalacion_id}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CatalogSelect
                  label="Fauna detectada"
                  name="fauna_detectada_id"
                  value={form.fauna_detectada_id}
                  onChange={handleChange}
                  items={faunasDetectadas}
                  getId={(item) => item.fauna_detectada_id ?? item.id}
                  getNombre={(item) => item.nombre}
                  error={errors.fauna_detectada_id}
                  helperText={errors.fauna_detectada_id}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CatalogSelect
                  label="Evidencia"
                  name="evidencia_fauna_id"
                  value={form.evidencia_fauna_id}
                  onChange={handleChange}
                  items={evidenciasFauna}
                  getId={(item) => item.evidencia_fauna_id ?? item.id}
                  getNombre={(item) => item.nombre}
                  error={errors.evidencia_fauna_id}
                  helperText={errors.evidencia_fauna_id}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CatalogSelect
                  label="Estado de trampa"
                  name="estado_trampa_id"
                  value={form.estado_trampa_id}
                  onChange={handleChange}
                  items={estadosTrampa}
                  getId={(item) => item.estado_trampa_id ?? item.id}
                  getNombre={(item) => item.nombre}
                  error={errors.estado_trampa_id}
                  helperText={errors.estado_trampa_id}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Condición de malla antipájaro"
                  name="condicion_malla"
                  value={form.condicion_malla}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.condicion_malla}
                  helperText={errors.condicion_malla}
                >
                  <MenuItem value="">Selecciona una opción</MenuItem>
                  {CONDICIONES_MALLA.map((op) => (
                    <MenuItem key={op} value={op}>
                      {op}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CatalogSelect
                  label="Acción correctiva"
                  name="accion_correctiva_id"
                  value={form.accion_correctiva_id}
                  onChange={handleChange}
                  items={accionesCorrectivas}
                  getId={(item) => item.accion_correctiva_id ?? item.id}
                  getNombre={(item) => item.nombre}
                  error={errors.accion_correctiva_id}
                  helperText={errors.accion_correctiva_id}
                />
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
                  {form.responsable &&
                    !empleados.some((e) => e.nombre_completo === form.responsable) && (
                      <MenuItem value={form.responsable}>{form.responsable}</MenuItem>
                    )}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" size="small" onClick={guardar}>
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
        searchKeys={[
          "codigo",
          "area_instalacion_nombre",
          "fauna_detectada_nombre",
          "evidencia_fauna_nombre",
          "estado_trampa_nombre",
          "accion_correctiva_nombre",
          "responsable",
          "condicion_malla",
        ]}
        placeholderBusqueda="Buscar folio, área, fauna o responsable"
        exportar={{
          columnas,
          titulo: "Control de Fauna Nociva",
          subtitulo: "Registro de hallazgos y acciones correctivas por área de instalación",
          nombreArchivo: "Control_Fauna_Nociva",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />

      <Dialog
        open={!!registroDetalle}
        onClose={() => setRegistroDetalle(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalle del Registro</DialogTitle>
        <DialogContent dividers>
          {registroDetalle && (
            <Grid container spacing={1.5}>
              {[
                { label: "Folio / ID", value: registroDetalle.codigo },
                { label: "Fecha", value: formatFecha(registroDetalle.fecha) },
                { label: "Ubicación", value: registroDetalle.ubicacion },
                { label: "Área / Instalación", value: registroDetalle.area_instalacion_nombre },
                { label: "Fauna detectada", value: registroDetalle.fauna_detectada_nombre },
                { label: "Evidencia", value: registroDetalle.evidencia_fauna_nombre },
                { label: "Estado de trampa", value: registroDetalle.estado_trampa_nombre },
                { label: "Condición malla antipájaro", value: registroDetalle.condicion_malla },
                { label: "Acción correctiva", value: registroDetalle.accion_correctiva_nombre },
                { label: "Responsable", value: registroDetalle.responsable },
              ].map(({ label, value }) => (
                <Grid size={{ xs: 12, sm: 6 }} key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2">{value || "—"}</Typography>
                </Grid>
              ))}
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistroDetalle(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ControlFaunaNociva() {
  return <ControlFaunaNocivaContent />;
}
