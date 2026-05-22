import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormValidation from "@shared/hooks/useFormValidation";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import {
  fetchMergedPorUbicaciones,
  filtrarPorUbicacion,
} from "@shared/utils/fetchMergedPorUbicaciones";
import { listMovimientos, createMovimiento } from "../services/trazabilidadService";
import { listPiletas } from "../services/piletasService";

const TRUNCAR_MAX = 40;
const MAX_OBSERVACION = 500;

const ETAPA_OPCIONES = [
  { value: "", label: "Todas las etapas" },
  { value: "alevinaje", label: "Alevinaje" },
  { value: "engorda", label: "Engorda" },
];

const TIPO_MOVIMIENTO_OPCIONES = [
  { value: "TRASLADO", label: "Traslado entre piletas" },
  { value: "INGRESO", label: "Ingreso externo (sin origen)" },
  { value: "MORTALIDAD", label: "Mortalidad (baja en pileta)" },
];

const ETAPA_COLOR = {
  alevinaje: "#00838F",
  engorda: "#2E7D32",
};

const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

const hoyISO = () => new Date().toISOString().slice(0, 10);

const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const formInicial = () => ({
  ubicacion: "",
  tipo_movimiento: "TRASLADO",
  pileta_origen_id: "",
  pileta_destino_id: "",
  cantidad: "",
  mortalidad: "",
  fecha_movimiento: hoyISO(),
  observacion: "",
});

