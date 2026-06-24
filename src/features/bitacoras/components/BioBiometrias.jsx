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
  const [piletas, setPiletas] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "pileta_id",
    "fecha",
    "peso_total_gramos",
    "organismos_muestreados",
    "encargado",
    "observaciones",
  ];

  const [form, setForm] = useState({
    ubicacion: "",
    pileta_id: "",
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

  const cargarPiletas = async (ubicacionSeleccionNombre) => {
    if (!ubicacionSeleccionNombre) {
      setPiletas([]);
      return;
    }
    const filtro = resolveFiltroUbicacion(ubicacionSeleccionNombre);
    if (!filtro.granja && !filtro.ubicacion_id) {
      setPiletas([]);
      return;
    }
    try {
      const res = await listPiletas(filtro);
      setPiletas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPiletas([]);
      showSnackbar("Error al cargar piletas", "error");
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
    cargarPiletas(form.ubicacion);
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
      setForm({ ...form, ubicacion: value, pileta_id: "" });
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
        pileta_id: Number(form.pileta_id),
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
      pileta_id: row.pileta_id != null ? String(row.pileta_id) : "",
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
      pileta_id: "",
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
    { header: "Pileta", value: (r) => r.nombre_pileta || "", fallback: "—" },
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

  const piletaSeleccionada =
    form.pileta_id !== ""
      ? piletas.find((p) => String(p.pileta_id) === String(form.pileta_id))
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
                  "Sede física (tabla ubicaciones): filtra piletas por `ubicacion_id` en el servidor."
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

            {/* PILETA */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Pileta"
                name="pileta_id"
                value={form.pileta_id}
                onChange={handleChange}
                fullWidth
                disabled={!form.ubicacion}
                error={!!errors.pileta_id}
                helperText={
                  errors.pileta_id ||
                  (form.ubicacion
                    ? "Define la etapa (alevinaje / reproductores / engorda) y vincula la observación a esa pileta."
                    : "Seleccione primero la ubicación")
                }
                slotProps={{
                  select: {
                    renderValue: (val) => {
                      const p = piletas.find((x) => String(x.pileta_id) === String(val));
                      if (!p) return "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado}`;
                    },
                  },
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {piletas.map((p) => (
                  <MenuItem key={p.pileta_id} value={String(p.pileta_id)}>
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

            {/* RESUMEN PILETA + ÚLTIMA OBSERVACIÓN */}
            {piletaSeleccionada && (
              <Grid size={12}>
                <Alert
                  severity={piletaSeleccionada.ultima_observacion ? "info" : "success"}
                  sx={{ "& .MuiAlert-message": { width: "100%" } }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ mb: piletaSeleccionada.ultima_observacion ? 1 : 0 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {piletaSeleccionada.nombre}
                    </Typography>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={`Etapa: ${tipoLabel(piletaSeleccionada.tipo)}`}
                    />
                    <Chip
                      size="small"
                      color={piletaSeleccionada.estado === "ocupada" ? "warning" : "default"}
                      variant="outlined"
                      label={`Estado: ${piletaSeleccionada.estado}`}
                    />
                    {piletaSeleccionada.granja && (
                      <Chip size="small" variant="outlined" label={piletaSeleccionada.granja} />
                    )}
                  </Stack>

                  {piletaSeleccionada.ultima_observacion ? (
                    <>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {piletaSeleccionada.ultima_observacion}
                      </Typography>
                      {(piletaSeleccionada.ultima_observacion_proceso ||
                        piletaSeleccionada.fecha_ultima_observacion) && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {[
                            piletaSeleccionada.ultima_observacion_proceso
                              ? `proceso: ${piletaSeleccionada.ultima_observacion_proceso}`
                              : null,
                            piletaSeleccionada.fecha_ultima_observacion
                              ? `fecha: ${formatFecha(piletaSeleccionada.fecha_ultima_observacion)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Sin observaciones previas para esta pileta.
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
                  `Se guarda como observación de la pileta (proceso "biometria"). ${form.observaciones.length}/${MAX_OBSERVACIONES}`
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
        buscar
        searchKeys={["nombre_pileta", "observacion_proceso", "encargado", "observaciones"]}
        placeholderBusqueda="Buscar pileta, encargado u observación"
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
