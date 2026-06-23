import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
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
import {
  getAreaInstalacionId,
  getAreaInstalacionNombre,
  getFaunaDetectadaId,
  getFaunaDetectadaNombre,
  getEvidenciaFaunaId,
  getEvidenciaFaunaNombre,
  getEstadoTrampaId,
  getEstadoTrampaNombre,
  getAccionCorrectivaId,
  getAccionCorrectivaNombre,
} from "@features/catalogos/utils/catalogEntityGetters";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

const CONDICIONES_MALLA = ["Bueno", "Regular", "Malo"];

const emptyForm = (usuarioId, ubicacion = "") => ({
  fd_fecha: "",
  ubicacion,
  area_instalacion_id: "",
  fauna_detectada_id: "",
  evidencia_fauna_id: "",
  estado_trampa_id: "",
  condicion_malla: "",
  accion_correctiva_id: "",
  responsable: "",
  fi_usuario_id: usuarioId,
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
  const [busqueda, setBusqueda] = useState("");
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
    "fd_fecha",
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
      const q = busqueda.trim().toLowerCase();
      const filtrados = rows.filter((r) => {
        if (!q) return true;
        return [
          r.codigo,
          r.area_instalacion_nombre,
          r.fauna_detectada_nombre,
          r.evidencia_fauna_nombre,
          r.estado_trampa_nombre,
          r.accion_correctiva_nombre,
          r.responsable,
          r.condicion_malla,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      });
      setData(filtrados);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja, busqueda]);

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
    setEditId(r.fi_id);
    setForm({
      fd_fecha: r.fd_fecha?.split("T")[0] || "",
      ubicacion: r.ubicacion || defaultUbicacion,
      area_instalacion_id: r.area_instalacion_id != null ? String(r.area_instalacion_id) : "",
      fauna_detectada_id: r.fauna_detectada_id != null ? String(r.fauna_detectada_id) : "",
      evidencia_fauna_id: r.evidencia_fauna_id != null ? String(r.evidencia_fauna_id) : "",
      estado_trampa_id: r.estado_trampa_id != null ? String(r.estado_trampa_id) : "",
      condicion_malla: r.condicion_malla || "",
      accion_correctiva_id: r.accion_correctiva_id != null ? String(r.accion_correctiva_id) : "",
      responsable: r.responsable || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = getLogo(defaultUbicacion);
    const color = getColor(defaultUbicacion);

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {
      // Logo is optional for exported PDFs.
    }

    doc.setFontSize(14);
    doc.text("Control de Fauna Nociva — Todas las ubicaciones", 45, 20);
    doc.setFontSize(10);
    doc.text("Registro de hallazgos y acciones correctivas por área de instalación", 45, 26);

    const columnas = [
      "Folio",
      "Fecha",
      "Área",
      "Fauna",
      "Evidencia",
      "Estado trampa",
      "Malla",
      "Acción",
      "Responsable",
    ];
    const filas = data.map((r) => [
      r.codigo || "",
      formatFecha(r.fd_fecha),
      r.area_instalacion_nombre,
      r.fauna_detectada_nombre,
      r.evidencia_fauna_nombre,
      r.estado_trampa_nombre,
      r.condicion_malla,
      r.accion_correctiva_nombre,
      r.responsable,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7 },
      headStyles: { fillColor: color, textColor: 255, halign: "center" },
    });

    const fecha = formatFecha(new Date());
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Control_Fauna_Nociva_${fecha}.pdf`);
  };

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => {
    const filas = ordenarYNumerar(rows, ["fi_id"]);
    return (
      <Paper sx={{ width: "100%" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead sx={{ background: "#E3F2FD" }}>
              <TableRow>
                <TableCell>Folio</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Área / Instalación</TableCell>
                <TableCell>Fauna detectada</TableCell>
                <TableCell>Evidencia</TableCell>
                <TableCell>Estado trampa</TableCell>
                <TableCell>Malla antipájaro</TableCell>
                <TableCell>Acción correctiva</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell align="center" sx={{ minWidth: 260, whiteSpace: "nowrap" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filas.map((r) => (
                <TableRow key={r.fi_id}>
                  <TableCell>{r.codigo || r._num}</TableCell>
                  <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
                  <TableCell>{r.area_instalacion_nombre}</TableCell>
                  <TableCell>{r.fauna_detectada_nombre}</TableCell>
                  <TableCell>{r.evidencia_fauna_nombre}</TableCell>
                  <TableCell>{r.estado_trampa_nombre}</TableCell>
                  <TableCell>{r.condicion_malla}</TableCell>
                  <TableCell>{r.accion_correctiva_nombre}</TableCell>
                  <TableCell>{r.responsable}</TableCell>
                  <TableCell
                    align="center"
                    sx={{ minWidth: 260, verticalAlign: "middle", whiteSpace: "nowrap" }}
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
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Control de Fauna Nociva
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <TextField
          label="Buscar registro"
          variant="outlined"
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 280 }}
        />
      </Box>

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
                  name="fd_fecha"
                  value={form.fd_fecha}
                  InputLabelProps={{ shrink: true }}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.fd_fecha}
                  helperText={errors.fd_fecha}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CatalogSelect
                  label="Área / Instalación"
                  name="area_instalacion_id"
                  value={form.area_instalacion_id}
                  onChange={handleChange}
                  items={areasInstalacion}
                  getId={getAreaInstalacionId}
                  getNombre={getAreaInstalacionNombre}
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
                  getId={getFaunaDetectadaId}
                  getNombre={getFaunaDetectadaNombre}
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
                  getId={getEvidenciaFaunaId}
                  getNombre={getEvidenciaFaunaNombre}
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
                  getId={getEstadoTrampaId}
                  getNombre={getEstadoTrampaNombre}
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
                  getId={getAccionCorrectivaId}
                  getNombre={getAccionCorrectivaNombre}
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
                    <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                      {empleado.fc_nombre_completo}
                    </MenuItem>
                  ))}
                  {form.responsable &&
                    !empleados.some((e) => e.fc_nombre_completo === form.responsable) && (
                      <MenuItem value={form.responsable}>{form.responsable}</MenuItem>
                    )}
                </TextField>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" size="small" onClick={guardar}>
                {editId ? "Actualizar" : "Guardar"}
              </Button>
              <Button variant="outlined" size="small" onClick={exportarPDF}>
                Exportar PDF
              </Button>
            </Box>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja grupos={gruposUbicacion} renderTabla={renderTabla} />

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
                { label: "Fecha", value: formatFecha(registroDetalle.fd_fecha) },
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
