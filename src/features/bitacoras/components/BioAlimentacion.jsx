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

const MAX_FC_OBSERVACIONES = 500;

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
    fn_num_instalacion: "",
    fn_peso_promedio_entrada: "",
    fd_fecha_siembra: "",
    fc_origen_alevines: "",
    fd_fecha: "",
    fn_total_alimento_gramos: "",
    fn_mortalidad: "",
    fc_recambio_agua: "",
    fn_temp_agua: "",
    fn_amonio: "",
    fn_ph: "",
    fc_observaciones: "",
    fi_usuario_id: usuarioId,
  });

  const [data, setData] = useState([]);
  const [origenes, setOrigenes] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fn_num_instalacion", "fn_peso_promedio_entrada",
    "fd_fecha_siembra", "fc_origen_alevines", "fd_fecha",
    "fn_total_alimento_gramos", "fn_mortalidad", "fc_recambio_agua",
    "fn_temp_agua", "fn_amonio", "fn_ph", "fc_observaciones",
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
        fi_instalacion_id: p.id ?? p.fi_pileta_id,
        nombre_instalacion: p.nombre ?? p.fc_nombre ?? p.nombre_pileta,
      }));
      setOrigenes(rows);
    } catch {
      showSnackbar("Error al cargar orígenes.", "error");
    }
  };

  const handleOrigenChange = (e) => {
    const origenSeleccionado = origenes.find(
      (origen) => String(origen.fi_instalacion_id) === String(e.target.value)
    );

    clearFieldError("fc_origen_alevines");
    clearFieldError("fn_num_instalacion");

    setForm({
      ...form,
      fn_num_instalacion: origenSeleccionado?.fi_instalacion_id || "",
      fc_origen_alevines: origenSeleccionado?.nombre_instalacion || "",
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
      const body = { ...form, fc_mes: mesDesdefecha(form.fd_fecha) };
      if (editId) {
        await updateAlimentacion(editId, body);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createAlimentacion(body);
        showSnackbar("Registro guardado", "success");
      }

      setForm({
        ubicacion: form.ubicacion,
        fn_num_instalacion: "",
        fn_peso_promedio_entrada: "",
        fd_fecha_siembra: "",
        fc_origen_alevines: "",
        fd_fecha: "",
        fn_total_alimento_gramos: "",
        fn_mortalidad: "",
        fc_recambio_agua: "",
        fn_temp_agua: "",
        fn_amonio: "",
        fn_ph: "",
        fc_observaciones: "",
        fi_usuario_id: usuarioId,
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
    setEditId(row.fi_id);
    setForm({
      ubicacion: row.ubicacion || "",
      fn_num_instalacion: row.fn_num_instalacion,
      fn_peso_promedio_entrada: row.fn_peso_promedio_entrada,
      fd_fecha_siembra: row.fd_fecha_siembra?.split("T")[0],
      fc_origen_alevines: row.fc_origen_alevines,
      fd_fecha: row.fd_fecha?.split("T")[0],
      fn_total_alimento_gramos: row.fn_total_alimento_gramos,
      fn_mortalidad: row.fn_mortalidad,
      fc_recambio_agua: row.fc_recambio_agua,
      fn_temp_agua: row.fn_temp_agua,
      fn_amonio: row.fn_amonio,
      fn_ph: row.fn_ph,
      fc_observaciones: row.fc_observaciones,
      fi_usuario_id: row.fi_usuario_id,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Mes", value: (r) => r.fc_mes },
    { header: "Instalación", value: (r) => r.fn_num_instalacion },
    { header: "Peso Entrada", value: (r) => r.fn_peso_promedio_entrada },
    { header: "Siembra", value: (r) => formatFecha(r.fd_fecha_siembra) },
    { header: "Origen", value: (r) => r.fc_origen_alevines },
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha) },
    { header: "Alimento (g)", value: (r) => r.fn_total_alimento_gramos },
    { header: "Mortalidad", value: (r) => r.fn_mortalidad },
    { header: "Recambio", value: (r) => r.fc_recambio_agua },
    { header: "Temp", value: (r) => r.fn_temp_agua },
    { header: "Amonio", value: (r) => r.fn_amonio },
    { header: "pH", value: (r) => r.fn_ph },
    { header: "Observaciones", value: (r) => r.fc_observaciones, truncate: true, maxWidth: 160 },
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
                  setForm(prev => ({ ...prev, ubicacion: e.target.value, fn_num_instalacion: "", fc_origen_alevines: "" }));
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
                name="fn_num_instalacion"
                value={form.fn_num_instalacion}
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Peso Promedio Entrada"
                name="fn_peso_promedio_entrada"
                value={form.fn_peso_promedio_entrada}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_peso_promedio_entrada}
                helperText={errors.fn_peso_promedio_entrada}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Fecha Siembra"
                type="date"
                name="fd_fecha_siembra"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_siembra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_siembra}
                helperText={errors.fd_fecha_siembra}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Origen Alevines"
                name="fc_origen_alevines"
                value={form.fn_num_instalacion || ""}
                onChange={handleOrigenChange}
                fullWidth
                error={!!errors.fc_origen_alevines}
                helperText={errors.fc_origen_alevines}
              >
                <MenuItem value="">Selecciona un origen</MenuItem>
                {origenes.map((origen) => (
                  <MenuItem
                    key={`${origen.fi_instalacion_id}-${origen.fi_lote_id || "sin-lote"}`}
                    value={origen.fi_instalacion_id}
                  >
                    {`${origen.nombre_instalacion} (Inst. ${origen.fi_instalacion_id})`}
                  </MenuItem>
                ))}
                {form.fc_origen_alevines && !origenes.some((origen) => origen.nombre_instalacion === form.fc_origen_alevines) && (
                  <MenuItem value={form.fn_num_instalacion}>{form.fc_origen_alevines}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Total Alimento (g)"
                name="fn_total_alimento_gramos"
                value={form.fn_total_alimento_gramos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_total_alimento_gramos}
                helperText={errors.fn_total_alimento_gramos}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Mortalidad"
                name="fn_mortalidad"
                decimalScale={0}
                value={form.fn_mortalidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_mortalidad}
                helperText={errors.fn_mortalidad}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Recambio Agua"
                name="fc_recambio_agua"
                value={form.fc_recambio_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_recambio_agua}
                helperText={errors.fc_recambio_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Temp. Agua"
                name="fn_temp_agua"
                value={form.fn_temp_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_temp_agua}
                helperText={errors.fn_temp_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Amonio"
                name="fn_amonio"
                value={form.fn_amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_amonio}
                helperText={errors.fn_amonio}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="pH"
                name="fn_ph"
                value={form.fn_ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_ph}
                helperText={errors.fn_ph}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                fullWidth
                value={form.fc_observaciones}
                onChange={handleChange}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${form.fc_observaciones.length}/${MAX_FC_OBSERVACIONES}`}
                inputProps={{ maxLength: MAX_FC_OBSERVACIONES }}
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
        searchKeys={["fc_mes", "fn_num_instalacion", "fc_origen_alevines", "fc_observaciones"]}
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

