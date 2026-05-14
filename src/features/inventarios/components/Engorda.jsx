import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Delete from "@mui/icons-material/Delete";
import Clear from "@mui/icons-material/Clear";
import Chip from "@mui/material/Chip";
import {
  listEngordas,
  listMovimientos,
  createEngorda,
  removeEngorda,
  removeMovimiento,
} from "../services/engordaService";
import { listPiletas } from "../services/piletasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

export default function Engorda() {
  return <EngordaContent />;
}

function EngordaContent() {
  const usuario_id = localStorage.getItem("usuario_id");
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { ubicacionesGranja, defaultUbicacion, resolveFiltroUbicacion } = useUbicacionesGranja();

  const requiredFields = ["pileta_id", "machos", "hembras", "talla_gr", "observacion"];

  const [granjaActiva, setGranjaActiva] = useState("");
  const [engordas, setEngordas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [piletasEngorda, setPiletasEngorda] = useState([]);
  const [piletasOrigen, setPiletasOrigen] = useState([]);
  const [form, setForm] = useState({});
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const filtroUbicacion = useMemo(
    () => (granjaActiva ? resolveFiltroUbicacion(granjaActiva) : null),
    [granjaActiva, resolveFiltroUbicacion],
  );

  /** Solo piletas con inventario declarado (permite traslado desde origen real). */
  const piletasOrigenOcupadas = useMemo(
    () =>
      (piletasOrigen || []).filter(
        (p) => String(p.estado).toLowerCase() === "ocupada",
      ),
    [piletasOrigen],
  );

  const cantidadTotalForm = useMemo(() => {
    const m = Number(form.machos);
    const h = Number(form.hembras);
    const mi = Number.isFinite(m) ? Math.max(0, Math.floor(m)) : 0;
    const hi = Number.isFinite(h) ? Math.max(0, Math.floor(h)) : 0;
    return mi + hi;
  }, [form.machos, form.hembras]);

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "—";
    const n = Number(num);
    return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toString();
  };

  /* =========================================================
       OBTENER DATOS
  ========================================================= */
  const obtenerPiletas = useCallback(async () => {
    if (!filtroUbicacion?.granja && !filtroUbicacion?.ubicacion_id) return;
    try {
      const [resEngorda, resTodas] = await Promise.all([
        listPiletas(filtroUbicacion, "engorda"),
        listPiletas(filtroUbicacion),
      ]);
      setPiletasEngorda(Array.isArray(resEngorda.data) ? resEngorda.data : []);
      setPiletasOrigen(Array.isArray(resTodas.data) ? resTodas.data : []);
    } catch (err) {
      console.error("Error al obtener piletas:", err);
      setPiletasEngorda([]);
      setPiletasOrigen([]);
    }
  }, [filtroUbicacion]);

  const obtenerEngordas = useCallback(async () => {
    if (!filtroUbicacion?.granja && !filtroUbicacion?.ubicacion_id) return;
    try {
      const { data } = await listEngordas(filtroUbicacion);
      setEngordas(data || []);
    } catch (err) {
      console.error("Error al obtener engordas:", err);
    }
  }, [filtroUbicacion]);

  const obtenerMovimientos = useCallback(async () => {
    try {
      const { data } = await listMovimientos(usuario_id);
      setMovimientos(data || []);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
    }
  }, [usuario_id]);

  const limpiarFormulario = useCallback(() => {
    setForm({
      origen_pileta_id: "",
      pileta_id: "",
      machos: "",
      hembras: "",
      talla_gr: "",
      observacion: "",
      fc_granja: granjaActiva,
      fi_usuario_id: usuario_id,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    clearErrors();
  }, [granjaActiva, usuario_id, clearErrors]);

  useEffect(() => {
    if (!granjaActiva && defaultUbicacion) {
      setGranjaActiva(defaultUbicacion);
      return;
    }

    if (!granjaActiva) return;
    limpiarFormulario();
    obtenerEngordas();
    obtenerMovimientos();
    obtenerPiletas();
  }, [defaultUbicacion, granjaActiva, limpiarFormulario, obtenerEngordas, obtenerMovimientos, obtenerPiletas]);

  /* =========================================================
       FORMULARIO Y CAMBIOS
  ========================================================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  /* =========================================================
       CRUD
  ========================================================= */
  const registrarEngorda = async () => {
    if (!validate(form, requiredFields)) return;

    const machosVal = Number(form.machos);
    const hembrasVal = Number(form.hembras);
    if (!Number.isFinite(machosVal) || !Number.isFinite(hembrasVal) || machosVal < 0 || hembrasVal < 0) {
      showSnackbar("Machos y hembras deben ser números válidos", "error");
      return;
    }
    const mi = Math.floor(machosVal);
    const hi = Math.floor(hembrasVal);
    if (mi + hi <= 0) {
      showSnackbar("La suma machos + hembras debe ser mayor a cero", "error");
      return;
    }

    try {
      await createEngorda({
        pileta_id: Number(form.pileta_id),
        machos: mi,
        hembras: hi,
        cantidad: mi + hi,
        talla_gr: form.talla_gr,
        observacion: form.observacion,
        origen_pileta_id: form.origen_pileta_id ? Number(form.origen_pileta_id) : null,
        fc_granja: granjaActiva,
        fi_usuario_id: usuario_id,
      });

      showSnackbar("Registro agregado correctamente", "success");
      obtenerEngordas();
      obtenerPiletas();
      obtenerMovimientos();
      limpiarFormulario();
    } catch (err) {
      showSnackbar("Error al registrar engorda: " + (err.response?.data?.error || err.message), "error");
    }
  };

  const actualizarEngorda = async () => {
    if (!seleccionado) return;
    if (!validate(form, requiredFields)) return;

    const machosVal = Number(form.machos);
    const hembrasVal = Number(form.hembras);
    if (!Number.isFinite(machosVal) || !Number.isFinite(hembrasVal) || machosVal < 0 || hembrasVal < 0) {
      showSnackbar("Machos y hembras deben ser números válidos", "error");
      return;
    }
    const mi = Math.floor(machosVal);
    const hi = Math.floor(hembrasVal);
    if (mi + hi <= 0) {
      showSnackbar("La suma machos + hembras debe ser mayor a cero", "error");
      return;
    }

    try {
      await createEngorda({
        pileta_id: Number(form.pileta_id),
        machos: mi,
        hembras: hi,
        cantidad: mi + hi,
        talla_gr: form.talla_gr,
        observacion: form.observacion,
        origen_pileta_id: form.origen_pileta_id ? Number(form.origen_pileta_id) : null,
        fi_engorda_id: seleccionado,
      });

      showSnackbar("Registro actualizado", "success");
      obtenerEngordas();
      obtenerPiletas();
      obtenerMovimientos();
      limpiarFormulario();
    } catch (err) {
      showSnackbar("Error al actualizar", "error");
    }
  };

  const eliminarEngorda = async () => {
    if (!await confirm("¿Eliminar este registro?")) return;
    try {
      await removeEngorda(seleccionado);
      showSnackbar(" Eliminado", "error");
      obtenerEngordas();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
    }
  };

  const seleccionarRegistro = (e) => {
    clearErrors();
    setSeleccionado(e.fi_engorda_id);
    setForm({
      pileta_id: e.pileta_id != null ? String(e.pileta_id) : "",
      origen_pileta_id:
        e.origen_pileta_id != null ? String(e.origen_pileta_id) : "",
      machos:
        e.machos != null
          ? String(e.machos)
          : e.cantidad != null
            ? String(e.cantidad)
            : "",
      hembras: e.hembras != null ? String(e.hembras) : "",
      talla_gr: e.talla_gr ?? "",
      observacion: e.observacion ?? "",
      fc_granja: e.fc_granja || granjaActiva,
    });
    setMostrarFormulario(true);
  };

  const eliminarMovimiento = async (id) => {
    if (!await confirm("¿Eliminar este movimiento?")) return;
    try {
      await removeMovimiento(id);
      obtenerMovimientos();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeStyle = (dias) => {
  if (dias <= 15)
    return { backgroundColor: "#4CAF50", color: "white", borderRadius: 12, padding: "6px 12px" };

  if (dias <= 25)
    return { backgroundColor: "#FFC107", color: "#333", borderRadius: 12, padding: "6px 12px" };

  return { backgroundColor: "#F44336", color: "white", borderRadius: 12, padding: "6px 12px" };
};

  const totalCantidad = engordas.reduce((acc, e) => acc + Number(e.cantidad || 0), 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
         Módulo de Engorda — Sistema
      </Typography>

      {/*  Selección de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {ubicacionesGranja.map((op) => (
          <Button
            key={op.value}
            variant={granjaActiva === op.value ? "contained" : "outlined"}
            color="primary"
            onClick={() => setGranjaActiva(op.value)}
          >
            {op.label}
          </Button>
        ))}
      </Box>

      {/*  Resumen */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Ubicación (sede):</b> {granjaActiva}</Typography>
        <Typography><b>Registros en tina:</b> {engordas.length}</Typography>
        <Typography><b>Total organismos en engorda:</b> {totalCantidad.toLocaleString("es-MX")}</Typography>
      </Paper>

      {/*  Formulario */}
      <Paper sx={{ borderRadius: 3, p: 3, backgroundColor: "#FAFAFA", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" color="#00796B" fontWeight="bold"> Registro / Traslado de Engorda</Typography>
          <Button variant="contained" color="success" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
          </Button>
        </Box>

        {mostrarFormulario && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {/* PILETA ORIGEN (opcional) */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="Pileta origen (opcional)"
                    name="origen_pileta_id"
                    value={form.origen_pileta_id || ""}
                    onChange={handleChange}
                    fullWidth
                    helperText="Solo piletas ocupadas. Origen del traslado (alevinaje, repro u otra engorda)."
                    slotProps={{
                      select: {
                        renderValue: (val) => {
                          const p = piletasOrigen.find((x) => String(x.fi_pileta_id) === String(val));
                          return p ? `${p.nombre} · ${tipoLabel(p.tipo)}` : "";
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Sin origen interno</MenuItem>
                    {piletasOrigenOcupadas
                      .filter(
                        (p) =>
                          !form.pileta_id ||
                          String(p.fi_pileta_id) !== String(form.pileta_id),
                      )
                      .map((p) => (
                        <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
                          {p.nombre} · {tipoLabel(p.tipo)} · {p.estado}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>

                {/* PILETA DESTINO (engorda) */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="Pileta destino (engorda)"
                    name="pileta_id"
                    value={form.pileta_id || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.pileta_id}
                    helperText={errors.pileta_id || "Solo piletas tipo engorda"}
                    slotProps={{
                      select: {
                        renderValue: (val) => {
                          const p = piletasEngorda.find((x) => String(x.fi_pileta_id) === String(val));
                          return p ? `${p.nombre} · ${p.estado}` : "";
                        },
                      },
                    }}
                  >
                    <MenuItem value="">Seleccione un destino</MenuItem>
                    {piletasEngorda.map((p) => (
                      <MenuItem key={p.fi_pileta_id} value={String(p.fi_pileta_id)}>
                        {p.nombre} · {p.estado}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Machos"
                    name="machos"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    value={form.machos ?? ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.machos}
                    helperText={errors.machos || "Organismos macho a trasladar"}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Hembras"
                    name="hembras"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    value={form.hembras ?? ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.hembras}
                    helperText={errors.hembras || "Organismos hembra a trasladar"}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Cantidad total"
                    value={cantidadTotalForm > 0 ? cantidadTotalForm : ""}
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                    helperText="Suma automática machos + hembras"
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Talla (Gr)"
                    name="talla_gr"
                    type="number"
                    value={form.talla_gr || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.talla_gr}
                    helperText={errors.talla_gr}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    label="Observación"
                    name="observacion"
                    value={form.observacion || ""}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                    inputProps={{ maxLength: MAX_OBSERVACION }}
                    error={!!errors.observacion}
                    helperText={
                      errors.observacion ||
                      `Se guarda como observación de la pileta (proceso "engorda"). ${String(form.observacion ?? "").length}/${MAX_OBSERVACION}`
                    }
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                <Button variant="contained" color="success" onClick={seleccionado ? actualizarEngorda : registrarEngorda}>
                   {seleccionado ? "Actualizar" : "Registrar"}
                </Button>
                {seleccionado && <Button variant="contained" color="error" onClick={eliminarEngorda}><Delete /> Eliminar</Button>}
                <Button variant="outlined" onClick={limpiarFormulario}><Clear /> Limpiar</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabla principal */}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Pileta</TableCell>
              <TableCell>Cantidad total</TableCell>
              <TableCell>Machos</TableCell>
              <TableCell>Hembras</TableCell>
              <TableCell>Talla (Gr)</TableCell>
              <TableCell>Última observación (pileta)</TableCell>
              <TableCell>Última biometría</TableCell>
              <TableCell>Días desde biometría</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engordas.map((e) => {
              const fechaBio = e.fecha_biometria || e.fd_fecha_biometria;
              const dias = e.dias_transcurridos;
              return (
                <TableRow
                  key={e.fi_engorda_id}
                  hover
                  onClick={() => seleccionarRegistro(e)}
                  style={{ cursor: "pointer" }}
                >
                  <TableCell>
                    {e.nombre_pileta || e.destino_nombre || "—"}
                    {e.fc_granja ? (
                      <Chip size="small" sx={{ ml: 1 }} label={e.fc_granja} variant="outlined" />
                    ) : null}
                  </TableCell>
                  <TableCell>{formatNumber(e.cantidad)}</TableCell>
                  <TableCell>{formatNumber(e.machos)}</TableCell>
                  <TableCell>{formatNumber(e.hembras)}</TableCell>
                  <TableCell>{formatNumber(e.talla_gr)}</TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <span title={e.observacion || ""}>
                      {e.observacion ? truncar(e.observacion) : "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {fechaBio ? new Date(fechaBio).toLocaleDateString("es-MX") : "—"}
                  </TableCell>
                  <TableCell>
                    {dias != null ? (
                      <span style={getBadgeStyle(dias)}>{dias}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/*  TRAZABILIDAD */}
      <Typography variant="h6" mt={5} mb={2} color="#E65100"> Historial de Movimientos de Engorda</Typography>
      <Paper sx={{ width: "100%", borderRadius: 3 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((m) => (
                <TableRow key={m.fi_movimiento_id}>
                  <TableCell>{m.origen_nombre || "Siembra Lote"}</TableCell>
                  <TableCell>{m.destino_nombre}</TableCell>
                  <TableCell>{formatNumber(m.cantidad_trasladada)}</TableCell>
                  <TableCell>{m.fecha_movimiento}</TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <span title={m.observacion || ""}>
                      {m.observacion ? truncar(m.observacion) : "—"}
                    </span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                  >
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => eliminarMovimiento(m.fi_movimiento_id)}
                      >
                        <Delete />
                      </Button>
                    </Box>
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