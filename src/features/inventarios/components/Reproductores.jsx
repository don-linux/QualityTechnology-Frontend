import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listReproductores,
  createReproductor,
  updateReproductor,
  removeReproductor,
} from "../services/reproductoresService";
import { listObservacionesPileta, listPiletas } from "../services/piletasService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { filtrarPorUbicacion } from "@shared/utils/fetchMergedPorUbicaciones";
import { vistaActualPorPileta } from "@shared/utils/inventarioVigente";

const MAX_OBSERVACION = 500;
const MAX_TEXTO_CORTO = 60;
const MAX_PROCEDENCIA = 100;

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

const REPRODUCTOR_FORM_REQUIRED = [
  "ubicacion",
  "fi_pileta_destino_id",
  "fn_machos",
  "fc_genetica_machos",
  "fc_familia_machos",
  "fc_procedencia_machos",
  "fn_hembras",
  "fc_genetica_hembras",
  "fc_familia_hembras",
  "fc_procedencia_hembras",
  "fn_talla",
  "observacion",
];

const FORM_INICIAL = {
  ubicacion: "",
  fi_pileta_destino_id: "",
  fn_machos: "",
  fc_genetica_machos: "",
  fc_familia_machos: "",
  fc_procedencia_machos: "",
  fn_hembras: "",
  fc_genetica_hembras: "",
  fc_familia_hembras: "",
  fc_procedencia_hembras: "",
  fn_cantidad: "",
  fc_ratio: "",
  fn_talla: "",
  observacion: "",
};

function aplicarMachosHembras(prev, machosRaw, hembrasRaw) {
  const m = Math.max(0, Number(machosRaw) || 0);
  const h = Math.max(0, Number(hembrasRaw) || 0);
  const total = m + h;
  let ratio = "";
  if (m > 0 && h > 0) {
    ratio = `1:${Math.round((h / m) * 100) / 100}`;
  }
  return {
    ...prev,
    fn_machos: machosRaw === "" && m === 0 ? "" : String(m),
    fn_hembras: hembrasRaw === "" && h === 0 ? "" : String(h),
    fn_cantidad: total > 0 ? String(total) : "",
    fc_ratio: ratio,
  };
}

const colorDias = (dias) => {
  if (dias === null || dias === undefined || dias === "") return "inherit";
  const d = Number(dias);
  if (Number.isNaN(d)) return "inherit";
  if (d <= 10) return "#2e7d32";
  if (d <= 15) return "#f9a825";
  return "#c62828";
};

