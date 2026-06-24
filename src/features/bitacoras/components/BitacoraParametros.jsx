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
  listParametros,
  listEmpleadosParametros,
  createParametro,
  updateParametro,
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

function BitacoraParametrosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    fd_fecha: "",
    fn_num_estanque: "",
    fn_oxigeno: "",
    fn_temperatura: "",
    fn_ph: "",
    fn_amonio: "",
    fn_nitritos: "",
    fn_nitratos: "",
    fc_responsable: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion", "fd_fecha", "fn_num_estanque", "fn_oxigeno", "fn_temperatura",
    "fn_ph", "fn_amonio", "fn_nitritos", "fn_nitratos", "fc_responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listParametros();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosParametros();
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

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateParametro(editId, form);
      else await createParametro(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        ubicacion: form.ubicacion,
        fd_fecha: "",
        fn_num_estanque: "",
        fn_oxigeno: "",
        fn_temperatura: "",
        fn_ph: "",
        fn_amonio: "",
        fn_nitritos: "",
        fn_nitratos: "",
        fc_responsable: "",
        fi_usuario_id: usuarioId,
      });
      cargarDatos();
    } catch {
      showSnackbar("Error al guardar registro.", "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      ubicacion: r.ubicacion || "",
      fd_fecha: r.fd_fecha?.split("T")[0] || "",
      fn_num_estanque: r.fn_num_estanque ?? "",
      fn_oxigeno: r.fn_oxigeno ?? "",
      fn_temperatura: r.fn_temperatura ?? "",
      fn_ph: r.fn_ph ?? "",
      fn_amonio: r.fn_amonio ?? "",
      fn_nitritos: r.fn_nitritos ?? "",
      fn_nitratos: r.fn_nitratos ?? "",
      fc_responsable: r.fc_responsable || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha) },
    { header: "Estanque", value: (r) => r.fn_num_estanque },
    { header: "Oxígeno", value: (r) => r.fn_oxigeno },
    { header: "Temperatura", value: (r) => r.fn_temperatura },
    { header: "pH", value: (r) => r.fn_ph },
    { header: "Amonio", value: (r) => r.fn_amonio },
    { header: "Nitritos", value: (r) => r.fn_nitritos },
    { header: "Nitratos", value: (r) => r.fn_nitratos },
    { header: "Responsable", value: (r) => r.fc_responsable },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaParametros = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1100}
      acciones={(r) => (
        <Button size="small" color="warning" variant="contained" onClick={() => editar(r)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Parámetros Fisico-Quimicos
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
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Estanque"
                name="fn_num_estanque"
                decimalScale={0}
                inputProps={{ min: 0, step: 1 }}
                value={form.fn_num_estanque}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_estanque}
                helperText={errors.fn_num_estanque}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Oxígeno"
                name="fn_oxigeno"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_oxigeno}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_oxigeno}
                helperText={errors.fn_oxigeno}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Temperatura"
                name="fn_temperatura"
                inputProps={{ step: "any" }}
                value={form.fn_temperatura}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_temperatura}
                helperText={errors.fn_temperatura}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="pH"
                name="fn_ph"
                inputProps={{ min: 0, max: 14, step: "any" }}
                value={form.fn_ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_ph}
                helperText={errors.fn_ph}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Amonio"
                name="fn_amonio"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_amonio}
                helperText={errors.fn_amonio}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Nitritos"
                name="fn_nitritos"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_nitritos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_nitritos}
                helperText={errors.fn_nitritos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Nitratos"
                name="fn_nitratos"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_nitratos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_nitratos}
                helperText={errors.fn_nitratos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
        renderTabla={renderTablaParametros}
        buscar
        searchKeys={["fn_num_estanque", "fc_responsable"]}
        placeholderBusqueda="Buscar estanque o responsable"
        exportar={{
          columnas,
          titulo: "Bitácora de Parámetros",
          subtitulo: "Registro de oxígeno, pH, temperatura y otros indicadores",
          nombreArchivo: "Bitacora_Parametros",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function BitacoraParametros() {
  return <BitacoraParametrosContent />;
}
