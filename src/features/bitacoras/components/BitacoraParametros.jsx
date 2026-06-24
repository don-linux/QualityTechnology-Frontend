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
    fecha: "",
    numero_estanque: "",
    oxigeno: "",
    temperatura: "",
    ph: "",
    amonio: "",
    nitritos: "",
    nitratos: "",
    responsable: "",
    usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion", "fecha", "numero_estanque", "oxigeno", "temperatura",
    "ph", "amonio", "nitritos", "nitratos", "responsable",
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
        fecha: "",
        numero_estanque: "",
        oxigeno: "",
        temperatura: "",
        ph: "",
        amonio: "",
        nitritos: "",
        nitratos: "",
        responsable: "",
        usuario_id: usuarioId,
      });
      cargarDatos();
    } catch {
      showSnackbar("Error al guardar registro.", "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      ubicacion: r.ubicacion || "",
      fecha: r.fecha?.split("T")[0] || "",
      numero_estanque: r.numero_estanque ?? "",
      oxigeno: r.oxigeno ?? "",
      temperatura: r.temperatura ?? "",
      ph: r.ph ?? "",
      amonio: r.amonio ?? "",
      nitritos: r.nitritos ?? "",
      nitratos: r.nitratos ?? "",
      responsable: r.responsable || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Estanque", value: (r) => r.numero_estanque },
    { header: "Oxígeno", value: (r) => r.oxigeno },
    { header: "Temperatura", value: (r) => r.temperatura },
    { header: "pH", value: (r) => r.ph },
    { header: "Amonio", value: (r) => r.amonio },
    { header: "Nitritos", value: (r) => r.nitritos },
    { header: "Nitratos", value: (r) => r.nitratos },
    { header: "Responsable", value: (r) => r.responsable },
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
                name="fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Estanque"
                name="numero_estanque"
                decimalScale={0}
                inputProps={{ min: 0, step: 1 }}
                value={form.numero_estanque}
                onChange={handleChange}
                fullWidth
                error={!!errors.numero_estanque}
                helperText={errors.numero_estanque}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Oxígeno"
                name="oxigeno"
                inputProps={{ min: 0, step: "any" }}
                value={form.oxigeno}
                onChange={handleChange}
                fullWidth
                error={!!errors.oxigeno}
                helperText={errors.oxigeno}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Temperatura"
                name="temperatura"
                inputProps={{ step: "any" }}
                value={form.temperatura}
                onChange={handleChange}
                fullWidth
                error={!!errors.temperatura}
                helperText={errors.temperatura}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="pH"
                name="ph"
                inputProps={{ min: 0, max: 14, step: "any" }}
                value={form.ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.ph}
                helperText={errors.ph}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Amonio"
                name="amonio"
                inputProps={{ min: 0, step: "any" }}
                value={form.amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.amonio}
                helperText={errors.amonio}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Nitritos"
                name="nitritos"
                inputProps={{ min: 0, step: "any" }}
                value={form.nitritos}
                onChange={handleChange}
                fullWidth
                error={!!errors.nitritos}
                helperText={errors.nitritos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Nitratos"
                name="nitratos"
                inputProps={{ min: 0, step: "any" }}
                value={form.nitratos}
                onChange={handleChange}
                fullWidth
                error={!!errors.nitratos}
                helperText={errors.nitratos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
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
        renderTabla={renderTablaParametros}
        buscar
        searchKeys={["numero_estanque", "responsable"]}
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
