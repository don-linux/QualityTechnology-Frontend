import React, { useEffect, useState, useCallback } from "react";
import {
  listByGranja as listReproductoresByGranja,
  getMovimientos as getReproductoresMovimientos,
  createReproductor,
  updateReproductor,
  removeReproductor,
} from "../services/reproductoresService";
import { listByGranja as listInstalacionesByGranja } from "../services/instalacionesService";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;

const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const REPRODUCTOR_BASE_REQUIRED = [
  "fi_instalacion_id",
  "fn_machos",
  "fn_hembras",
  "fn_talla",
  "fc_linea",
  "fc_familia",
  "fc_observacion",
  "fd_fecha_siembra",
  "fd_fecha_biometria",
];

function getReproductorRequiredFields(origenTipo) {
  return origenTipo === "Interno"
    ? [...REPRODUCTOR_BASE_REQUIRED, "origen_instalacion"]
    : [...REPRODUCTOR_BASE_REQUIRED, "origen_texto"];
}

const CirculoNumero = ({ color, value }) => (
  <Box
    component="span"
    sx={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      bgcolor: color,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: 14,
      m: "0 auto",
    }}
  >
    {value}
  </Box>
);

export default function Reproductores() {
  return <ReproductoresContent />;
}

function ReproductoresContent() {
  const showSnackbar = useSnackbar();
  const usuario_id = localStorage.getItem("usuario_id");
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion } = useUbicacionesGranja();

  const [granjaActiva, setGranjaActiva] = useState("");
  const [reproductores, setReproductores] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [rastreos, setRastreos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalInstalaciones, setTotalInstalaciones] = useState(0);
  const [totalOrganismos, setTotalOrganismos] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [origenTipo, setOrigenTipo] = useState("Interno");

  const [form, setForm] = useState({
    origen_instalacion: "",
    origen_texto: "",
    fi_instalacion_id: "",
    fn_machos: "",
    fn_hembras: "",
    fn_cantidad: "",
    fn_talla: "",
    fc_linea: "",
    fc_familia: "",
    fc_ratio: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_biometria: "",
  });

  /* ===================== HELPERS ===================== */

  const formatNumber = (num) => {
    if (!num && num !== 0) return "—";
    const n = Number(num);
    return Number.isInteger(n)
      ? n.toLocaleString("en-US")
      : n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const f = new Date(fecha);
    return f.toLocaleDateString("es-MX");
  };

  const calcularDias = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const f = new Date(fecha);
    return Math.floor((hoy - f) / (1000 * 60 * 60 * 24));
  };

