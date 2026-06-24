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

const MAX_FC_DIAGNOSIS = 500;
const MAX_FC_TRATAMIENTO = 500;
const MAX_FC_DOSIS = 100;

function BitacoraMedicamentosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha_hora: "",
    fn_num_estanque: "",
    fc_diagnosis: "",
    fc_tratamiento: "",
    fc_dosis: "",
    fc_forma_aplicacion: "",
    fd_fecha_ultima_dosis: "",
    fc_responsable: "",
    ubicacion: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fd_fecha_hora", "fn_num_estanque", "fc_diagnosis", "fc_tratamiento",
    "fc_dosis", "fc_forma_aplicacion", "fd_fecha_ultima_dosis", "fc_responsable",
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
        fd_fecha_hora: "",
        fn_num_estanque: "",
        fc_diagnosis: "",
        fc_tratamiento: "",
        fc_dosis: "",
        fc_forma_aplicacion: "",
        fd_fecha_ultima_dosis: "",
        fc_responsable: "",
        ubicacion: form.ubicacion,
        fi_usuario_id: usuarioId,
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
    setEditId(r.fi_id);
    setForm({
      fd_fecha_hora: r.fd_fecha_hora?.split("T")[0],
      fn_num_estanque: r.fn_num_estanque ?? "",
      fc_diagnosis: r.fc_diagnosis || "",
      fc_tratamiento: r.fc_tratamiento || "",
      fc_dosis: r.fc_dosis || "",
      fc_forma_aplicacion: r.fc_forma_aplicacion || "",
      fd_fecha_ultima_dosis: r.fd_fecha_ultima_dosis?.split("T")[0],
      fc_responsable: r.fc_responsable || "",
      ubicacion: r.ubicacion || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha_hora) },
    { header: "Estanque", value: (r) => r.fn_num_estanque },
    { header: "Diagnóstico", value: (r) => r.fc_diagnosis, truncate: true, maxWidth: 160 },
    { header: "Tratamiento", value: (r) => r.fc_tratamiento, truncate: true, maxWidth: 160 },
    { header: "Dosis", value: (r) => r.fc_dosis, truncate: true, maxWidth: 160 },
    { header: "Forma Aplicación", value: (r) => r.fc_forma_aplicacion },
    { header: "Última Dosis", value: (r) => formatFecha(r.fd_fecha_ultima_dosis) },
    { header: "Responsable", value: (r) => r.fc_responsable, truncate: true, maxWidth: 160 },
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
              <TextField label="Fecha" type="date" name="fd_fecha_hora" InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_hora} onChange={handleChange} fullWidth error={!!errors.fd_fecha_hora} helperText={errors.fd_fecha_hora} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico label="Estanque" name="fn_num_estanque"
                decimalScale={0} inputProps={{ min: 0, step: 1 }}
                value={form.fn_num_estanque} onChange={handleChange} fullWidth error={!!errors.fn_num_estanque} helperText={errors.fn_num_estanque} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Diagnóstico"
                name="fc_diagnosis"
                value={form.fc_diagnosis}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_diagnosis}
                helperText={errors.fc_diagnosis || `${form.fc_diagnosis.length}/${MAX_FC_DIAGNOSIS}`}
                inputProps={{ maxLength: MAX_FC_DIAGNOSIS }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Tratamiento"
                name="fc_tratamiento"
                value={form.fc_tratamiento}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                error={!!errors.fc_tratamiento}
                helperText={errors.fc_tratamiento || `${form.fc_tratamiento.length}/${MAX_FC_TRATAMIENTO}`}
                inputProps={{ maxLength: MAX_FC_TRATAMIENTO }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Dosis"
                name="fc_dosis"
                value={form.fc_dosis}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_dosis}
                helperText={errors.fc_dosis || `${String(form.fc_dosis).length}/${MAX_FC_DOSIS}`}
                inputProps={{ maxLength: MAX_FC_DOSIS }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Forma Aplicación" name="fc_forma_aplicacion"
                value={form.fc_forma_aplicacion} onChange={handleChange} fullWidth error={!!errors.fc_forma_aplicacion} helperText={errors.fc_forma_aplicacion} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Última Dosis" type="date" name="fd_fecha_ultima_dosis"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_ultima_dosis} onChange={handleChange} fullWidth error={!!errors.fd_fecha_ultima_dosis} helperText={errors.fd_fecha_ultima_dosis} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_responsable}
                helperText={errors.fc_responsable}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_responsable && !empleados.some((e) => e.fc_nombre_completo === form.fc_responsable) && (
                  <MenuItem value={form.fc_responsable}>{form.fc_responsable}</MenuItem>
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
        searchKeys={["fn_num_estanque", "fc_diagnosis", "fc_tratamiento", "fc_responsable"]}
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
