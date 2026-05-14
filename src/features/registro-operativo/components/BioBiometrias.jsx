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
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Alert from "@mui/material/Alert";
import {
  listBiometrias,
  listEmpleadosBiometrias,
  createBiometria,
  updateBiometria,
  removeBiometria,
} from "../services/biometriasService";
import { listPiletas } from "@features/inventarios/services/piletasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const MAX_FC_OBSERVACIONES = 500;

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

export default function BioBiometrias() {
  const auth = useAuth();
  const usuario_id = auth.usuarioId || "";
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getGroups, resolveFiltroUbicacion } =
    useUbicacionesGranja();

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "ubicacion",
    "pileta_id",
    "fd_fecha",
    "fn_peso_total_gramos",
    "fn_organismos_muestreados",
    "fc_encargado",
    "fc_observaciones",
  ];

  const [form, setForm] = useState({
    ubicacion: "",
    pileta_id: "",
    fd_fecha: "",
    fn_peso_total_gramos: "",
    fn_organismos_muestreados: "",
    fn_peso_promedio: "",
    fc_observaciones: "",
    fc_encargado: "",
    fi_usuario_id: usuario_id,
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

    if (name === "fn_peso_total_gramos" || name === "fn_organismos_muestreados") {
      const p = name === "fn_peso_total_gramos" ? value : form.fn_peso_total_gramos;
      const o = name === "fn_organismos_muestreados" ? value : form.fn_organismos_muestreados;
      const prom = p > 0 && o > 0 ? (parseFloat(p) / parseFloat(o)).toFixed(2) : "";

      setForm({ ...form, [name]: value, fn_peso_promedio: prom });
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
        fd_fecha: form.fd_fecha,
        fn_peso_total_gramos: form.fn_peso_total_gramos,
        fn_organismos_muestreados: form.fn_organismos_muestreados,
        fc_encargado: form.fc_encargado,
        fc_observaciones: form.fc_observaciones,
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
    setEditId(row.fi_id);

    setForm({
      ubicacion: row.ubicacion || "",
      pileta_id: row.pileta_id != null ? String(row.pileta_id) : "",
      fd_fecha: row.fd_fecha?.split("T")[0] || "",
      fn_peso_total_gramos: row.fn_peso_total_gramos ?? "",
      fn_organismos_muestreados: row.fn_organismos_muestreados ?? "",
      fn_peso_promedio: row.fn_peso_promedio ?? "",
      fc_observaciones: row.fc_observaciones ?? "",
      fc_encargado: row.fc_encargado ?? "",
      fi_usuario_id: usuario_id,
    });
  };

  /* -----------------------------
      ELIMINAR
  ------------------------------*/
  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    try {
      await removeBiometria(id);
      cargarDatos();
      showSnackbar("Registro eliminado", "success");
    } catch {
      showSnackbar("Error al eliminar biometría", "error");
    }
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
      fd_fecha: "",
      fn_peso_total_gramos: "",
      fn_organismos_muestreados: "",
      fn_peso_promedio: "",
      fc_observaciones: "",
      fc_encargado: "",
      fi_usuario_id: usuario_id,
    }));
  };

  const formatNum = (n) => {
    if (n === null || n === undefined || n === "") return "—";
    return Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const piletaSeleccionada =
    form.pileta_id !== ""
      ? piletas.find((p) => String(p.fi_pileta_id) === String(form.pileta_id))
      : null;

  /* -----------------------------
      UI
  ------------------------------*/
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Biometrías
      </Typography>

      {/* FORMULARIO */}
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
                      const p = piletas.find((x) => String(x.fi_pileta_id) === String(val));
                      if (!p) return "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado}`;
                    },
                  },
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {piletas.map((p) => (
                  <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
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
                name="fd_fecha"
                value={form.fd_fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
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
                    {piletaSeleccionada.fc_granja && (
                      <Chip size="small" variant="outlined" label={piletaSeleccionada.fc_granja} />
                    )}
                  </Stack>

                  {piletaSeleccionada.ultima_observacion ? (
                    <>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {piletaSeleccionada.ultima_observacion}
                      </Typography>
                      {(piletaSeleccionada.fc_ultima_observacion_proceso ||
                        piletaSeleccionada.fd_ultima_observacion) && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {[
                            piletaSeleccionada.fc_ultima_observacion_proceso
                              ? `proceso: ${piletaSeleccionada.fc_ultima_observacion_proceso}`
                              : null,
                            piletaSeleccionada.fd_ultima_observacion
                              ? `fecha: ${String(piletaSeleccionada.fd_ultima_observacion).split("T")[0]}`
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
              <TextField
                label="Peso Total (g)"
                name="fn_peso_total_gramos"
                type="number"
                value={form.fn_peso_total_gramos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_peso_total_gramos}
                helperText={errors.fn_peso_total_gramos}
              />
            </Grid>

            {/* ORGANISMOS */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Organismos Muestreados"
                name="fn_organismos_muestreados"
                type="number"
                value={form.fn_organismos_muestreados}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_organismos_muestreados}
                helperText={errors.fn_organismos_muestreados}
              />
            </Grid>

            {/* PESO PROMEDIO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Peso Promedio (g)"
                name="fn_peso_promedio"
                type="number"
                value={form.fn_peso_promedio}
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
                name="fc_encargado"
                value={form.fc_encargado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado}
                helperText={errors.fc_encargado}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_encargado &&
                  !empleados.some((e) => e.fc_nombre_completo === form.fc_encargado) && (
                    <MenuItem value={form.fc_encargado}>{form.fc_encargado}</MenuItem>
                  )}
              </TextField>
            </Grid>

            {/* OBSERVACIONES */}
            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_observaciones}
                helperText={
                  errors.fc_observaciones ||
                  `Se guarda como observación de la pileta (proceso "biometria"). ${form.fc_observaciones.length}/${MAX_FC_OBSERVACIONES}`
                }
                inputProps={{ maxLength: MAX_FC_OBSERVACIONES }}
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

      {/* TABLAS POR UBICACION */}
      {getGroups(data).map(({ value, label, rows }) => (
        <Accordion key={value} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">
              {label} ({rows.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper sx={{ width: "100%" }}>
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1120 }}>
                  <TableHead sx={{ background: "#E8F5E9" }}>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Pileta</TableCell>
                      <TableCell>Proceso (obs.)</TableCell>
                      <TableCell>Peso Total</TableCell>
                      <TableCell>Organismos</TableCell>
                      <TableCell>Peso Promedio</TableCell>
                      <TableCell>Encargado</TableCell>
                      <TableCell>Observaciones</TableCell>
                      <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.fi_id}>
                        <TableCell>{row.fd_fecha?.split("T")[0]}</TableCell>
                        <TableCell>{row.nombre_pileta || "—"}</TableCell>
                        <TableCell>{row.fc_observacion_proceso || "—"}</TableCell>
                        <TableCell>{formatNum(row.fn_peso_total_gramos)}</TableCell>
                        <TableCell>{row.fn_organismos_muestreados ?? "—"}</TableCell>
                        <TableCell>{formatNum(row.fn_peso_promedio)}</TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          <span title={row.fc_encargado}>{truncar(row.fc_encargado)}</span>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <span title={row.fc_observaciones || ""}>
                            {row.fc_observaciones ? truncar(row.fc_observaciones) : "—"}
                          </span>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                        >
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 1,
                              flexWrap: "nowrap",
                            }}
                          >
                            <Button
                              variant="contained"
                              size="small"
                              color="warning"
                              onClick={() => editar(row)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              color="error"
                              onClick={() => eliminar(row.fi_id)}
                            >
                              Eliminar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}
