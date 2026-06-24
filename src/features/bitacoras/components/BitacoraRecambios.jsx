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
    fc_mes: "",
    fn_num_instalacion: "",
    fd_fecha1: "",
    fc_tipo1: "",
    fd_fecha2: "",
    fc_tipo2: "",
    fd_fecha3: "",
    fc_tipo3: "",
    fd_fecha4: "",
    fc_tipo4: "",
    fd_fecha5: "",
    fc_tipo5: "",
    fd_fecha6: "",
    fc_tipo6: "",
    fc_responsable: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fc_mes", "fn_num_instalacion",
    "fd_fecha1", "fc_tipo1", "fd_fecha2", "fc_tipo2",
    "fd_fecha3", "fc_tipo3", "fd_fecha4", "fc_tipo4",
    "fd_fecha5", "fc_tipo5", "fd_fecha6", "fc_tipo6",
    "fc_responsable",
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
        fc_mes: "",
        fn_num_instalacion: "",
        fd_fecha1: "",
        fc_tipo1: "",
        fd_fecha2: "",
        fc_tipo2: "",
        fd_fecha3: "",
        fc_tipo3: "",
        fd_fecha4: "",
        fc_tipo4: "",
        fd_fecha5: "",
        fc_tipo5: "",
        fd_fecha6: "",
        fc_tipo6: "",
        fc_responsable: "",
        fi_usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      ubicacion: r.ubicacion || "",
      fc_mes: r.fc_mes || "",
      fn_num_instalacion: r.fn_num_instalacion || "",
      fd_fecha1: r.fd_fecha1?.split("T")[0],
      fc_tipo1: r.fc_tipo1 || "",
      fd_fecha2: r.fd_fecha2?.split("T")[0],
      fc_tipo2: r.fc_tipo2 || "",
      fd_fecha3: r.fd_fecha3?.split("T")[0],
      fc_tipo3: r.fc_tipo3 || "",
      fd_fecha4: r.fd_fecha4?.split("T")[0],
      fc_tipo4: r.fc_tipo4 || "",
      fd_fecha5: r.fd_fecha5?.split("T")[0],
      fc_tipo5: r.fc_tipo5 || "",
      fd_fecha6: r.fd_fecha6?.split("T")[0],
      fc_tipo6: r.fc_tipo6 || "",
      fc_responsable: r.fc_responsable || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnasExport = [
    { header: "Mes", value: (r) => r.fc_mes || "" },
    { header: "No. Instalación", value: (r) => r.fn_num_instalacion || "" },
    { header: "Fecha 1", value: (r) => formatFecha(r.fd_fecha1, "") },
    { header: "Tipo 1", value: (r) => r.fc_tipo1 || "" },
    { header: "Fecha 2", value: (r) => formatFecha(r.fd_fecha2, "") },
    { header: "Tipo 2", value: (r) => r.fc_tipo2 || "" },
    { header: "Fecha 3", value: (r) => formatFecha(r.fd_fecha3, "") },
    { header: "Tipo 3", value: (r) => r.fc_tipo3 || "" },
    { header: "Fecha 4", value: (r) => formatFecha(r.fd_fecha4, "") },
    { header: "Tipo 4", value: (r) => r.fc_tipo4 || "" },
    { header: "Fecha 5", value: (r) => formatFecha(r.fd_fecha5, "") },
    { header: "Tipo 5", value: (r) => r.fc_tipo5 || "" },
    { header: "Fecha 6", value: (r) => formatFecha(r.fd_fecha6, "") },
    { header: "Tipo 6", value: (r) => r.fc_tipo6 || "" },
    { header: "Responsable", value: (r) => r.fc_responsable || "" },
  ];

  const columnas = [
    { header: "Mes", value: (r) => r.fc_mes },
    { header: "Instalación", value: (r) => r.fn_num_instalacion },
    {
      header: "Fechas y Tipos",
      value: (r) =>
        [1, 2, 3, 4, 5, 6]
          .map((n) =>
            r[`fd_fecha${n}`] ? `${formatFecha(r[`fd_fecha${n}`])} (${r[`fc_tipo${n}`]})` : null,
          )
          .filter(Boolean)
          .join(", "),
    },
    { header: "Responsable", value: (r) => r.fc_responsable },
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
                name="fc_mes"
                InputLabelProps={{ shrink: true }}
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_mes}
                helperText={errors.fc_mes}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="No. Instalación"
                name="fn_num_instalacion"
                decimalScale={0}
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>

            {[1, 2, 3, 4, 5, 6].map((n) => (
              <React.Fragment key={n}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Fecha ${n}`}
                    type="date"
                    name={`fd_fecha${n}`}
                    InputLabelProps={{ shrink: true }}
                    value={form[`fd_fecha${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`fd_fecha${n}`]}
                    helperText={errors[`fd_fecha${n}`]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Tipo ${n}`}
                    name={`fc_tipo${n}`}
                    value={form[`fc_tipo${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`fc_tipo${n}`]}
                    helperText={errors[`fc_tipo${n}`]}
                  />
                </Grid>
              </React.Fragment>
            ))}

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
        searchKeys={["fc_mes", "fn_num_instalacion", "fc_responsable"]}
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
