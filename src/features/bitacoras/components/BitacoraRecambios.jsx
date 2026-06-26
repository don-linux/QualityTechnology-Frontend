import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { formatFecha } from "@shared/utils/formatters";
import {
  listRecambios,
  listEmpleadosRecambios,
  createRecambio,
  updateRecambio,
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

function BitacoraRecambiosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    mes_periodo: "",
    infraestructura_fisica_id: "",
    fecha_1: "",
    tipo_1: "",
    fecha_2: "",
    tipo_2: "",
    fecha_3: "",
    tipo_3: "",
    fecha_4: "",
    tipo_4: "",
    fecha_5: "",
    tipo_5: "",
    fecha_6: "",
    tipo_6: "",
    responsable: "",
    usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "mes_periodo", "infraestructura_fisica_id",
    "fecha_1", "tipo_1", "fecha_2", "tipo_2",
    "fecha_3", "tipo_3", "fecha_4", "tipo_4",
    "fecha_5", "tipo_5", "fecha_6", "tipo_6",
    "responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listRecambios();
      setData(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosRecambios();
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
        await updateRecambio(editId, form);
      else await createRecambio(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        ubicacion: form.ubicacion,
        mes_periodo: "",
        infraestructura_fisica_id: "",
        fecha_1: "",
        tipo_1: "",
        fecha_2: "",
        tipo_2: "",
        fecha_3: "",
        tipo_3: "",
        fecha_4: "",
        tipo_4: "",
        fecha_5: "",
        tipo_5: "",
        fecha_6: "",
        tipo_6: "",
        responsable: "",
        usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      ubicacion: r.ubicacion || "",
      mes_periodo: r.mes_periodo || "",
      infraestructura_fisica_id: r.infraestructura_fisica_id || "",
      fecha_1: r.fecha_1?.split("T")[0],
      tipo_1: r.tipo_1 || "",
      fecha_2: r.fecha_2?.split("T")[0],
      tipo_2: r.tipo_2 || "",
      fecha_3: r.fecha_3?.split("T")[0],
      tipo_3: r.tipo_3 || "",
      fecha_4: r.fecha_4?.split("T")[0],
      tipo_4: r.tipo_4 || "",
      fecha_5: r.fecha_5?.split("T")[0],
      tipo_5: r.tipo_5 || "",
      fecha_6: r.fecha_6?.split("T")[0],
      tipo_6: r.tipo_6 || "",
      responsable: r.responsable || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnasExport = [
    { header: "Mes", value: (r) => r.mes_periodo || "" },
    { header: "No. Instalación", value: (r) => r.infraestructura_fisica_id || "" },
    { header: "Fecha 1", value: (r) => formatFecha(r.fecha_1, "") },
    { header: "Tipo 1", value: (r) => r.tipo_1 || "" },
    { header: "Fecha 2", value: (r) => formatFecha(r.fecha_2, "") },
    { header: "Tipo 2", value: (r) => r.tipo_2 || "" },
    { header: "Fecha 3", value: (r) => formatFecha(r.fecha_3, "") },
    { header: "Tipo 3", value: (r) => r.tipo_3 || "" },
    { header: "Fecha 4", value: (r) => formatFecha(r.fecha_4, "") },
    { header: "Tipo 4", value: (r) => r.tipo_4 || "" },
    { header: "Fecha 5", value: (r) => formatFecha(r.fecha_5, "") },
    { header: "Tipo 5", value: (r) => r.tipo_5 || "" },
    { header: "Fecha 6", value: (r) => formatFecha(r.fecha_6, "") },
    { header: "Tipo 6", value: (r) => r.tipo_6 || "" },
    { header: "Responsable", value: (r) => r.responsable || "" },
  ];

  const columnas = [
    { header: "Mes", value: (r) => r.mes_periodo },
    { header: "Instalación", value: (r) => r.infraestructura_fisica_id },
    {
      header: "Fechas y Tipos",
      value: (r) =>
        [1, 2, 3, 4, 5, 6]
          .map((n) =>
            r[`fecha_${n}`] ? `${formatFecha(r[`fecha_${n}`])} (${r[`tipo_${n}`]})` : null,
          )
          .filter(Boolean)
          .join(", "),
    },
    { header: "Responsable", value: (r) => r.responsable },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaRecambios = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={920}
      acciones={(r) => (
        <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Recambios de Trampas
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
                label="Mes"
                type="month"
                name="mes_periodo"
                InputLabelProps={{ shrink: true }}
                value={form.mes_periodo}
                onChange={handleChange}
                fullWidth
                error={!!errors.mes_periodo}
                helperText={errors.mes_periodo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="No. Instalación"
                name="infraestructura_fisica_id"
                decimalScale={0}
                value={form.infraestructura_fisica_id}
                onChange={handleChange}
                fullWidth
                error={!!errors.infraestructura_fisica_id}
                helperText={errors.infraestructura_fisica_id}
              />
            </Grid>

            {[1, 2, 3, 4, 5, 6].map((n) => (
              <React.Fragment key={n}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Fecha ${n}`}
                    type="date"
                    name={`fecha_${n}`}
                    InputLabelProps={{ shrink: true }}
                    value={form[`fecha_${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`fecha_${n}`]}
                    helperText={errors[`fecha_${n}`]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Tipo ${n}`}
                    name={`tipo_${n}`}
                    value={form[`tipo_${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`tipo_${n}`]}
                    helperText={errors[`tipo_${n}`]}
                  />
                </Grid>
              </React.Fragment>
            ))}

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
        renderTabla={renderTablaRecambios}
        buscar
        searchKeys={["mes_periodo", "infraestructura_fisica_id", "responsable"]}
        placeholderBusqueda="Buscar mes, instalación o responsable"
        exportar={{
          columnas: columnasExport,
          titulo: "Registro de Recambios",
          subtitulo: "Recambios de agua por instalación",
          nombreArchivo: "Registro_Recambios",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function BitacoraRecambios() {
  return <BitacoraRecambiosContent />;
}
