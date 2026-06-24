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
  listControlLimpieza,
  listEmpleadosControlLimpieza,
  createControlLimpieza,
  updateControlLimpieza,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { formatFecha } from "@shared/utils/formatters";

const MAX_FC_OBSERVACIONES = 500;

const TIPOS_INSTALACION = [
  "Baño de Hombres",
  "Baño de Mujeres",
  "Regadera",
];

const getTipoInstalacion = (row) => {
  return row.fc_tipo_instalacion || "";
};

function ControlLimpiezaContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } =
    useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_tipo_instalacion: "",
    fc_realizo: "",
    fc_observaciones: "",
    fi_usuario_id: usuarioId,
    ubicacion: "",
  });

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "fd_fecha", "fc_tipo_instalacion",
    "fc_realizo", "fc_observaciones", "ubicacion",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listControlLimpieza();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosControlLimpieza();
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
      if (editId) {
        await updateControlLimpieza(editId, form);
        showSnackbar("Registro actualizado.", "success");
      } else {
        await createControlLimpieza(form);
        showSnackbar("Registro guardado.", "success");
      }

      setForm({
        fd_fecha: "",
        fc_tipo_instalacion: "",
        fc_realizo: "",
        fc_observaciones: "",
        fi_usuario_id: usuarioId,
        ubicacion: form.ubicacion,
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
      fd_fecha: row.fd_fecha?.split("T")[0] || "",
      fc_tipo_instalacion: getTipoInstalacion(row),
      fc_realizo: row.fc_realizo,
      fc_observaciones: row.fc_observaciones,
      fi_usuario_id: row.fi_usuario_id,
      ubicacion: row.ubicacion || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha) },
    { header: "Tipo de Instalación", value: (r) => getTipoInstalacion(r), truncate: true, maxWidth: 160 },
    { header: "Realizó", value: (r) => r.fc_realizo, truncate: true, maxWidth: 160 },
    { header: "Observaciones", value: (r) => r.fc_observaciones, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaControlLimpieza = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={960}
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
        Control de Limpieza
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
              <TextField
                select
                label="Tipo de Instalación"
                name="fc_tipo_instalacion"
                value={form.fc_tipo_instalacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_tipo_instalacion}
                helperText={errors.fc_tipo_instalacion}
              >
                <MenuItem value="">Selecciona un tipo</MenuItem>
                {TIPOS_INSTALACION.map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Realizó"
                name="fc_realizo"
                value={form.fc_realizo}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_realizo}
                helperText={errors.fc_realizo}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_realizo && !empleados.some((e) => e.fc_nombre_completo === form.fc_realizo) && (
                  <MenuItem value={form.fc_realizo}>{form.fc_realizo}</MenuItem>
                )}
              </TextField>
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
        renderTabla={renderTablaControlLimpieza}
        buscar
        searchKeys={["fc_tipo_instalacion", "fc_realizo", "fc_observaciones"]}
        placeholderBusqueda="Buscar tipo, responsable u observaciones"
        exportar={{
          columnas,
          titulo: "Control de Limpieza",
          subtitulo: "Control de limpieza y mantenimiento de baños y regaderas",
          nombreArchivo: "Control_Limpieza",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function ControlLimpieza() {
  return <ControlLimpiezaContent />;
}
