import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import { formatFecha } from "@shared/utils/formatters";
import Alert from "@mui/material/Alert";
import {
  listBiometrias,
  listEmpleadosBiometrias,
  createBiometria,
  updateBiometria,
} from "../services/biometriasService";
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

const MAX_OBSERVACIONES = 500;

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

export default function BioBiometrias() {
  const auth = useAuth();
  const usuario_id = auth.usuarioId || "";
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getGroups, getLogo, getColor, resolveFiltroUbicacion } =
    useUbicacionesGranja();

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [infraestructurasFisicas, setInfraestructurasFisicas] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "infraestructura_fisica_id",
    "fecha",
    "peso_total_gramos",
    "organismos_muestreados",
    "encargado",
    "observaciones",
  ];

  const [form, setForm] = useState({
    ubicacion: "",
    infraestructura_fisica_id: "",
    fecha: "",
    peso_total_gramos: "",
    organismos_muestreados: "",
    peso_promedio: "",
    observaciones: "",
    encargado: "",
    usuario_id: usuario_id,
  });

  /* -----------------------------
      Cargar datos iniciales
  ------------------------------*/
  const cargarDatos = async () => {
    try {
      const res = await listBiometrias();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackbar("Error al cargar biometrías", "error");
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
      showSnackbar("Error al cargar infraestructurasFisicas", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosBiometrias();
      setEmpleados(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackbar("Error al cargar empleados", "error");
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

  /* -----------------------------
      HANDLE CHANGE
  ------------------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "peso_total_gramos" || name === "organismos_muestreados") {
      const p = name === "peso_total_gramos" ? value : form.peso_total_gramos;
      const o = name === "organismos_muestreados" ? value : form.organismos_muestreados;
      const prom = p > 0 && o > 0 ? (parseFloat(p) / parseFloat(o)).toFixed(2) : "";

      setForm({ ...form, [name]: value, peso_promedio: prom });
      return;
    }

    if (name === "ubicacion") {
      setForm({ ...form, ubicacion: value, infraestructura_fisica_id: "" });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  /* -----------------------------
      GUARDAR / ACTUALIZAR
  ------------------------------*/
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      const body = {
        fecha: form.fecha,
        peso_total_gramos: form.peso_total_gramos,
        organismos_muestreados: form.organismos_muestreados,
        encargado: form.encargado,
        observaciones: form.observaciones,
        infraestructura_fisica_id: Number(form.infraestructura_fisica_id),
      };

      if (editId) {
        await updateBiometria(editId, body);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createBiometria(body);
        showSnackbar("Registro creado", "success");
      }

      limpiar();
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error guardando biometría";
      showSnackbar(msg, "error");
    }
  };

  /* -----------------------------
      EDITAR
  ------------------------------*/
  const editar = (row) => {
    clearErrors();
    setEditId(row.id);

    setForm({
      ubicacion: row.ubicacion || "",
      infraestructura_fisica_id: row.infraestructura_fisica_id != null ? String(row.infraestructura_fisica_id) : "",
      fecha: row.fecha?.split("T")[0] || "",
      peso_total_gramos: row.peso_total_gramos ?? "",
      organismos_muestreados: row.organismos_muestreados ?? "",
      peso_promedio: row.peso_promedio ?? "",
      observaciones: row.observaciones ?? "",
      encargado: row.encargado ?? "",
      usuario_id: usuario_id,
    });
    abrirFormulario();
  };

  /* -----------------------------
      LIMPIAR FORMULARIO
  ------------------------------*/
  const limpiar = () => {
    clearErrors();
    setEditId(null);
    setForm((prev) => ({
      ubicacion: prev.ubicacion,
      infraestructura_fisica_id: "",
      fecha: "",
      peso_total_gramos: "",
      organismos_muestreados: "",
      peso_promedio: "",
      observaciones: "",
      encargado: "",
      usuario_id: usuario_id,
    }));
    cerrarFormulario();
  };

  const formatNum = (n) => {
    if (n === null || n === undefined || n === "") return "—";
    return Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Infraestructura física", value: (r) => r.nombre_infraestructura_fisica || "", fallback: "—" },
    { header: "Proceso (obs.)", value: (r) => r.observacion_proceso || "", fallback: "—" },
    { header: "Peso Total", value: (r) => formatNum(r.peso_total_gramos) },
    { header: "Organismos", value: (r) => r.organismos_muestreados ?? "", fallback: "—" },
    { header: "Peso Promedio", value: (r) => formatNum(r.peso_promedio) },
    { header: "Encargado", value: (r) => r.encargado || "", truncate: true, maxWidth: 160, fallback: "—" },
    { header: "Observaciones", value: (r) => r.observaciones || "", truncate: true, maxWidth: 200, fallback: "—" },
  ];

  const renderTablaBiometrias = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1120}
      acciones={(row) => (
        <Button variant="contained" size="small" color="warning" onClick={() => editar(row)}>
          Editar
        </Button>
      )}
    />
  );

  const infraestructuraFisicaSeleccionada =
    form.infraestructura_fisica_id !== ""
      ? infraestructurasFisicas.find((p) => String(p.infraestructura_fisica_id) === String(form.infraestructura_fisica_id))
      : null;

  /* -----------------------------
      UI
  ------------------------------*/
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Biometrías
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* UBICACION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.ubicacion}
                helperText={
                  errors.ubicacion ||
                  "Sede física (tabla ubicaciones): filtra infraestructurasFisicas por `ubicacion_id` en el servidor."
                }
              >
                <MenuItem value="">Seleccione</MenuItem>
                {ubicacionesGranja.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* INFRAESTRUCTURA FÍSICA */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Infraestructura física"
                name="infraestructura_fisica_id"
                value={form.infraestructura_fisica_id}
                onChange={handleChange}
                fullWidth
                disabled={!form.ubicacion}
                error={!!errors.infraestructura_fisica_id}
                helperText={
                  errors.infraestructura_fisica_id ||
                  (form.ubicacion
                    ? "Define la etapa (alevinaje / reproductores / engorda) y vincula la observación a esa infraestructura física."
                    : "Seleccione primero la ubicación")
                }
                slotProps={{
                  select: {
                    renderValue: (val) => {
                      const p = infraestructurasFisicas.find((x) => String(x.infraestructura_fisica_id) === String(val));
                      if (!p) return "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado}`;
                    },
                  },
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {infraestructurasFisicas.map((p) => (
                  <MenuItem key={p.infraestructura_fisica_id} value={String(p.infraestructura_fisica_id)}>
                    {p.nombre} · {tipoLabel(p.tipo)} · {p.estado}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* FECHA */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Fecha"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>

            {/* RESUMEN INFRAESTRUCTURA FÍSICA + ÚLTIMA OBSERVACIÓN */}
            {infraestructuraFisicaSeleccionada && (
              <Grid size={12}>
                <Alert
                  severity={infraestructuraFisicaSeleccionada.ultima_observacion ? "info" : "success"}
                  sx={{ "& .MuiAlert-message": { width: "100%" } }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ mb: infraestructuraFisicaSeleccionada.ultima_observacion ? 1 : 0 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {infraestructuraFisicaSeleccionada.nombre}
                    </Typography>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`Etapa: ${tipoLabel(infraestructuraFisicaSeleccionada.tipo)}`}
                    />
                    <Chip
                      size="small"
                      color={infraestructuraFisicaSeleccionada.estado === "ocupada" ? "warning" : "default"}
                      variant="outlined"
                      label={`Estado: ${infraestructuraFisicaSeleccionada.estado}`}
                    />
                    {infraestructuraFisicaSeleccionada.granja && (
                      <Chip size="small" variant="outlined" label={infraestructuraFisicaSeleccionada.granja} />
                    )}
                  </Stack>

                  {infraestructuraFisicaSeleccionada.ultima_observacion ? (
                    <>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {infraestructuraFisicaSeleccionada.ultima_observacion}
                      </Typography>
                      {(infraestructuraFisicaSeleccionada.ultima_observacion_proceso ||
                        infraestructuraFisicaSeleccionada.fecha_ultima_observacion) && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {[
                            infraestructuraFisicaSeleccionada.ultima_observacion_proceso
                              ? `proceso: ${infraestructuraFisicaSeleccionada.ultima_observacion_proceso}`
                              : null,
                            infraestructuraFisicaSeleccionada.fecha_ultima_observacion
                              ? `fecha: ${formatFecha(infraestructuraFisicaSeleccionada.fecha_ultima_observacion)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin observaciones previas para esta infraestructura física.
                    </Typography>
                  )}
                </Alert>
              </Grid>
            )}

            {/* PESO TOTAL */}
            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Peso Total (g)"
                name="peso_total_gramos"
                value={form.peso_total_gramos}
                onChange={handleChange}
                fullWidth
                error={!!errors.peso_total_gramos}
                helperText={errors.peso_total_gramos}
              />
            </Grid>

            {/* ORGANISMOS */}
            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Organismos Muestreados"
                name="organismos_muestreados"
                decimalScale={0}
                value={form.organismos_muestreados}
                onChange={handleChange}
                fullWidth
                error={!!errors.organismos_muestreados}
                helperText={errors.organismos_muestreados}
              />
            </Grid>

            {/* PESO PROMEDIO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Peso Promedio (g)"
                name="peso_promedio"
                value={form.peso_promedio}
                slotProps={{ input: { readOnly: true } }}
                fullWidth
                helperText="Calculado automáticamente"
              />
            </Grid>

            {/* ENCARGADO */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                select
                label="Encargado"
                name="encargado"
                value={form.encargado}
                onChange={handleChange}
                fullWidth
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

            {/* OBSERVACIONES */}
            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.observaciones}
                helperText={
                  errors.observaciones ||
                  `Se guarda como observación de la infraestructura física (proceso "biometria"). ${form.observaciones.length}/${MAX_OBSERVACIONES}`
                }
                inputProps={{ maxLength: MAX_OBSERVACIONES }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>

            <Button variant="contained" color="error" sx={{ ml: 2 }} onClick={limpiar}>
              {editId ? "Cancelar" : "Limpiar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      {/* TABLAS POR UBICACION */}
      <TablasPorUbicacionGranja
        grupos={getGroups(data)}
        renderTabla={renderTablaBiometrias}
        filtros={["busqueda"]}
        filtroConfig={{
          busqueda: {
            keys: ["nombre_infraestructura_fisica", "observacion_proceso", "encargado", "observaciones"],
            placeholder: "Buscar infraestructura física, encargado u observación",
          },
        }}
        exportar={{
          columnas,
          titulo: "Bitácora de Biometrías",
          subtitulo: "Pesos, organismos muestreados y observaciones",
          nombreArchivo: "Bitacora_Biometrias",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}