const colorDias = (dias) => {
  if (dias === null) return "inherit";
  if (dias <= 10) return "#2e7d32";
  if (dias <= 15) return "#f9a825";
  return "#c62828";
};

  /* ===================== CARGA DE DATOS ===================== */

  const obtenerReproductores = useCallback(async () => {
    if (!granjaActiva) return;
    const granja = encodeURIComponent(granjaActiva);
    const { data } = await listReproductoresByGranja(granja);
    setReproductores(data || []);
    setTotalOrganismos(
      data?.reduce(
        (acc, r) => acc + (Number(r.fn_cantidad) || 0),
        0
      ) || 0
    );
  }, [granjaActiva]);

  const obtenerInstalaciones = useCallback(async () => {
    if (!granjaActiva) return;
    const granja = encodeURIComponent(granjaActiva);
    const { data } = await listInstalacionesByGranja(granja);
    setInstalaciones(data || []);
    setTotalInstalaciones(data?.length || 0);
  }, [granjaActiva]);

  const obtenerTrazabilidad = useCallback(async () => {
    if (!granjaActiva) return;
    const { data } = await getReproductoresMovimientos(granjaActiva);
    setRastreos(data || []);
  }, [granjaActiva]);

  useEffect(() => {
    if (!granjaActiva && defaultUbicacion) {
      setGranjaActiva(defaultUbicacion);
      return;
    }

    if (!granjaActiva) return;
    obtenerReproductores();
    obtenerInstalaciones();
    obtenerTrazabilidad();
  }, [defaultUbicacion, granjaActiva, obtenerReproductores, obtenerInstalaciones, obtenerTrazabilidad]);

  const rastreosFiltrados = rastreos.filter((r) => {
  const texto = filtroTexto.toLowerCase();

  const coincideTexto =
    r.origen?.toLowerCase().includes(texto) ||
    r.destino?.toLowerCase().includes(texto) ||
    r.observacion?.toLowerCase().includes(texto);

  const fechaMov = new Date(r.fecha_movimiento);
  const desde = fechaInicio ? new Date(fechaInicio) : null;
  const hasta = fechaFin ? new Date(fechaFin) : null;

  const coincideFecha =
    (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);

  return coincideTexto && coincideFecha;
});

  /* ===================== FORMULARIO ===================== */

  const limpiarFormulario = () => {
    setForm({
      origen_instalacion: "",
      origen_texto: "",
      fi_instalacion_id: "",
      fn_machos: "",
      fn_hembras: "",
      fn_cantidad: "",
      fn_talla: "",
      fc_linea: "",
      fc_familia: "",
      fc_ratio: "",
      fc_observacion: "",
      fd_fecha_siembra: "",
      fd_fecha_biometria: "",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    setOrigenTipo("Interno");
    clearErrors();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fn_machos" || name === "fn_hembras") {
      if (!soloEntero(value)) return;
    }

    if (name === "fn_talla") {
      if (!soloDecimal(value)) return;
    }

    let updated = { ...form, [name]: value };

    if (name === "fn_machos" || name === "fn_hembras") {
      const m = Number(updated.fn_machos || 0);
      const h = Number(updated.fn_hembras || 0);

      updated.fn_cantidad = m + h;

      if (m > 0 && h > 0) {
        const ratio = h / m;
        const redondeado = Math.round(ratio * 100) / 100;
        updated.fc_ratio = `1:${redondeado}`;
      } else {
        updated.fc_ratio = "";
      }
    }

    setForm(updated);
    clearFieldError(name);
  };

  /* ===================== ACCIONES ===================== */

  const registrarReproductor = async () => {
    if (!validate(form, getReproductorRequiredFields(origenTipo))) return;

    try {
      await createReproductor({
        ...form,
        origen_texto: form.origen_instalacion || form.origen_texto,
        fi_usuario_id: usuario_id,
        fc_granja: granjaActiva,
      });

      limpiarFormulario();
      obtenerReproductores();
      obtenerTrazabilidad();
    } catch (err) {
      console.error("Error al registrar reproductor:", err);
      showSnackbar(err.response?.data?.error || err.message || "No se pudo registrar el reproductor.", "error");
    }
  };

  const editarReproductor = (r) => {
    clearErrors();
    setSeleccionado(r);
    setOrigenTipo(
      String(r.origen_instalacion || "").trim() ? "Interno" : "Externo"
    );

    setForm({
      origen_instalacion: r.origen_instalacion || "",
      origen_texto: r.origen_texto || "",
      fi_instalacion_id: r.fi_instalacion_id,
      fn_machos: r.fn_machos,
      fn_hembras: r.fn_hembras,
      fn_cantidad: r.fn_cantidad,
      fn_talla: r.fn_talla,
      fc_linea: r.fc_linea,
      fc_familia: r.fc_familia,
      fc_ratio: r.fc_ratio,
      fc_observacion: r.fc_observacion,
      fd_fecha_siembra: r.fd_fecha_siembra?.split("T")[0] || "",
      fd_fecha_biometria: r.fd_fecha_biometria?.split("T")[0] || "",
    });

    setMostrarFormulario(true);
  };

  const guardarEdicion = async () => {
    if (!validate(form, getReproductorRequiredFields(origenTipo))) return;
    try {
      await updateReproductor(seleccionado.fi_reproductor_id, {
        ...form,
        origen_texto: form.origen_instalacion || form.origen_texto,
        fi_usuario_id: usuario_id,
      });

      limpiarFormulario();
      obtenerReproductores();
      obtenerTrazabilidad();
    } catch (err) {
      console.error("Error al guardar reproductor:", err);
      showSnackbar(err.response?.data?.error || err.message || "No se pudo guardar el reproductor.", "error");
    }
  };

  const eliminarReproductor = async (id) => {
    if (!await confirm("¿Eliminar este reproductor?")) return;
    try {
      await removeReproductor(id);
      obtenerReproductores();
      obtenerTrazabilidad();
    } catch (err) {
      showSnackbar("Error al eliminar: " + (err.response?.data?.error || err.message), "error");
    }
  };

  const trazarReproductor = (r) => {
    showSnackbar(`Movimiento desde ${r.nombre_instalacion}.
Pronto conectaremos este botón con traspasos internos.`, "error");
  };

  /* ===================== RENDER ===================== */

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
         Control de Reproductores
      </Typography>
      <Paper
          elevation={0}
          sx={{
            backgroundColor: "#E3F2FD",
            p: 2,
            mb: 3,
            borderRadius: 2,
            borderLeft: "6px solid #2196F3",
          }}
        >
        <Typography><strong>Granja activa:</strong> {granjaActiva}</Typography>
        <Typography><strong>Total instalaciones:</strong> {totalInstalaciones}</Typography>
        <Typography><strong>Total organismos:</strong> {totalOrganismos}</Typography>
      </Paper>
      
     {/* Selector de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {ubicacionesGranja.map((op) => (
          <Button
            key={op.value}
            variant={granjaActiva === op.value ? "contained" : "outlined"}
            color="primary"
            sx={{ minWidth: 180, fontWeight: "bold" }}
            onClick={() => setGranjaActiva(op.value)}
          >
            {op.label}
          </Button>
        ))}
      </Box>

      {/* Botón para abrir formulario */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          sx={{ fontWeight: "bold", px: 4 }}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
        </Button>
      </Box>
      
      {/* FORMULARIO */}
      <Paper sx={{ p: 3, mb: 4 }}>
        {mostrarFormulario && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                
               {/* ORIGEN NUEVO */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                size="small"
                label="Origen"
                value={origenTipo}
                onChange={(e) => {
                  setOrigenTipo(e.target.value);
                  setForm({
                    ...form,
                    origen_instalacion: "",
                    origen_texto: "",
                  });
                }}
                fullWidth
              >
                <MenuItem value="Interno">Interno</MenuItem>
                <MenuItem value="Externo">Externo</MenuItem>
              </TextField>
            </Grid>

            {/* SI ES INTERNO → MOSTRAR INSTALACIONES */}
            {origenTipo === "Interno" && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  size="small"
                  label="Instalación (origen)"
                  name="origen_instalacion"
                  value={form.origen_instalacion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.origen_instalacion}
                  helperText={errors.origen_instalacion}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {instalaciones.map((i) => (
                    <MenuItem key={i.fi_instalacion_id} value={i.nombre_instalacion}>
                      {i.nombre_instalacion}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {/* SI ES EXTERNO → MOSTRAR INPUT LIBRE */}
            {origenTipo === "Externo" && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  size="small"
                  label="Origen externo"
                  name="origen_texto"
                  value={form.origen_texto}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.origen_texto}
                  helperText={errors.origen_texto}
                />
              </Grid>
            )}
                {/* DESTINO */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    select
                    size="small"
                    label="Destino"
                    name="fi_instalacion_id"
                    value={form.fi_instalacion_id}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.fi_instalacion_id}
                    helperText={errors.fi_instalacion_id}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {instalaciones.map((i) => (
                      <MenuItem
                        key={i.fi_instalacion_id}
                        value={i.fi_instalacion_id}
                      >
                        {i.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* MACHOS, HEMBRAS, CANTIDAD */}
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Machos"
                    name="fn_machos"
                    value={form.fn_machos}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: MAX_NUMERICO, inputMode: "numeric" }}
                    error={!!errors.fn_machos}
                    helperText={
                      errors.fn_machos ||
                      `${String(form.fn_machos ?? "").length}/${MAX_NUMERICO}`
                    }
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Hembras"
                    name="fn_hembras"
                    value={form.fn_hembras}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: MAX_NUMERICO, inputMode: "numeric" }}
                    error={!!errors.fn_hembras}
                    helperText={
                      errors.fn_hembras ||
                      `${String(form.fn_hembras ?? "").length}/${MAX_NUMERICO}`
                    }
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Cantidad"
                    value={formatNumber(form.fn_cantidad)}
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                </Grid>

                {/* TALLA */}
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Talla (gr)"
                    name="fn_talla"
                    value={form.fn_talla}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: MAX_NUMERICO, inputMode: "decimal" }}
                    error={!!errors.fn_talla}
                    helperText={
                      errors.fn_talla ||
                      `${String(form.fn_talla ?? "").length}/${MAX_NUMERICO}`
                    }
                  />
                </Grid>

                {/* LINEA – FAMILIA – RATIO */}
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Línea"
                    name="fc_linea"
                    value={form.fc_linea}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.fc_linea}
                    helperText={errors.fc_linea}
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Familia"
                    name="fc_familia"
                    value={form.fc_familia}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.fc_familia}
                    helperText={errors.fc_familia}
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Ratio"
                    value={form.fc_ratio}
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                </Grid>

                {/* FECHAS */}
                <Grid size={6}>
                  <TextField
                    type="date"
                    size="small"
                    label="Fecha siembra"
                    name="fd_fecha_siembra"
                    value={form.fd_fecha_siembra}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.fd_fecha_siembra}
                    helperText={errors.fd_fecha_siembra}
                  />
                </Grid>

                <Grid size={6}>
                  <TextField
                    type="date"
                    size="small"
                    label="Última biometría"
                    name="fd_fecha_biometria"
                    value={form.fd_fecha_biometria}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.fd_fecha_biometria}
                    helperText={errors.fd_fecha_biometria}
                  />
                </Grid>

                {/* OBSERVACIÓN */}
                <Grid size={12}>
                  <TextField
                    size="small"
                    label="Observación"
                    name="fc_observacion"
                    value={form.fc_observacion}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    inputProps={{ maxLength: MAX_OBSERVACION }}
                    error={!!errors.fc_observacion}
                    helperText={
                      errors.fc_observacion ||
                      `${String(form.fc_observacion ?? "").length}/${MAX_OBSERVACION}`
                    }
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                {seleccionado ? (
                  <Button variant="contained" color="success" onClick={guardarEdicion}>
                    GUARDAR
                  </Button>
                ) : (
                  <Button variant="contained" color="success" onClick={registrarReproductor}>
                    REGISTRAR
                  </Button>
                )}

                <Button variant="outlined" onClick={limpiarFormulario}>
                  CANCELAR
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* TABLA PRINCIPAL */}
      <Paper sx={{ width: "100%", mb: 6 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1350 }}>
            <TableHead>
              <TableRow>
                <TableCell>Instalación</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Talla</TableCell>
                <TableCell>Machos</TableCell>
                <TableCell>Hembras</TableCell>
                <TableCell>Ratio</TableCell>
                <TableCell>Línea</TableCell>
                <TableCell>Familia</TableCell>
                <TableCell>Últ. nota (pileta)</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell>Fecha siembra</TableCell>
                <TableCell>Días en pila</TableCell>
                <TableCell>Últ. biometría</TableCell>
                <TableCell>Días transcurridos</TableCell>
                <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {reproductores.map((r) => {
                const diasPila = calcularDias(r.fd_fecha_siembra);
                const diasBiometria = calcularDias(r.fd_fecha_biometria);

                return (
                  <TableRow key={r.fi_reproductor_id}>

                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={r.nombre_instalacion || ""}>
                        {truncar(r.nombre_instalacion) || "—"}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(r.fn_cantidad)}</TableCell>
                    <TableCell>{formatNumber(r.fn_talla)}</TableCell>
                    <TableCell>{formatNumber(r.fn_machos)}</TableCell>
                    <TableCell>{formatNumber(r.fn_hembras)}</TableCell>
                    <TableCell>{r.fc_ratio || "—"}</TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={r.fc_linea || ""}>
                        {r.fc_linea ? truncar(r.fc_linea) : "—"}
                      </span>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={r.fc_familia || ""}>
                        {r.fc_familia ? truncar(r.fc_familia) : "—"}
                      </span>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <span
                        title={
                          r.fc_ultima_observacion_pileta ||
                          (r.fc_ultima_observacion_proceso
                            ? `(${r.fc_ultima_observacion_proceso})`
                            : "")
                        }
                      >
                        {r.fc_ultima_observacion_pileta ? (
                          <>
                            {truncar(r.fc_ultima_observacion_pileta)}
                            {r.fc_ultima_observacion_proceso ? (
                              <Typography variant="caption" display="block" color="text.secondary">
                                {r.fc_ultima_observacion_proceso}
                              </Typography>
                            ) : null}
                          </>
                        ) : (
                          "—"
                        )}
                      </span>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={r.fc_observacion || ""}>
                        {r.fc_observacion ? truncar(r.fc_observacion) : "—"}
                      </span>
                    </TableCell>

                    <TableCell>{formatFecha(r.fd_fecha_siembra)}</TableCell>

                    {/* DÍAS EN PILA (SIN SEMÁFORO) */}
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {diasPila ?? "—"}
                    </TableCell>

                    {/* FECHA BIOMETRÍA */}
                    <TableCell>{formatFecha(r.fd_fecha_biometria)}</TableCell>

                    {/* DÍAS TRANSCURRIDOS (CON SEMÁFORO) */}
                    <TableCell sx={{ textAlign: "center" }}>
                      {diasBiometria !== null ? (
                        <CirculoNumero color={colorDias(diasBiometria)} value={diasBiometria} />
                      ) : "—"}
                    </TableCell>

                    {/* ACCIONES */}
                    <TableCell
                      align="center"
                      sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                    >
                      <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                        <Tooltip title="Editar">
                          <IconButton color="primary" onClick={() => editarReproductor(r)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar">
                          <IconButton color="error" onClick={() => eliminarReproductor(r.fi_reproductor_id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Trazar movimiento">
                          <IconButton color="success" onClick={() => trazarReproductor(r)}>
                            <SyncAltIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>

                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* TRAZABILIDAD */}
      <Typography variant="h6" sx={{ color: "#E65100", mt: 5, mb: 2 }}>
         Trazabilidad de Movimientos
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        size="small"
        label="Buscar"
        fullWidth
        value={filtroTexto}
        onChange={(e) => setFiltroTexto(e.target.value)}
      />

      <TextField
        type="date"
        size="small"
        label="Fecha inicio"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        type="date"
        size="small"
        label="Fecha fin"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Button
        variant="contained"
        onClick={() => obtenerTrazabilidad()}
        sx={{ height: "40px" }}
      >
        BUSCAR
      </Button>

      <Button
        variant="outlined"
        color="error"
        sx={{ height: "40px" }}
        onClick={() => {
          setFiltroTexto("");
          setFechaInicio("");
          setFechaFin("");
        }}
      >
        LIMPIAR
      </Button>
    </Box>
    <Paper sx={{ width: "100%", mb: 6, boxShadow: 2 }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table stickyHeader sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
           {rastreosFiltrados.map((r) => (
              <TableRow key={r.fi_movimiento_id}>
                <TableCell>{r.origen || "—"}</TableCell>
                <TableCell>{r.destino || "—"}</TableCell>
                <TableCell>{formatNumber(r.cantidad_trasladada)}</TableCell>
                <TableCell>{formatFecha(r.fecha_movimiento)}</TableCell>
                <TableCell sx={{ maxWidth: 160 }}>
                  <span title={r.observacion || ""}>
                    {r.observacion ? truncar(r.observacion) : "—"}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
      {ConfirmModal}
    </Box>
  );
}