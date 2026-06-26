import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {
  listMedicamentos,
  listEmpleadosMedicamentos,
  createMedicamento,
  updateMedicamento,
} from "../services/bitacorasService";
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

const MAX_DIAGNOSTICO = 500;
const MAX_TRATAMIENTO = 500;
const MAX_DOSIS = 100;

function BitacoraMedicamentosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    fecha_hora: "",
    numero_estanque: "",
    diagnostico: "",
    tratamiento: "",
    dosis: "",
    forma_aplicacion: "",
    fecha_ultima_dosis: "",
    responsable: "",
    ubicacion: "",
    usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fecha_hora", "numero_estanque", "diagnostico", "tratamiento",
    "dosis", "forma_aplicacion", "fecha_ultima_dosis", "responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listMedicamentos();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosMedicamentos();
      setEmpleados(res.data);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  //  Guardar / Actualizar
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateMedicamento(editId, form);
      else await createMedicamento(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        fecha_hora: "",
        numero_estanque: "",
        diagnostico: "",
        tratamiento: "",
        dosis: "",
        forma_aplicacion: "",
        fecha_ultima_dosis: "",
        responsable: "",
        ubicacion: form.ubicacion,
        usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  //  Editar
  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      fecha_hora: r.fecha_hora?.split("T")[0],
      numero_estanque: r.numero_estanque ?? "",
      diagnostico: r.diagnostico || "",
      tratamiento: r.tratamiento || "",
      dosis: r.dosis || "",
      forma_aplicacion: r.forma_aplicacion || "",
      fecha_ultima_dosis: r.fecha_ultima_dosis?.split("T")[0],
      responsable: r.responsable || "",
      ubicacion: r.ubicacion || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fecha_hora) },
    { header: "Estanque", value: (r) => r.numero_estanque },
    { header: "Diagnóstico", value: (r) => r.diagnostico, truncate: true, maxWidth: 160 },
    { header: "Tratamiento", value: (r) => r.tratamiento, truncate: true, maxWidth: 160 },
    { header: "Dosis", value: (r) => r.dosis, truncate: true, maxWidth: 160 },
    { header: "Forma Aplicación", value: (r) => r.forma_aplicacion },
    { header: "Última Dosis", value: (r) => formatFecha(r.fecha_ultima_dosis) },
    { header: "Responsable", value: (r) => r.responsable, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaMedicamentos = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1240}
      acciones={(r) => (
        <Button size="small" color="warning" variant="contained" onClick={() => editar(r)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Aplicación de Medicamentos</Typography>

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
                onChange={handleChange}
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
              <TextField label="Fecha" type="date" name="fecha_hora" InputLabelProps={{ shrink: true }}
                value={form.fecha_hora} onChange={handleChange} fullWidth error={!!errors.fecha_hora} helperText={errors.fecha_hora} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico label="Estanque" name="numero_estanque"
                decimalScale={0} inputProps={{ min: 0, step: 1 }}
                value={form.numero_estanque} onChange={handleChange} fullWidth error={!!errors.numero_estanque} helperText={errors.numero_estanque} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Diagnóstico"
                name="diagnostico"
                value={form.diagnostico}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.diagnostico}
                helperText={errors.diagnostico || `${form.diagnostico.length}/${MAX_DIAGNOSTICO}`}
                inputProps={{ maxLength: MAX_DIAGNOSTICO }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Tratamiento"
                name="tratamiento"
                value={form.tratamiento}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                error={!!errors.tratamiento}
                helperText={errors.tratamiento || `${form.tratamiento.length}/${MAX_TRATAMIENTO}`}
                inputProps={{ maxLength: MAX_TRATAMIENTO }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Dosis"
                name="dosis"
                value={form.dosis}
                onChange={handleChange}
                fullWidth
                error={!!errors.dosis}
                helperText={errors.dosis || `${String(form.dosis).length}/${MAX_DOSIS}`}
                inputProps={{ maxLength: MAX_DOSIS }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Forma Aplicación" name="forma_aplicacion"
                value={form.forma_aplicacion} onChange={handleChange} fullWidth error={!!errors.forma_aplicacion} helperText={errors.forma_aplicacion} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Última Dosis" type="date" name="fecha_ultima_dosis"
                InputLabelProps={{ shrink: true }}
                value={form.fecha_ultima_dosis} onChange={handleChange} fullWidth error={!!errors.fecha_ultima_dosis} helperText={errors.fecha_ultima_dosis} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Responsable"
                name="responsable"
                value={form.responsable}
                onChange={handleChange}
                fullWidth
                error={!!errors.responsable}
                helperText={errors.responsable}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
                    {empleado.nombre_completo}
                  </MenuItem>
                ))}
                {form.responsable && !empleados.some((e) => e.nombre_completo === form.responsable) && (
                  <MenuItem value={form.responsable}>{form.responsable}</MenuItem>
                )}
              </TextField>
            </Grid>
          </Grid>

          {/* BOTONES */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      {/* TABLAS POR UBICACIÓN */}
      <TablasPorUbicacionGranja
        grupos={gruposUbicacion}
        renderTabla={renderTablaMedicamentos}
        buscar
        searchKeys={["numero_estanque", "diagnostico", "tratamiento", "responsable"]}
        placeholderBusqueda="Buscar estanque, diagnóstico o responsable"
        exportar={{
          columnas,
          titulo: "Bitácora de Medicamentos",
          subtitulo: "Registro de tratamientos, dosis y responsables",
          nombreArchivo: "Bitacora_Medicamentos",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function BitacoraMedicamentos() {
  return <BitacoraMedicamentosContent />;
}
