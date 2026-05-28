import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listControlReproductivo,
  createControlReproductivo,
  updateControlReproductivo,
  removeControlReproductivo,
  listReproductoresOcupadas,
  getFamiliaPorPileta,
} from "../services/controlReproductivoService";
import { listPiletas } from "../services/piletasService";
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

const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const soloLote = (valor) => valor === "" || /^[A-Za-z0-9-]*$/.test(valor);
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const hoyISO = () => new Date().toISOString().split("T")[0];

const ControlReproductivo = () => {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const requiredFields = [
    "ubicacion",
    "fi_pileta_destino_id",
    "fi_instalacion_id",
    "fecha",
    "lote",
    "fc_familia",
    "alevines_iniciales",
  ];

  const [piletasDestinoAlevinaje, setPiletasDestinoAlevinaje] = useState([]);
  const [piletasReproductoras, setPiletasReproductoras] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    fi_pileta_destino_id: "",
    fi_instalacion_id: "",
    fecha: hoyISO(),
    lote: "",
    fc_familia: "",
    huevos_ml: "",
    ovadas: "",
    machos: "",
    hembras: "",
    cantidad_total: "",
    alevines_iniciales: "",
    mortalidad: "0",
    observacion: "",
  });

  const piletasDestinoFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasDestinoAlevinaje, formData.ubicacion, ubicacionesGranja),
    [piletasDestinoAlevinaje, formData.ubicacion, ubicacionesGranja],
  );

  const piletasReproductorasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasReproductoras, formData.ubicacion, ubicacionesGranja),
    [piletasReproductoras, formData.ubicacion, ubicacionesGranja],
  );

  const gruposRegistros = useMemo(
    () => getGroups(registros, "fc_granja"),
    [getGroups, registros],
  );

  const payloadComunBackend = () => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_origen_reproductora_id: Number(formData.fi_instalacion_id),
    fi_instalacion_id: Number(formData.fi_instalacion_id),
    fecha: formData.fecha || null,
    lote: formData.lote.trim().toUpperCase(),
    familia: formData.fc_familia,
    huevos_ml: formData.huevos_ml === "" ? null : Number(formData.huevos_ml),
    ovadas: Number(formData.ovadas || 0),
    machos: Number(formData.machos || 0),
    hembras: Number(formData.hembras || 0),
    cantidad_total: Number(formData.cantidad_total || 0),
    alevines_iniciales: Number(formData.alevines_iniciales || 0),
    mortalidad: Number(formData.mortalidad || 0),
    observacion: formData.observacion,
  });

  const cargarFamiliaPorOrigen = useCallback(async (piletaId) => {
    if (!piletaId) return;
    try {
      const res = await getFamiliaPorPileta(piletaId);
      const familia = res.data?.familia ?? "";
      if (familia) {
        setFormData((prev) => ({ ...prev, fc_familia: familia }));
      }
    } catch (err) {
      console.error("Error cargando familia:", err);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "lote") {
      if (!soloLote(value)) return;
    }
    if (
      name === "ovadas" ||
      name === "machos" ||
      name === "hembras" ||
      name === "cantidad_total" ||
      name === "alevines_iniciales" ||
      name === "mortalidad"
    ) {
      if (!soloEntero(value)) return;
    }
    if (name === "huevos_ml") {
      if (!soloDecimal(value)) return;
    }

    setFormData((prev) => {
      if (name === "ubicacion") {
        return {
          ...prev,
          ubicacion: value,
          fi_pileta_destino_id: "",
          fi_instalacion_id: "",
          fc_familia: "",
        };
      }
      if (name === "fi_instalacion_id") {
        return { ...prev, fi_instalacion_id: value, fc_familia: "" };
      }
      if (name === "machos" || name === "hembras") {
        const m = name === "machos" ? Number(value || 0) : Number(prev.machos || 0);
        const h = name === "hembras" ? Number(value || 0) : Number(prev.hembras || 0);
        return {
          ...prev,
          [name]: value,
          cantidad_total: m + h > 0 ? String(m + h) : prev.cantidad_total,
        };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarPiletasDestino = useCallback(async () => {
    try {
      const res = await listPiletas(null, "alevinaje");
      setPiletasDestinoAlevinaje(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas alevinaje:", err);
    }
  }, []);

  const cargarReproductoresOcupadas = useCallback(async (ubicacion) => {
    if (!ubicacion) {
      setPiletasReproductoras([]);
      return;
    }
    try {
      const res = await listReproductoresOcupadas({ granja: ubicacion });
      setPiletasReproductoras(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas reproductoras:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listControlReproductivo();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando control reproductivo:", err);
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

  useEffect(() => {
    cargarReproductoresOcupadas(formData.ubicacion);
  }, [formData.ubicacion, cargarReproductoresOcupadas]);

  useEffect(() => {
    if (formData.fi_instalacion_id && !modoEdicion) {
      cargarFamiliaPorOrigen(Number(formData.fi_instalacion_id));
    }
  }, [formData.fi_instalacion_id, modoEdicion, cargarFamiliaPorOrigen]);

  const registrar = async () => {
    if (!validate(formData, requiredFields)) return;
    if (Number(formData.alevines_iniciales || 0) < 1) {
      showSnackbar("Los alevines iniciales deben ser mayor a cero.", "error");
      return;
    }
    try {
      await createControlReproductivo(payloadComunBackend());
      showSnackbar("Lote registrado en control reproductivo", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      console.error("Error al registrar control reproductivo:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar",
        "error",
      );
    }
  };

  const activarEdicion = () => {
    if (!seleccionado) return;
    clearErrors();
    setFormData({
      ubicacion: seleccionado.fc_granja || formData.ubicacion || defaultUbicacion || "",
      fi_pileta_destino_id: String(
        seleccionado.fi_pileta_destino_id ?? seleccionado.pileta_id ?? "",
      ),
      fi_instalacion_id: String(
        seleccionado.fi_instalacion_id ?? seleccionado.pileta_origen_reproductora_id ?? "",
      ),
      fecha: seleccionado.fecha
        ? String(seleccionado.fecha).split("T")[0]
        : hoyISO(),
      lote: seleccionado.lote ?? seleccionado.fc_lote ?? "",
      fc_familia: seleccionado.fc_familia ?? seleccionado.familia ?? "",
      huevos_ml: seleccionado.huevos_ml != null ? String(seleccionado.huevos_ml) : "",
      ovadas: String(seleccionado.ovadas ?? ""),
      machos: String(seleccionado.machos ?? ""),
      hembras: String(seleccionado.hembras ?? ""),
      cantidad_total: String(seleccionado.cantidad_total ?? ""),
      alevines_iniciales: String(seleccionado.alevines_iniciales ?? ""),
      mortalidad: String(seleccionado.mortalidad ?? "0"),
      observacion: seleccionado.observacion ?? seleccionado.fc_observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizarRegistro = async () => {
    if (!validate(formData, requiredFields)) return;
    if (Number(formData.alevines_iniciales || 0) < 1) {
      showSnackbar("Los alevines iniciales deben ser mayor a cero.", "error");
      return;
    }
    try {
      await updateControlReproductivo(
        seleccionado.fi_id ?? seleccionado.id,
        payloadComunBackend(),
      );
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      console.error("Error al actualizar control reproductivo:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "No se pudo actualizar",
        "error",
      );
    }
  };

  const eliminarRegistro = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro de control reproductivo?")) return;
    try {
      await removeControlReproductivo(id);
      showSnackbar("Registro eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      console.error("Error al eliminar:", err);
      showSnackbar("No se pudo eliminar", "error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      fi_pileta_destino_id: "",
      fi_instalacion_id: "",
      fecha: hoyISO(),
      lote: "",
      fc_familia: "",
      huevos_ml: "",
      ovadas: "",
      machos: "",
      hembras: "",
      cantidad_total: "",
      alevines_iniciales: "",
      mortalidad: "0",
      observacion: "",
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
    if (!fechaISO) return "";
    const d = new Date(fechaISO);
    return d.toLocaleDateString("es-MX");
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num);
    if (Number.isInteger(n)) return n.toString();
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        Control Reproductivo
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
            {modoEdicion ? "Editar lote" : "Registrar nuevo lote"}
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
                label="Pileta reproductora (origen)"
                name="fi_instalacion_id"
                value={formData.fi_instalacion_id || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_instalacion_id}
                {...(errors.fi_instalacion_id ? { helperText: errors.fi_instalacion_id } : {})}
              >
                {piletasReproductorasFiltradas.map((p) => {
                  const pid = p.fi_pileta_id ?? p.pileta_id ?? p.fi_instalacion_id;
                  return (
                    <MenuItem key={pid} value={String(pid)}>
                      {p.nombre_pileta ?? p.nombre_instalacion ?? p.nombre}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Pileta destino (alevinaje)"
                name="fi_pileta_destino_id"
                value={formData.fi_pileta_destino_id || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_pileta_destino_id}
                {...(errors.fi_pileta_destino_id ? { helperText: errors.fi_pileta_destino_id } : {})}
              >
                {piletasDestinoFiltradas.map((p) => {
                  const pid = p.fi_pileta_id ?? p.pileta_id;
                  return (
                    <MenuItem key={pid} value={String(pid)}>
                      {p.nombre}
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha}
                {...(errors.fecha ? { helperText: errors.fecha } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="No. Lote"
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                fullWidth
                inputProps={{ style: { textTransform: "uppercase" } }}
                error={!!errors.lote}
                {...(errors.lote ? { helperText: errors.lote } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Familia"
                name="fc_familia"
                value={formData.fc_familia}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_familia}
                {...(errors.fc_familia ? { helperText: errors.fc_familia } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Huevos (ml)"
                name="huevos_ml"
                value={formData.huevos_ml}
                onChange={handleChange}
                fullWidth
                inputProps={{ inputMode: "decimal" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Ovadas"
                name="ovadas"
                value={formData.ovadas}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Machos"
                name="machos"
                value={formData.machos}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Hembras"
                name="hembras"
                value={formData.hembras}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Cantidad total"
                name="cantidad_total"
                value={formData.cantidad_total}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Alevines iniciales"
                name="alevines_iniciales"
                value={formData.alevines_iniciales}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 1, inputMode: "numeric" }}
                error={!!errors.alevines_iniciales}
                {...(errors.alevines_iniciales ? { helperText: errors.alevines_iniciales } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Mortalidad"
                name="mortalidad"
                value={formData.mortalidad}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Observación"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: MAX_OBSERVACION }}
              />
            </Grid>

            <Grid size={12}>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                color="success"
                onClick={modoEdicion ? actualizarRegistro : registrar}
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {modoEdicion ? "Guardar cambios" : "Registrar lote"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#023047" }}>
        Registros (control reproductivo)
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => (
          <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 1100 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lote</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Origen</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Destino</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Familia</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ovadas</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Alevines</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mortalidad</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((l) => (
                      <TableRow
                        key={l.fi_id ?? l.id}
                        onClick={() => setSeleccionado(l)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            (seleccionado?.fi_id ?? seleccionado?.id) === (l.fi_id ?? l.id)
                              ? "#e0f7fa"
                              : "transparent",
                        }}
                      >
                        <TableCell>{formatearFecha(l.fecha ?? l.fd_fecha)}</TableCell>
                        <TableCell>{l.lote ?? l.fc_lote ?? "—"}</TableCell>
                        <TableCell>{l.nombre_pileta_origen ?? l.nombre_instalacion ?? "—"}</TableCell>
                        <TableCell>{l.nombre_pileta_destino ?? l.nombre_pileta ?? "—"}</TableCell>
                        <TableCell>{l.familia ?? l.fc_familia ?? "—"}</TableCell>
                        <TableCell>{formatNumber(l.ovadas)}</TableCell>
                        <TableCell>{formatNumber(l.alevines_iniciales)}</TableCell>
                        <TableCell>{formatNumber(l.mortalidad)}</TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <span title={l.observacion || ""}>
                            {l.observacion ? truncar(l.observacion) : "—"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
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
            onClick={() => eliminarRegistro(seleccionado.fi_id ?? seleccionado.id)}
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
};

export default ControlReproductivo;
