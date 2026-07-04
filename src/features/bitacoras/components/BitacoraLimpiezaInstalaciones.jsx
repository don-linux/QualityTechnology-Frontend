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
  listLimpiezaInstalaciones,
  listEmpleadosLimpiezaInstalaciones,
  createLimpiezaInstalacion,
  updateLimpiezaInstalacion,
} from "../services/bitacorasService";
import { listInfraestructuraFisica } from "@features/inventarios/services/infraestructuraFisicaService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { formatFecha, toInputDate } from "@shared/utils/formatters";

const MAX_DESINFECTANTE = 500;
const MAX_OBSERVACIONES = 500;

const TIPOS_LIMPIEZA = [
  { value: "desinfeccion", label: "Desinfección" },
  { value: "recambio", label: "Recambio" },
];

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

const labelTipoLimpieza = (tipo) => {
  const found = TIPOS_LIMPIEZA.find((t) => t.value === tipo);
  return found?.label || tipo || "—";
};

export function formatDetalleLimpieza(row) {
  if (row.tipo_limpieza === "recambio") {
    const pct = row.porcentaje_recambio_agua;
    if (pct == null || pct === "") return "—";
    const num = Number(pct);
    const display = Number.isFinite(num) ? (Number.isInteger(num) ? num : num) : pct;
    return `Recambio de agua al ${display}%`;
  }
  return row.desinfectante_utilizado || "—";
}

const FORM_INICIAL = (ubicacion = "", usuarioId = "") => ({
  ubicacion,
  fecha: "",
  infraestructura_fisica_id: "",
  tipo_limpieza: "",
  porcentaje_recambio_agua: "",
  desinfectante_utilizado: "",
  encargado: "",
  observaciones: "",
  usuario_id: usuarioId,
});

function BitacoraLimpiezaInstalacionesContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const {
    ubicacionesGranja,
    defaultUbicacion,
    getLogo,
    getColor,
    getGroups,
    resolveFiltroUbicacion,
  } = useUbicacionesGranja();

  const [form, setForm] = useState(FORM_INICIAL("", usuarioId));
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [infraestructurasFisicas, setInfraestructurasFisicas] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  const esRecambio = form.tipo_limpieza === "recambio";

  const getRequiredFields = () => {
    const fields = [
      "ubicacion",
      "fecha",
      "infraestructura_fisica_id",
      "tipo_limpieza",
      "desinfectante_utilizado",
      "encargado",
    ];
    if (esRecambio) fields.push("porcentaje_recambio_agua");
    return fields;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "ubicacion") {
      setForm((prev) => ({
        ...prev,
        ubicacion: value,
        infraestructura_fisica_id: "",
      }));
      return;
    }

    if (name === "tipo_limpieza") {
      setForm((prev) => ({
        ...prev,
        tipo_limpieza: value,
        porcentaje_recambio_agua: value === "recambio" ? prev.porcentaje_recambio_agua : "",
      }));
      clearFieldError("porcentaje_recambio_agua");
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const cargarDatos = async () => {
    try {
      const res = await listLimpiezaInstalaciones();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosLimpiezaInstalaciones();
      setEmpleados(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  const cargarInfraestructuraFisica = async (ubicacionSeleccionNombre) => {
    if (!ubicacionSeleccionNombre) {
      setInfraestructurasFisicas([]);
      return;
    }
    const filtro = resolveFiltroUbicacion(ubicacionSeleccionNombre);
    if (!filtro.granja && !filtro.ubicacion_id) {
      setInfraestructurasFisicas([]);
      return;
    }
    try {
      const res = await listInfraestructuraFisica(filtro);
      setInfraestructurasFisicas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setInfraestructurasFisicas([]);
      showSnackbar("Error al cargar instalaciones.", "error");
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

  useEffect(() => {
    cargarInfraestructuraFisica(form.ubicacion);
  }, [form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, getRequiredFields())) return;

    const payload = {
      ubicacion: form.ubicacion,
      fecha: form.fecha,
      infraestructura_fisica_id: Number(form.infraestructura_fisica_id),
      tipo_limpieza: form.tipo_limpieza,
      desinfectante_utilizado: form.desinfectante_utilizado,
      encargado: form.encargado,
      observaciones: form.observaciones || null,
    };

    if (esRecambio) {
      payload.porcentaje_recambio_agua = Number(form.porcentaje_recambio_agua);
    }

    try {
      if (editId) {
        await updateLimpiezaInstalacion(editId, payload);
        showSnackbar("Registro actualizado.", "success");
      } else {
        await createLimpiezaInstalacion(payload);
        showSnackbar("Registro guardado.", "success");
      }

      setEditId(null);
      cerrarFormulario();
      setForm(FORM_INICIAL(form.ubicacion, usuarioId));
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
      fecha: toInputDate(row.fecha),
      infraestructura_fisica_id: row.infraestructura_fisica_id ? String(row.infraestructura_fisica_id) : "",
      tipo_limpieza: row.tipo_limpieza || "",
      porcentaje_recambio_agua:
        row.porcentaje_recambio_agua != null ? String(row.porcentaje_recambio_agua) : "",
      desinfectante_utilizado: row.desinfectante_utilizado || "",
      encargado: row.encargado || "",
      observaciones: row.observaciones || "",
      usuario_id: row.usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    {
      header: "Instalación",
      value: (r) => r.nombre_infraestructura_fisica || r.infraestructura_fisica_id || "—",
      truncate: true,
      maxWidth: 180,
    },
    { header: "Tipo", value: (r) => labelTipoLimpieza(r.tipo_limpieza) },
    { header: "Detalle", value: formatDetalleLimpieza, truncate: true, maxWidth: 220 },
    { header: "Encargado", value: (r) => r.encargado, truncate: true, maxWidth: 160 },
    { header: "Observaciones", value: (r) => r.observaciones, truncate: true, maxWidth: 180 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1100}
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
        Limpieza y desinfección de instalaciones
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
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
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Fecha"
                  type="date"
                  name="fecha"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.fecha}
                  helperText={errors.fecha}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Instalación"
                  name="infraestructura_fisica_id"
                  value={form.infraestructura_fisica_id}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.infraestructura_fisica_id}
                  helperText={errors.infraestructura_fisica_id}
                  SelectProps={{
                    renderValue: (selected) => {
                      const p = infraestructurasFisicas.find(
                        (x) => String(x.infraestructura_fisica_id ?? x.id) === String(selected),
                      );
                      if (!p) return selected ? `#${selected}` : "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado || "—"}`;
                    },
                  }}
                >
                  <MenuItem value="">Selecciona instalación</MenuItem>
                  {infraestructurasFisicas.map((p) => (
                    <MenuItem
                      key={p.infraestructura_fisica_id ?? p.id}
                      value={String(p.infraestructura_fisica_id ?? p.id)}
                    >
                      {p.nombre} · {tipoLabel(p.tipo)} · {p.estado || "—"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Tipo de limpieza"
                  name="tipo_limpieza"
                  value={form.tipo_limpieza}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.tipo_limpieza}
                  helperText={errors.tipo_limpieza}
                >
                  <MenuItem value="">Selecciona un tipo</MenuItem>
                  {TIPOS_LIMPIEZA.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {esRecambio && (
                <Grid size={{ xs: 12, md: 4 }}>
                  <CampoNumerico
                    label="Recambio de agua al ___ %"
                    name="porcentaje_recambio_agua"
                    value={form.porcentaje_recambio_agua}
                    onChange={handleChange}
                    fullWidth
                    decimalScale={2}
                    allowNegative={false}
                    isAllowed={(values) => {
                      const { floatValue } = values;
                      return floatValue == null || (floatValue >= 0 && floatValue <= 100);
                    }}
                    error={!!errors.porcentaje_recambio_agua}
                    helperText={errors.porcentaje_recambio_agua}
                  />
                </Grid>
              )}
              {form.tipo_limpieza && (
                <Grid size={{ xs: 12, md: esRecambio ? 4 : 8 }}>
                  <TextField
                    label="Desinfectante utilizado"
                    name="desinfectante_utilizado"
                    value={form.desinfectante_utilizado}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={!!errors.desinfectante_utilizado}
                    helperText={
                      errors.desinfectante_utilizado ||
                      `${form.desinfectante_utilizado.length}/${MAX_DESINFECTANTE}`
                    }
                    inputProps={{ maxLength: MAX_DESINFECTANTE }}
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Encargado"
                  name="encargado"
                  value={form.encargado}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.encargado}
                  helperText={errors.encargado}
                >
                  <MenuItem value="">Selecciona un empleado</MenuItem>
                  {empleados.map((empleado) => (
                    <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
                      {empleado.nombre_completo}
                    </MenuItem>
                  ))}
                  {form.encargado &&
                    !empleados.some((e) => e.nombre_completo === form.encargado) && (
                      <MenuItem value={form.encargado}>{form.encargado}</MenuItem>
                    )}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Observaciones"
                  name="observaciones"
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  value={form.observaciones}
                  onChange={handleChange}
                  helperText={`${form.observaciones.length}/${MAX_OBSERVACIONES}`}
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
        renderTabla={renderTabla}
        filtros={["busqueda"]}
        filtroConfig={{
          busqueda: {
            keys: [
              "nombre_infraestructura_fisica",
              "tipo_limpieza",
              "desinfectante_utilizado",
              "encargado",
              "observaciones",
            ],
            placeholder: "Buscar instalación, tipo, encargado u observaciones",
          },
        }}
        exportar={{
          columnas,
          titulo: "Registro de Limpieza y Desinfección de Instalaciones",
          subtitulo: "Limpieza y desinfección de instalaciones físicas",
          nombreArchivo: "Registro_Limpieza_Instalaciones",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function BitacoraLimpiezaInstalaciones() {
  return <BitacoraLimpiezaInstalacionesContent />;
}
