import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import {
  listAlimentacion,
  createAlimentacion,
  updateAlimentacion,
} from "../services/alimentacionService";
import { listPiletas } from "@features/inventarios/services/piletasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { formatFecha } from "@shared/utils/formatters";

const MAX_OBSERVACIONES = 500;

const MESES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const mesDesdefecha = (fecha) => {
  if (!fecha) return "";
  const mes = new Date(fecha + "T00:00:00").getMonth() + 1;
  return MESES[mes] || "";
};

export default function BioAlimentacion() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    pileta_id: "",
    peso_promedio_entrada: "",
    fecha_siembra: "",
    origen_alevines: "",
    fecha: "",
    total_alimento_gramos: "",
    mortalidad: "",
    recambio_agua: "",
    temperatura_agua: "",
    amonio: "",
    ph: "",
    observaciones: "",
    usuario_id: usuarioId,
  });

  const [data, setData] = useState([]);
  const [origenes, setOrigenes] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "pileta_id", "peso_promedio_entrada",
    "fecha_siembra", "origen_alevines", "fecha",
    "total_alimento_gramos", "mortalidad", "recambio_agua",
    "temperatura_agua", "amonio", "ph", "observaciones",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listAlimentacion();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarOrigenes = async () => {
    if (!form.ubicacion) { setOrigenes([]); return; }
    try {
      const res = await listPiletas(form.ubicacion, "alevinaje");
      const rows = (res.data || []).map((p) => ({
        pileta_id: p.id ?? p.pileta_id,
        nombre_instalacion: p.nombre ?? p.nombre_pileta,
      }));
      setOrigenes(rows);
    } catch {
      showSnackbar("Error al cargar orígenes.", "error");
    }
  };

  const handleOrigenChange = (e) => {
    const origenSeleccionado = origenes.find(
      (origen) => String(origen.pileta_id) === String(e.target.value)
    );

    clearFieldError("origen_alevines");
    clearFieldError("pileta_id");

    setForm({
      ...form,
      pileta_id: origenSeleccionado?.pileta_id || "",
      origen_alevines: origenSeleccionado?.nombre_instalacion || "",
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarOrigenes();
  }, [form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      const body = { ...form, mes: mesDesdefecha(form.fecha) };
      if (editId) {
        await updateAlimentacion(editId, body);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createAlimentacion(body);
        showSnackbar("Registro guardado", "success");
      }

      setForm({
        ubicacion: form.ubicacion,
        pileta_id: "",
        peso_promedio_entrada: "",
        fecha_siembra: "",
        origen_alevines: "",
        fecha: "",
        total_alimento_gramos: "",
        mortalidad: "",
        recambio_agua: "",
        temperatura_agua: "",
        amonio: "",
        ph: "",
        observaciones: "",
        usuario_id: usuarioId,
      });

      setEditId(null);
      cerrarFormulario();
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.id);
    setForm({
      ubicacion: row.ubicacion || "",
      pileta_id: row.pileta_id,
      peso_promedio_entrada: row.peso_promedio_entrada,
      fecha_siembra: row.fecha_siembra?.split("T")[0],
      origen_alevines: row.origen_alevines,
      fecha: row.fecha?.split("T")[0],
      total_alimento_gramos: row.total_alimento_gramos,
      mortalidad: row.mortalidad,
      recambio_agua: row.recambio_agua,
      temperatura_agua: row.temperatura_agua,
      amonio: row.amonio,
      ph: row.ph,
      observaciones: row.observaciones,
      usuario_id: row.usuario_id,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Mes", value: (r) => r.mes },
    { header: "Instalación", value: (r) => r.pileta_id },
    { header: "Peso Entrada", value: (r) => r.peso_promedio_entrada },
    { header: "Siembra", value: (r) => formatFecha(r.fecha_siembra) },
    { header: "Origen", value: (r) => r.origen_alevines },
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Alimento (g)", value: (r) => r.total_alimento_gramos },
    { header: "Mortalidad", value: (r) => r.mortalidad },
    { header: "Recambio", value: (r) => r.recambio_agua },
    { header: "Temp", value: (r) => r.temperatura_agua },
    { header: "Amonio", value: (r) => r.amonio },
    { header: "pH", value: (r) => r.ph },
    { header: "Observaciones", value: (r) => r.observaciones, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const tablaAlimentacion = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1350}
      acciones={(row) => (
        <Button variant="contained" color="warning" size="small" onClick={() => editar(row)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Alimentación
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  label="Ubicación"
                  name="ubicacion"
                value={form.ubicacion}
                onChange={(e) => {
                  handleChange(e);
                  setForm(prev => ({ ...prev, ubicacion: e.target.value, pileta_id: "", origen_alevines: "" }));
                }}
                fullWidth
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

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Instalación"
                name="pileta_id"
                value={form.pileta_id}
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.pileta_id}
                helperText={errors.pileta_id}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Peso Promedio Entrada"
                name="peso_promedio_entrada"
                value={form.peso_promedio_entrada}
                onChange={handleChange}
                fullWidth
                error={!!errors.peso_promedio_entrada}
                helperText={errors.peso_promedio_entrada}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Fecha Siembra"
                type="date"
                name="fecha_siembra"
                InputLabelProps={{ shrink: true }}
                value={form.fecha_siembra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha_siembra}
                helperText={errors.fecha_siembra}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Origen Alevines"
                name="origen_alevines"
                value={form.pileta_id || ""}
                onChange={handleOrigenChange}
                fullWidth
                error={!!errors.origen_alevines}
                helperText={errors.origen_alevines}
              >
                <MenuItem value="">Selecciona un origen</MenuItem>
                {origenes.map((origen) => (
                  <MenuItem
                    key={origen.pileta_id}
                    value={origen.pileta_id}
                  >
                    {`${origen.nombre_instalacion} (Inst. ${origen.pileta_id})`}
                  </MenuItem>
                ))}
                {form.origen_alevines && !origenes.some((origen) => origen.nombre_instalacion === form.origen_alevines) && (
                  <MenuItem value={form.pileta_id}>{form.origen_alevines}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Total Alimento (g)"
                name="total_alimento_gramos"
                value={form.total_alimento_gramos}
                onChange={handleChange}
                fullWidth
                error={!!errors.total_alimento_gramos}
                helperText={errors.total_alimento_gramos}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Mortalidad"
                name="mortalidad"
                decimalScale={0}
                value={form.mortalidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.mortalidad}
                helperText={errors.mortalidad}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Recambio Agua"
                name="recambio_agua"
                value={form.recambio_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.recambio_agua}
                helperText={errors.recambio_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Temp. Agua"
                name="temperatura_agua"
                value={form.temperatura_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.temperatura_agua}
                helperText={errors.temperatura_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Amonio"
                name="amonio"
                value={form.amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.amonio}
                helperText={errors.amonio}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="pH"
                name="ph"
                value={form.ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.ph}
                helperText={errors.ph}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                multiline
                rows={2}
                fullWidth
                value={form.observaciones}
                onChange={handleChange}
                error={!!errors.observaciones}
                helperText={errors.observaciones || `${form.observaciones.length}/${MAX_OBSERVACIONES}`}
                inputProps={{ maxLength: MAX_OBSERVACIONES }}
              />
            </Grid>
          </Grid>

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
        renderTabla={tablaAlimentacion}
        buscar
        searchKeys={["mes", "pileta_id", "origen_alevines", "observaciones"]}
        placeholderBusqueda="Buscar mes, instalación u origen"
        exportar={{
          columnas,
          titulo: "Bitácora de Alimentación",
          subtitulo: "Control de alimentación, parámetros y observaciones",
          nombreArchivo: "Bitacora_Alimentacion",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}