export default function Reproductores() {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const [piletasDestino, setPiletasDestino] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({ ...FORM_INICIAL });

  const piletasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasDestino, formData.ubicacion, ubicacionesGranja),
    [piletasDestino, formData.ubicacion, ubicacionesGranja],
  );

  const registrosVista = useMemo(() => vistaActualPorPileta(registros), [registros]);

  const gruposRegistros = useMemo(
    () => getGroups(registrosVista, "fc_granja"),
    [getGroups, registrosVista],
  );

  const payloadComunBackend = () => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_destino_id: Number(formData.fi_pileta_destino_id),
    machos: Number(formData.fn_machos || 0),
    hembras: Number(formData.fn_hembras || 0),
    genetica_machos: formData.fc_genetica_machos,
    familia_machos: formData.fc_familia_machos,
    procedencia_machos: formData.fc_procedencia_machos,
    genetica_hembras: formData.fc_genetica_hembras,
    familia_hembras: formData.fc_familia_hembras,
    procedencia_hembras: formData.fc_procedencia_hembras,
    talla: formData.fn_talla === "" ? null : Number(formData.fn_talla),
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fn_machos" || name === "fn_hembras") {
      if (!soloEntero(value)) return;
    }
    if (name === "fn_talla") {
      if (!soloDecimal(value)) return;
    }

    setFormData((prev) => {
      if (name === "ubicacion") {
        return { ...prev, ubicacion: value, fi_pileta_destino_id: "" };
      }
      if (name === "fn_machos") {
        return aplicarMachosHembras(prev, value, prev.fn_hembras);
      }
      if (name === "fn_hembras") {
        return aplicarMachosHembras(prev, prev.fn_machos, value);
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarPiletasDestino = useCallback(async () => {
    try {
      const res = await listPiletas(null, "reproductores");
      setPiletasDestino(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas reproductores:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listReproductores();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando reproductores:", err);
    }
  }, []);

  useEffect(() => {
    cargarPiletasDestino();
    cargarRegistros();
  }, [cargarPiletasDestino, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const validarTotalPositivo = () => {
    const total = Number(formData.fn_machos || 0) + Number(formData.fn_hembras || 0);
    if (total < 1) {
      showSnackbar("Debe haber al menos un macho o una hembra.", "error");
      return false;
    }
    return true;
  };

  const registrarReproductor = async () => {
    if (!validate(formData, REPRODUCTOR_FORM_REQUIRED)) return;
    if (!validarTotalPositivo()) return;
    try {
      await createReproductor(payloadComunBackend());
      showSnackbar("Registro guardado (vista actual actualizada)", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      console.error("Error al registrar reproductor:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar",
        "error",
      );
    }
  };

  const mapSeleccionadoAForm = (row) => ({
    ubicacion: row.fc_granja || defaultUbicacion || "",
    fi_pileta_destino_id: String(
      row.fi_pileta_destino_id ?? row.pileta_destino_id ?? row.pileta_id ?? "",
    ),
    fn_machos: String(row.fn_machos ?? row.machos ?? ""),
    fc_genetica_machos: row.fc_genetica_machos ?? row.genetica_machos ?? "",
    fc_familia_machos: row.fc_familia_machos ?? row.familia_machos ?? "",
    fc_procedencia_machos: row.fc_procedencia_machos ?? row.procedencia_machos ?? "",
    fn_hembras: String(row.fn_hembras ?? row.hembras ?? ""),
    fc_genetica_hembras: row.fc_genetica_hembras ?? row.genetica_hembras ?? "",
    fc_familia_hembras: row.fc_familia_hembras ?? row.familia_hembras ?? "",
    fc_procedencia_hembras: row.fc_procedencia_hembras ?? row.procedencia_hembras ?? "",
    fn_cantidad: String(row.fn_cantidad ?? row.cantidad_total ?? row.cantidad ?? ""),
    fc_ratio: row.fc_ratio ?? row.ratio ?? "",
    fn_talla:
      row.fn_talla != null
        ? String(row.fn_talla)
        : row.talla != null
          ? String(row.talla)
          : "",
    observacion: row.observacion ?? row.fc_observacion ?? "",
  });

  const activarEdicion = () => {
    if (!seleccionado) return;
    clearErrors();
    setFormData(mapSeleccionadoAForm(seleccionado));
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizarRegistro = async () => {
    if (!validate(formData, REPRODUCTOR_FORM_REQUIRED)) return;
    if (!validarTotalPositivo()) return;
    try {
      await updateReproductor(
        seleccionado.fi_reproductor_id ?? seleccionado.fi_id ?? seleccionado.id,
        payloadComunBackend(),
      );
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      console.error("Error al actualizar reproductor:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "No se pudo actualizar",
        "error",
      );
    }
  };

  const eliminarRegistro = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro de reproductores?")) return;
    try {
      await removeReproductor(id);
      showSnackbar("Registro eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      console.error("Error al eliminar reproductor:", err);
      showSnackbar("No se pudo eliminar", "error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      ...FORM_INICIAL,
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
    });
    clearErrors();
    cerrarFormulario();
  };

  const resetEdicion = () => {
    setModoEdicion(false);
    setSeleccionado(null);
    resetFormulario();
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "—";
    const d = new Date(fechaISO);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-MX");
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "—";
    const n = Number(num);
    if (Number.isNaN(n)) return "—";
    if (Number.isInteger(n)) return n.toLocaleString("es-MX");
    return n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  };

  const totalOrganismos = registros.reduce(
    (acc, r) => acc + Number(r.fn_cantidad ?? r.cantidad_total ?? 0),
    0,
  );

  const cargarHistorialObservaciones = useCallback(
    (piletaId) => listObservacionesPileta(piletaId),
    [],
  );

  const headerCell = { color: "white", fontWeight: "bold", whiteSpace: "nowrap" };

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        Reproductores
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Registros:</b> {registros.length}</Typography>
        <Typography>
          <b>Total reproductores (vista):</b> {totalOrganismos.toLocaleString("es-MX")}
        </Typography>
      </Paper>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
              {modoEdicion ? "Editar registro" : "Registrar nuevo inventario"}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Ubicación"
                  name="ubicacion"
                  value={formData.ubicacion || ""}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.ubicacion}
                  {...(errors.ubicacion ? { helperText: errors.ubicacion } : {})}
                >
                  {ubicacionesGranja.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  label="Pileta (reproductores)"
                  name="fi_pileta_destino_id"
                  value={formData.fi_pileta_destino_id || ""}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fi_pileta_destino_id}
                  {...(errors.fi_pileta_destino_id ? { helperText: errors.fi_pileta_destino_id } : {})}
                >
                  {piletasFiltradas.map((p) => {
                    const pid = p.fi_pileta_id ?? p.pileta_id;
                    return (
                      <MenuItem key={pid} value={String(pid)}>
                        {p.nombre}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Machos"
                  name="fn_machos"
                  value={formData.fn_machos}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, inputMode: "numeric" }}
                  error={!!errors.fn_machos}
                  {...(errors.fn_machos ? { helperText: errors.fn_machos } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Genética machos"
                  name="fc_genetica_machos"
                  value={formData.fc_genetica_machos}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                  error={!!errors.fc_genetica_machos}
                  {...(errors.fc_genetica_machos ? { helperText: errors.fc_genetica_machos } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Familia machos"
                  name="fc_familia_machos"
                  value={formData.fc_familia_machos}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                  error={!!errors.fc_familia_machos}
                  {...(errors.fc_familia_machos ? { helperText: errors.fc_familia_machos } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Procedencia machos"
                  name="fc_procedencia_machos"
                  value={formData.fc_procedencia_machos}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_PROCEDENCIA }}
                  error={!!errors.fc_procedencia_machos}
                  {...(errors.fc_procedencia_machos ? { helperText: errors.fc_procedencia_machos } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Hembras"
                  name="fn_hembras"
                  value={formData.fn_hembras}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, inputMode: "numeric" }}
                  error={!!errors.fn_hembras}
                  {...(errors.fn_hembras ? { helperText: errors.fn_hembras } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Genética hembras"
                  name="fc_genetica_hembras"
                  value={formData.fc_genetica_hembras}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                  error={!!errors.fc_genetica_hembras}
                  {...(errors.fc_genetica_hembras ? { helperText: errors.fc_genetica_hembras } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Familia hembras"
                  name="fc_familia_hembras"
                  value={formData.fc_familia_hembras}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                  error={!!errors.fc_familia_hembras}
                  {...(errors.fc_familia_hembras ? { helperText: errors.fc_familia_hembras } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Procedencia hembras"
                  name="fc_procedencia_hembras"
                  value={formData.fc_procedencia_hembras}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_PROCEDENCIA }}
                  error={!!errors.fc_procedencia_hembras}
                  {...(errors.fc_procedencia_hembras ? { helperText: errors.fc_procedencia_hembras } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Total reproductores"
                  name="fn_cantidad"
                  value={formData.fn_cantidad}
                  fullWidth
                  disabled
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Relación (H/M)"
                  name="fc_ratio"
                  value={formData.fc_ratio}
                  fullWidth
                  disabled
                  placeholder="1:X"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Talla (Gr)"
                  name="fn_talla"
                  value={formData.fn_talla}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "decimal" }}
                  error={!!errors.fn_talla}
                  {...(errors.fn_talla ? { helperText: errors.fn_talla } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Observaciones"
                  name="observacion"
                  value={formData.observacion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  inputProps={{ maxLength: MAX_OBSERVACION }}
                  error={!!errors.observacion}
                  {...(errors.observacion ? { helperText: errors.observacion } : {})}
                />
              </Grid>

              <Grid size={12}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  color="success"
                  onClick={modoEdicion ? actualizarRegistro : registrarReproductor}
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  {modoEdicion ? "Guardar cambios" : "Registrar reproductor"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: "bold", color: "#023047" }}>
        Estado actual por pileta
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Muestra el último registro periódico de cada pileta. Fechas y días se calculan al consultar.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => (
          <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 2200 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={headerCell}>Pileta</TableCell>
                    <TableCell sx={headerCell}>Machos</TableCell>
                    <TableCell sx={headerCell}>Genética machos</TableCell>
                    <TableCell sx={headerCell}>Familia machos</TableCell>
                    <TableCell sx={headerCell}>Procedencia machos</TableCell>
                    <TableCell sx={headerCell}>Hembras</TableCell>
                    <TableCell sx={headerCell}>Genética hembras</TableCell>
                    <TableCell sx={headerCell}>Familia hembras</TableCell>
                    <TableCell sx={headerCell}>Procedencia hembras</TableCell>
                    <TableCell sx={headerCell}>Total</TableCell>
                    <TableCell sx={headerCell}>Relación</TableCell>
                    <TableCell sx={headerCell}>Talla (Gr)</TableCell>
                    <TableCell sx={headerCell}>Observaciones</TableCell>
                    <TableCell sx={headerCell}>Fecha siembra</TableCell>
                    <TableCell sx={headerCell}>Días en pila</TableCell>
                    <TableCell sx={headerCell}>Últ. biometría</TableCell>
                    <TableCell sx={headerCell}>Días biometría</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={17} align="center">
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((l) => {
                      const diasPila = l.fn_dias_en_pila ?? l.dias_en_pila;
                      const diasBio =
                        l.fn_dias_biometria ?? l.dias_transcurridos_biometria;
                      return (
                        <TableRow
                          key={l.fi_reproductor_id ?? l.fi_id ?? l.id}
                          onClick={() => setSeleccionado(l)}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              (seleccionado?.fi_reproductor_id ?? seleccionado?.fi_id ?? seleccionado?.id) ===
                              (l.fi_reproductor_id ?? l.fi_id ?? l.id)
                                ? "#e0f7fa"
                                : "transparent",
                          }}
                        >
                          <TableCell>{l.nombre_pileta_destino || l.nombre_pileta || "—"}</TableCell>
                          <TableCell>{formatNumber(l.fn_machos ?? l.machos)}</TableCell>
                          <TableCell>{l.fc_genetica_machos ?? l.genetica_machos ?? "—"}</TableCell>
                          <TableCell>{l.fc_familia_machos ?? l.familia_machos ?? "—"}</TableCell>
                          <TableCell>{l.fc_procedencia_machos ?? l.procedencia_machos ?? "—"}</TableCell>
                          <TableCell>{formatNumber(l.fn_hembras ?? l.hembras)}</TableCell>
                          <TableCell>{l.fc_genetica_hembras ?? l.genetica_hembras ?? "—"}</TableCell>
                          <TableCell>{l.fc_familia_hembras ?? l.familia_hembras ?? "—"}</TableCell>
                          <TableCell>{l.fc_procedencia_hembras ?? l.procedencia_hembras ?? "—"}</TableCell>
                          <TableCell>{formatNumber(l.fn_cantidad ?? l.cantidad_total)}</TableCell>
                          <TableCell>{l.fc_ratio ?? l.ratio ?? "—"}</TableCell>
                          <TableCell>{formatNumber(l.fn_talla ?? l.talla)}</TableCell>
                          <TableCell sx={{ maxWidth: 200, verticalAlign: "top" }}>
                            <CeldaObservacionConHistorial
                              texto={l.observacion ?? l.fc_observacion ?? ""}
                              piletaId={
                                l.fi_pileta_destino_id ?? l.pileta_destino_id ?? l.pileta_id
                              }
                              piletaNombre={l.nombre_pileta_destino || l.nombre_pileta}
                              etapaLabel="Reproductores"
                              cargarHistorial={cargarHistorialObservaciones}
                            />
                          </TableCell>
                          <TableCell>{formatearFecha(l.fd_fecha_siembra)}</TableCell>
                          <TableCell>
                            <Box component="span" sx={{ color: colorDias(diasPila), fontWeight: "bold" }}>
                              {diasPila != null && diasPila !== "" ? diasPila : "—"}
                            </Box>
                          </TableCell>
                          <TableCell>{formatearFecha(l.fd_fecha_biometria)}</TableCell>
                          <TableCell>
                            <Box component="span" sx={{ color: colorDias(diasBio), fontWeight: "bold" }}>
                              {diasBio != null && diasBio !== "" ? diasBio : "—"}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      />

      {seleccionado && (
        <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
          <Button variant="contained" color="warning" onClick={activarEdicion}>
            Editar registro
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              eliminarRegistro(seleccionado.fi_reproductor_id ?? seleccionado.fi_id ?? seleccionado.id)
            }
          >
            Eliminar registro
          </Button>
          <Button variant="outlined" color="inherit" onClick={resetEdicion}>
            Cerrar
          </Button>
        </div>
      )}

      {ConfirmModal}
    </div>
  );
}
