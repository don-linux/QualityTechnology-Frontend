import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  listByGranja as listReproductoresByGranja,
  createReproductor,
  updateReproductor,
  removeReproductor,
} from "../services/reproductoresService";
import { listPiletas } from "../services/piletasService";
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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import {
  fetchMergedPorUbicaciones,
  filtrarPorUbicacion,
} from "@shared/utils/fetchMergedPorUbicaciones";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;

const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const REPRODUCTOR_BASE_REQUIRED = [
  "pileta_id",
  "fn_machos",
  "fn_hembras",
  "fn_talla",
  "fc_linea",
  "fc_familia",
  "fc_observacion",
];

function getReproductorRequiredFields(origenTipo) {
  return origenTipo === "Interno"
    ? [...REPRODUCTOR_BASE_REQUIRED, "origen_pileta_id"]
    : [...REPRODUCTOR_BASE_REQUIRED, "origen_texto"];
}

/** Recalcula machos / hembras / cantidad derivada para el estado del formulario. */
function aplicarCantidadesMachosHembras(prevForm, machosEntero, hembrasEntero) {
  const m = Math.max(0, Number(machosEntero) || 0);
  const h = Math.max(0, Number(hembrasEntero) || 0);
  const next = { ...prevForm, fn_cantidad: m + h, fc_ratio: "" };
  next.fn_machos = m ? String(m) : "";
  next.fn_hembras = h ? String(h) : "";
  if (m > 0 && h > 0) {
    const ratio = Math.round((h / m) * 100) / 100;
    next.fc_ratio = `1:${ratio}`;
  }
  return next;
}

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

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
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion, getGroups } =
    useUbicacionesGranja();

  const filtrosUbicacion = useMemo(
    () => ubicacionesGranja.map((op) => resolveFiltroUbicacion(op.value)),
    [ubicacionesGranja, resolveFiltroUbicacion],
  );

  const [reproductores, setReproductores] = useState([]);
  const [piletasReproductores, setPiletasReproductores] = useState([]);
  const [piletasOrigen, setPiletasOrigen] = useState([]);
  const [totalPiletas, setTotalPiletas] = useState(0);
  const [totalOrganismos, setTotalOrganismos] = useState(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [origenTipo, setOrigenTipo] = useState("Interno");
  /** Peces sumados desde la última pileta interna ocupada seleccionada (para revertir al cambiar origen). */
  const origenAporteRef = useRef({ piletaId: null, machos: 0, hembras: 0 });

  const [form, setForm] = useState({
    ubicacion: "",
    origen_pileta_id: "",
    origen_texto: "",
    pileta_id: "",
    fn_machos: "",
    fn_hembras: "",
    fn_cantidad: "",
    fn_talla: "",
    fc_linea: "",
    fc_familia: "",
    fc_ratio: "",
    fc_observacion: "",
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
    const data = await fetchMergedPorUbicaciones(filtrosUbicacion, listReproductoresByGranja);
    setReproductores(data || []);
    setTotalOrganismos(
      data?.reduce(
        (acc, r) => acc + (Number(r.fn_cantidad) || 0),
        0
      ) || 0
    );
  }, [filtrosUbicacion]);

  const obtenerPiletas = useCallback(async () => {
    try {
      const [resRepro, resTodas] = await Promise.all([
        listPiletas(null, "reproductores"),
        listPiletas(),
      ]);
      const repro = Array.isArray(resRepro.data) ? resRepro.data : [];
      const todas = Array.isArray(resTodas.data) ? resTodas.data : [];
      setPiletasReproductores(repro);
      setPiletasOrigen(todas);
      setTotalPiletas(repro.length);
    } catch (err) {
      console.error("Error al obtener piletas:", err);
      setPiletasReproductores([]);
      setPiletasOrigen([]);
      setTotalPiletas(0);
    }
  }, []);

  useEffect(() => {
    obtenerReproductores();
    obtenerPiletas();
  }, [obtenerReproductores, obtenerPiletas]);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  const piletasReproductoresFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasReproductores, form.ubicacion, ubicacionesGranja),
    [piletasReproductores, form.ubicacion, ubicacionesGranja],
  );
  const piletasOrigenFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasOrigen, form.ubicacion, ubicacionesGranja),
    [piletasOrigen, form.ubicacion, ubicacionesGranja],
  );

  const gruposReproductores = useMemo(
    () => getGroups(reproductores, "fc_granja"),
    [reproductores, getGroups],
  );

  /* ===================== FORMULARIO ===================== */

  const limpiarFormulario = () => {
    origenAporteRef.current = { piletaId: null, machos: 0, hembras: 0 };
    setForm({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      origen_pileta_id: "",
      origen_texto: "",
      pileta_id: "",
      fn_machos: "",
      fn_hembras: "",
      fn_cantidad: "",
      fn_talla: "",
      fc_linea: "",
      fc_familia: "",
      fc_ratio: "",
      fc_observacion: "",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    setOrigenTipo("Interno");
    clearErrors();
  };

  /** Al elegir pileta interna ocupada con inventario, suma peces destino manteniendo edición manual posible después. */
  const handleSeleccionOrigenPileta = useCallback(
    (nextOrigenStr) => {
      let warnMismoDestino = false;
      setForm((prev) => {
        let m = Number(prev.fn_machos || 0) || 0;
        let h = Number(prev.fn_hembras || 0) || 0;

        const ap = origenAporteRef.current;
        if (ap.piletaId != null && (ap.machos > 0 || ap.hembras > 0)) {
          m = Math.max(0, m - ap.machos);
          h = Math.max(0, h - ap.hembras);
        }
        origenAporteRef.current = { piletaId: null, machos: 0, hembras: 0 };

        let siguiente = aplicarCantidadesMachosHembras(prev, m, h);
        siguiente.origen_pileta_id = nextOrigenStr;

        if (!nextOrigenStr) return siguiente;

        const oid = Number(nextOrigenStr);
        const did = Number(prev.pileta_id);
        if (did && oid === did) {
          warnMismoDestino = true;
          siguiente.origen_pileta_id = "";
          return siguiente;
        }

        const pileMeta = piletasOrigen.find((p) => Number(p.fi_pileta_id) === oid);
        const repOrig = reproductores.find((r) => Number(r.pileta_id) === oid);
        const om = repOrig ? Number(repOrig.fn_machos ?? 0) || 0 : 0;
        const oh = repOrig ? Number(repOrig.fn_hembras ?? 0) || 0 : 0;

        if (
          !repOrig ||
          pileMeta?.estado !== "ocupada" ||
          (om <= 0 && oh <= 0)
        ) {
          return siguiente;
        }

        origenAporteRef.current = { piletaId: oid, machos: om, hembras: oh };
        return aplicarCantidadesMachosHembras(siguiente, m + om, h + oh);
      });
      if (warnMismoDestino) {
        showSnackbar(
          "La pileta origen no puede ser la misma que la pileta destino.",
          "warning",
        );
      }
    },
    [piletasOrigen, reproductores, showSnackbar],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "origen_pileta_id") {
      handleSeleccionOrigenPileta(value);
      clearFieldError(name);
      return;
    }

    if (name === "ubicacion") {
      setForm({
        ...form,
        ubicacion: value,
        origen_pileta_id: "",
        pileta_id: "",
      });
      origenAporteRef.current = { piletaId: null, machos: 0, hembras: 0 };
      clearFieldError(name);
      return;
    }

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
    if (!validate(form, [...getReproductorRequiredFields(origenTipo), "ubicacion"])) return;

    try {
      await createReproductor({
        pileta_id: Number(form.pileta_id),
        fn_machos: form.fn_machos,
        fn_hembras: form.fn_hembras,
        fn_talla: form.fn_talla,
        fc_linea: form.fc_linea,
        fc_familia: form.fc_familia,
        fc_observacion: form.fc_observacion,
        origen_pileta_id: form.origen_pileta_id ? Number(form.origen_pileta_id) : null,
        origen_texto: form.origen_texto,
        fi_usuario_id: usuario_id,
        fc_granja: form.ubicacion,
      });

      limpiarFormulario();
      obtenerReproductores();
    } catch (err) {
      console.error("Error al registrar reproductor:", err);
      showSnackbar(err.response?.data?.error || err.message || "No se pudo registrar el reproductor.", "error");
    }
  };

  const editarReproductor = (r) => {
    clearErrors();
    origenAporteRef.current = { piletaId: null, machos: 0, hembras: 0 };
    setSeleccionado(r);
    setOrigenTipo(r.origen_pileta_id ? "Interno" : "Externo");

    setForm({
      ubicacion: r.fc_granja || defaultUbicacion || "",
      origen_pileta_id: r.origen_pileta_id != null ? String(r.origen_pileta_id) : "",
      origen_texto: r.origen_texto || "",
      pileta_id: r.pileta_id != null ? String(r.pileta_id) : "",
      fn_machos: r.fn_machos ?? "",
      fn_hembras: r.fn_hembras ?? "",
      fn_cantidad: r.fn_cantidad ?? "",
      fn_talla: r.fn_talla ?? "",
      fc_linea: r.fc_linea ?? "",
      fc_familia: r.fc_familia ?? "",
      fc_ratio: r.fc_ratio ?? "",
      fc_observacion: r.fc_observacion ?? "",
    });

    setMostrarFormulario(true);
  };

  const guardarEdicion = async () => {
    if (!validate(form, getReproductorRequiredFields(origenTipo))) return;
    try {
      await updateReproductor(seleccionado.fi_reproductor_id, {
        pileta_id: Number(form.pileta_id),
        fn_machos: form.fn_machos,
        fn_hembras: form.fn_hembras,
        fn_talla: form.fn_talla,
        fc_linea: form.fc_linea,
        fc_familia: form.fc_familia,
        fc_observacion: form.fc_observacion,
        origen_pileta_id: form.origen_pileta_id ? Number(form.origen_pileta_id) : null,
        origen_texto: form.origen_texto,
        fi_usuario_id: usuario_id,
      });

      limpiarFormulario();
      obtenerReproductores();
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
    } catch (err) {
      showSnackbar("Error al eliminar: " + (err.response?.data?.error || err.message), "error");
    }
  };


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
        <Typography><strong>Total piletas reproductoras:</strong> {totalPiletas}</Typography>
        <Typography><strong>Total organismos:</strong> {totalOrganismos}</Typography>
      </Paper>
      
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
                <Grid size={12}>
                  <TextField
                    select
                    size="small"
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

               {/* ORIGEN NUEVO */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                size="small"
                label="Origen"
                value={origenTipo}
                onChange={(e) => {
                  const nextTipo = e.target.value;
                  if (origenTipo === "Interno" && nextTipo !== "Interno") {
                    handleSeleccionOrigenPileta("");
                  }
                  setOrigenTipo(nextTipo);
                  setForm((prev) => ({ ...prev, origen_texto: "" }));
                }}
                fullWidth
              >
                <MenuItem value="Interno">Interno</MenuItem>
                <MenuItem value="Externo">Externo</MenuItem>
              </TextField>
            </Grid>

            {/* SI ES INTERNO → MOSTRAR PILETA ORIGEN */}
            {origenTipo === "Interno" && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select
                  size="small"
                  label="Pileta origen"
                  name="origen_pileta_id"
                  value={form.origen_pileta_id}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.origen_pileta_id}
                  helperText={errors.origen_pileta_id || "Pileta de la que provienen los reproductores"}
                  slotProps={{
                    select: {
                      renderValue: (val) => {
                        const p = piletasOrigenFiltradas.find((x) => String(x.fi_pileta_id) === String(val));
                        return p ? `${p.nombre} · ${tipoLabel(p.tipo)}` : "";
                      },
                    },
                  }}
                >
                  <MenuItem value="">Seleccione</MenuItem>
                  {piletasOrigenFiltradas.map((p) => (
                    <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
                      {p.nombre} · {tipoLabel(p.tipo)} · {p.estado}
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

                {/* PILETA DESTINO (reproductores) */}
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    select
                    size="small"
                    label="Pileta destino"
                    name="pileta_id"
                    value={form.pileta_id}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.pileta_id}
                    helperText={
                      errors.pileta_id ||
                      "Sólo piletas tipo reproductores. Define la familia/línea para esta pileta."
                    }
                    slotProps={{
                      select: {
                        renderValue: (val) => {
                          const p = piletasReproductoresFiltradas.find(
                            (x) => String(x.fi_pileta_id) === String(val),
                          );
                          return p ? `${p.nombre} · ${p.estado}` : "";
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {piletasReproductoresFiltradas.map((p) => (
                      <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
                        {p.nombre} · {p.estado}
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

      <TablasPorUbicacionGranja
        grupos={gruposReproductores}
        accordionSx={{ mb: 6 }}
        renderTabla={(rows) => (
      <Paper sx={{ width: "100%" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1350 }}>
            <TableHead>
              <TableRow>
                <TableCell>Pileta</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Talla</TableCell>
                <TableCell>Machos</TableCell>
                <TableCell>Hembras</TableCell>
                <TableCell>Ratio</TableCell>
                <TableCell>Línea</TableCell>
                <TableCell>Familia</TableCell>
                <TableCell>Últ. nota (pileta)</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell
                  title="Fecha del último ingreso registrado como movimiento (`siembra`) hacia esta pileta."
                >
                  Fecha siembra
                </TableCell>
                <TableCell
                  title="Días en cultivo: desde la fecha de siembra vinculada; si falta, desde el alta del reproductor en sistema."
                >
                  Días en pila
                </TableCell>
                <TableCell title="Última biometría: puntero del reproductor o la más reciente en la misma pileta.">
                  Últ. biometría
                </TableCell>
                <TableCell
                  title="Días transcurridos desde la última biometría (semáforo: verde ≤10, amarillo ≤15, rojo &gt;15)."
                >
                  Días sin biometría
                </TableCell>
                <TableCell align="center" sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r) => {
                const refDiasPila = r.fd_fecha_siembra ?? r.fd_alta_reproductor ?? null;
                const diasPila = calcularDias(refDiasPila);
                const diasBiometria = calcularDias(r.fd_fecha_biometria);

                return (
                  <TableRow key={r.fi_reproductor_id}>

                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={r.nombre_pileta || r.nombre_instalacion || ""}>
                        {truncar(r.nombre_pileta || r.nombre_instalacion) || "—"}
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

                    <TableCell>
                      {r.fd_fecha_siembra ? (
                        formatFecha(r.fd_fecha_siembra)
                      ) : r.fd_alta_reproductor ? (
                        formatFecha(r.fd_alta_reproductor)
                      ) : (
                        "—"
                      )}
                    </TableCell>
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

                    <TableCell
                      align="center"
                      sx={{ minWidth: 120, verticalAlign: "middle", whiteSpace: "nowrap" }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Tooltip title="Editar">
                          <IconButton color="primary" onClick={() => editarReproductor(r)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            color="error"
                            onClick={() => eliminarReproductor(r.fi_reproductor_id)}
                          >
                            <DeleteIcon />
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
        )}
      />

      {ConfirmModal}
    </Box>
  );
}