export default function Trazabilidad() {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const {
    visible: mostrarFormulario,
    toggle: toggleFormulario,
    cerrar: cerrarFormulario,
  } = useFormularioVisible();
  const {
    ubicacionesGranja,
    defaultUbicacion,
    resolveFiltroUbicacion,
    getGroups,
  } = useUbicacionesGranja();

  const filtrosUbicacion = useMemo(
    () => ubicacionesGranja.map((op) => resolveFiltroUbicacion(op.value)),
    [ubicacionesGranja, resolveFiltroUbicacion],
  );

  const [rastreos, setRastreos] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [form, setForm] = useState(() => formInicial());
  const [filtroTexto, setFiltroTexto] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const esTraslado = form.tipo_movimiento === "TRASLADO";
  const esIngreso = form.tipo_movimiento === "INGRESO";
  const esMortalidad = form.tipo_movimiento === "MORTALIDAD";

  const requiredFields = useMemo(() => {
    const base = ["ubicacion", "tipo_movimiento", "cantidad", "fecha_movimiento"];
    if (esTraslado) return [...base, "pileta_origen_id", "pileta_destino_id"];
    if (esIngreso) return [...base, "pileta_destino_id"];
    if (esMortalidad) return [...base, "pileta_origen_id"];
    return base;
  }, [esTraslado, esIngreso, esMortalidad]);

  const piletasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletas, form.ubicacion, ubicacionesGranja),
    [piletas, form.ubicacion, ubicacionesGranja],
  );

  const piletasConStock = useMemo(
    () => piletasFiltradas.filter((p) => Number(p.cantidad ?? p.fn_cantidad ?? 0) > 0),
    [piletasFiltradas],
  );

  const piletaOrigenSeleccionada = useMemo(() => {
    if (!form.pileta_origen_id) return null;
    return piletasFiltradas.find(
      (p) => String(p.fi_pileta_id ?? p.pileta_id) === form.pileta_origen_id,
    ) ?? null;
  }, [form.pileta_origen_id, piletasFiltradas]);

  const stockOrigen = useMemo(() => {
    if (!piletaOrigenSeleccionada) return null;
    return Number(piletaOrigenSeleccionada.cantidad ?? piletaOrigenSeleccionada.fn_cantidad ?? 0);
  }, [piletaOrigenSeleccionada]);

  const cantidadExcedeStock =
    !esIngreso &&
    stockOrigen != null &&
    form.cantidad !== "" &&
    Number(form.cantidad) > stockOrigen;

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

  const etiquetaPileta = (p) => {
    const etapa = p.tipo ? p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1) : "";
    const stock = formatNumber(p.cantidad ?? p.fn_cantidad ?? 0);
    return `${p.nombre} (${etapa}) — ${stock} org.`;
  };

  const cargarPiletas = useCallback(async () => {
    try {
      const res = await listPiletas(null);
      const rows = Array.isArray(res.data) ? res.data : [];
      setPiletas(rows.filter((p) => p.tipo === "alevinaje" || p.tipo === "engorda"));
    } catch (err) {
      console.error("Error al cargar piletas:", err);
      setPiletas([]);
    }
  }, []);

  const obtenerTrazabilidad = useCallback(async () => {
    try {
      const data = await fetchMergedPorUbicaciones(filtrosUbicacion, listMovimientos);
      setRastreos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar trazabilidad:", err);
      setRastreos([]);
      showSnackbar(
        err?.response?.data?.error || "No se pudieron cargar los movimientos.",
        "error",
      );
    }
  }, [filtrosUbicacion, showSnackbar]);

  useEffect(() => {
    obtenerTrazabilidad();
    cargarPiletas();
  }, [obtenerTrazabilidad, cargarPiletas]);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  const resetFormulario = () => {
    clearErrors();
    setForm({
      ...formInicial(),
      ubicacion: form.ubicacion || defaultUbicacion || "",
    });
    cerrarFormulario();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cantidad" || name === "mortalidad") {
      if (!soloEntero(value)) return;
    }

    setForm((prev) => {
      if (name === "ubicacion") {
        return {
          ...prev,
          ubicacion: value,
          pileta_origen_id: "",
          pileta_destino_id: "",
        };
      }
      if (name === "tipo_movimiento") {
        return {
          ...prev,
          tipo_movimiento: value,
          pileta_origen_id: "",
          pileta_destino_id: "",
          mortalidad: "",
        };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const registrarMovimiento = async () => {
    if (!validate(form, requiredFields)) return;

    const cantidad = Number(form.cantidad || 0);
    const mortalidad = Number(form.mortalidad || 0);

    if (cantidad < 1) {
      showSnackbar("La cantidad debe ser mayor a cero.", "error");
      return;
    }

    if (esTraslado && mortalidad >= cantidad) {
      showSnackbar("La mortalidad debe ser menor a la cantidad trasladada.", "error");
      return;
    }

    if (esTraslado && form.pileta_origen_id === form.pileta_destino_id) {
      showSnackbar("Origen y destino deben ser piletas distintas.", "error");
      return;
    }

    if (!esIngreso && stockOrigen != null && cantidad > stockOrigen) {
      showSnackbar(
        `La cantidad supera el stock disponible (${formatNumber(stockOrigen)} organismos).`,
        "error",
      );
      return;
    }

    const payload = {
      tipo_movimiento: form.tipo_movimiento,
      cantidad,
      fecha_movimiento: form.fecha_movimiento,
      observacion: form.observacion?.trim() || null,
    };

    if (esMortalidad) {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
    } else if (esIngreso) {
      payload.pileta_destino_id = Number(form.pileta_destino_id);
    } else {
      payload.pileta_origen_id = Number(form.pileta_origen_id);
      payload.pileta_destino_id = Number(form.pileta_destino_id);
      if (mortalidad > 0) payload.mortalidad = mortalidad;
    }

    try {
      await createMovimiento(payload);
      showSnackbar("Movimiento registrado correctamente", "success");
      resetFormulario();
      await Promise.all([obtenerTrazabilidad(), cargarPiletas()]);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.error || "No se pudo registrar el movimiento.",
        "error",
      );
    }
  };

  const rastreosFiltrados = rastreos.filter((r) => {
    const texto = filtroTexto.toLowerCase();

    const coincideTexto =
      r.origen?.toLowerCase().includes(texto) ||
      r.destino?.toLowerCase().includes(texto) ||
      r.observacion?.toLowerCase().includes(texto) ||
      r.fc_etapa?.toLowerCase().includes(texto);

    const coincideEtapa = !filtroEtapa || r.etapa === filtroEtapa;

    const fechaMov = new Date(r.fecha_movimiento);
    const desde = fechaInicio ? new Date(fechaInicio) : null;
    const hasta = fechaFin ? new Date(fechaFin) : null;

    const coincideFecha =
      (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);

    return coincideTexto && coincideEtapa && coincideFecha;
  });

  const gruposRastreos = useMemo(
    () => getGroups(rastreosFiltrados, "fc_granja"),
    [rastreosFiltrados, getGroups],
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        Trazabilidad de Movimientos
      </Typography>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#FFF3E0",
          p: 2,
          mb: 3,
          borderRadius: 2,
          borderLeft: "6px solid #E65100",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Historial unificado de traslados e ingresos entre piletas de alevinaje y engorda.
          Use el formulario para registrar traslados, ingresos externos o mortalidad; el
          inventario de las piletas se actualiza automáticamente.
        </Typography>
      </Paper>

      <FormularioRegistroPanel
        visible={mostrarFormulario}
        onToggle={toggleFormulario}
        label="+ REGISTRAR MOVIMIENTO"
      >
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2} color="#004C7D">
              Nuevo movimiento
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Ubicación"
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
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

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Tipo de movimiento"
                  name="tipo_movimiento"
                  value={form.tipo_movimiento}
                  onChange={handleChange}
                  error={!!errors.tipo_movimiento}
                  helperText={errors.tipo_movimiento}
                >
                  {TIPO_MOVIMIENTO_OPCIONES.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  label="Fecha del movimiento"
                  name="fecha_movimiento"
                  value={form.fecha_movimiento}
                  onChange={handleChange}
                  error={!!errors.fecha_movimiento}
                  helperText={errors.fecha_movimiento || "No puede ser una fecha futura"}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: hoyISO() }}
                />
              </Grid>

              {!esIngreso && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={esMortalidad ? "Pileta" : "Pileta origen"}
                    name="pileta_origen_id"
                    value={form.pileta_origen_id}
                    onChange={handleChange}
                    error={!!errors.pileta_origen_id}
                    helperText={
                      errors.pileta_origen_id ||
                      (esMortalidad
                        ? "Pileta donde se registra la baja"
                        : "Se descontará inventario de esta pileta")
                    }
                  >
                    <MenuItem value="">— Seleccionar —</MenuItem>
                    {piletasConStock.map((p) => (
                      <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                        {etiquetaPileta(p)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {!esMortalidad && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Pileta destino"
                    name="pileta_destino_id"
                    value={form.pileta_destino_id}
                    onChange={handleChange}
                    error={!!errors.pileta_destino_id}
                    helperText={
                      errors.pileta_destino_id ||
                      (esIngreso
                        ? "Se sumará inventario a esta pileta"
                        : "Se sumará inventario (neto de mortalidad)")
                    }
                  >
                    <MenuItem value="">— Seleccionar —</MenuItem>
                    {piletasFiltradas
                      .filter((p) => !esTraslado || String(p.fi_pileta_id ?? p.pileta_id) !== form.pileta_origen_id)
                      .map((p) => (
                        <MenuItem key={p.fi_pileta_id ?? p.pileta_id} value={String(p.fi_pileta_id ?? p.pileta_id)}>
                          {etiquetaPileta(p)}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={esMortalidad ? "Cantidad de baja" : "Cantidad"}
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  error={!!errors.cantidad || cantidadExcedeStock}
                  helperText={
                    errors.cantidad ||
                    (cantidadExcedeStock
                      ? `Supera el stock disponible (${formatNumber(stockOrigen)})`
                      : !esIngreso && stockOrigen != null
                        ? `Máximo disponible: ${formatNumber(stockOrigen)} organismos`
                        : undefined)
                  }
                  inputProps={
                    !esIngreso && stockOrigen != null && stockOrigen > 0
                      ? { max: stockOrigen }
                      : undefined
                  }
                />
              </Grid>

              {esTraslado && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mortalidad en traslado (opcional)"
                    name="mortalidad"
                    value={form.mortalidad}
                    onChange={handleChange}
                    helperText="Organismos que no llegan al destino"
                  />
                </Grid>
              )}

              {!esIngreso && stockOrigen != null && form.pileta_origen_id && (
                <Grid item xs={12}>
                  <Alert severity={stockOrigen > 0 ? "info" : "warning"} sx={{ py: 0.5 }}>
                    Stock en{" "}
                    <strong>{piletaOrigenSeleccionada?.nombre ?? "pileta origen"}</strong>:{" "}
                    {formatNumber(stockOrigen)} organismos
                    {stockOrigen === 0 && " — seleccione otra pileta con inventario disponible"}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  label="Observación"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  inputProps={{ maxLength: MAX_OBSERVACION }}
                  helperText={`${form.observacion.length}/${MAX_OBSERVACION}`}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" color="inherit" onClick={resetFormulario}>
                Cancelar
              </Button>
              <Button variant="contained" onClick={registrarMovimiento} disabled={cantidadExcedeStock}>
                Registrar movimiento
              </Button>
            </Box>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Buscar"
          sx={{ flex: "1 1 200px" }}
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />

        <TextField
          select
          size="small"
          label="Etapa"
          sx={{ minWidth: 180 }}
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value)}
        >
          {ETAPA_OPCIONES.map((op) => (
            <MenuItem key={op.value || "todas"} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </TextField>

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
            setFiltroEtapa("");
            setFechaInicio("");
            setFechaFin("");
          }}
        >
          LIMPIAR
        </Button>
      </Box>

      <TablasPorUbicacionGranja
        grupos={gruposRastreos}
        accordionSx={{ mb: 6, boxShadow: 2 }}
        renderTabla={(rows) => (
          <Paper sx={{ width: "100%", boxShadow: 2 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table stickyHeader sx={{ minWidth: 1060 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Etapa</TableCell>
                    <TableCell>Origen</TableCell>
                    <TableCell>Destino</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.fc_granja}-${r.fi_movimiento_id}`}>
                      <TableCell>
                        {r.fc_etapa ? (
                          <Chip
                            label={r.fc_etapa}
                            size="small"
                            sx={{
                              bgcolor: ETAPA_COLOR[r.etapa] ?? "#757575",
                              color: "#fff",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
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
        )}
      />
    </Box>
  );
}
