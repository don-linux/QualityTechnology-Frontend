import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listIncubacion,
  createIncubacion,
  updateIncubacion,
  removeIncubacion,
} from "../services/incubacionService";
import { listObservacionesPileta } from "../services/piletasService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
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
import { listPiletas } from "../services/piletasService";

const MAX_OBSERVACION = 500;

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const soloLote = (valor) => valor === "" || /^[A-Za-z0-9-]*$/.test(valor);
const hoyISO = () => new Date().toISOString().split("T")[0];

function calcularDiasEnPileta(fechaIngreso, fechaEgreso) {
  if (!fechaIngreso) return "";
  const inicio = new Date(`${fechaIngreso}T00:00:00`);
  const fin = fechaEgreso ? new Date(`${fechaEgreso}T00:00:00`) : new Date();
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return "";
  const diff = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
  return String(Math.max(0, diff));
}

const Incubacion = () => {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const requiredFields = [
    "ubicacion",
    "fi_pileta_destino_id",
    "lote",
    "fecha_ingreso",
  ];

  const [piletasDestinoIncubacion, setPiletasDestinoIncubacion] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    fi_pileta_destino_id: "",
    lote: "",
    huevos_ml: "",
    fecha_ingreso: hoyISO(),
    dias_en_pileta: "",
    fecha_egreso: "",
    observacion: "",
  });

  const piletasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasDestinoIncubacion, formData.ubicacion, ubicacionesGranja),
    [piletasDestinoIncubacion, formData.ubicacion, ubicacionesGranja],
  );

  const registrosVista = useMemo(() => vistaActualPorPileta(registros), [registros]);

  const gruposRegistros = useMemo(
    () => getGroups(registrosVista, "fc_granja"),
    [getGroups, registrosVista],
  );

  const payloadComunBackend = () => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_destino_id: Number(formData.fi_pileta_destino_id),
    lote: formData.lote.trim().toUpperCase(),
    huevos_ml: formData.huevos_ml === "" ? null : Number(formData.huevos_ml),
    fecha_ingreso: formData.fecha_ingreso || null,
    dias_en_pileta: formData.dias_en_pileta === "" ? null : Number(formData.dias_en_pileta),
    fecha_egreso: formData.fecha_egreso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "lote") {
      if (!soloLote(value)) return;
    }
    if (name === "huevos_ml" || name === "dias_en_pileta") {
      if (name === "huevos_ml" && !soloDecimal(value)) return;
      if (name === "dias_en_pileta" && !soloEntero(value)) return;
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "ubicacion") {
        return { ...next, fi_pileta_destino_id: "" };
      }
      if (name === "fecha_ingreso" || name === "fecha_egreso") {
        const ingreso = name === "fecha_ingreso" ? value : prev.fecha_ingreso;
        const egreso = name === "fecha_egreso" ? value : prev.fecha_egreso;
        next.dias_en_pileta = calcularDiasEnPileta(ingreso, egreso);
      }
      return next;
    });
    clearFieldError(name);
  };

  const cargarPiletasDestinoIncubacion = useCallback(async () => {
    try {
      const res = await listPiletas(null, "incubacion");
      setPiletasDestinoIncubacion(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas incubación:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listIncubacion();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando registros de incubación:", err);
    }
  }, []);

  useEffect(() => {
    cargarPiletasDestinoIncubacion();
    cargarRegistros();
  }, [cargarPiletasDestinoIncubacion, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const registrarIncubacion = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await createIncubacion(payloadComunBackend());
      showSnackbar("Registro periódico guardado (vista actual actualizada)", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      console.error("Error al registrar incubación:", err);
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
    const fechaIngreso = seleccionado.fecha_ingreso
      ? String(seleccionado.fecha_ingreso).split("T")[0]
      : "";
    const fechaEgreso = seleccionado.fecha_egreso
      ? String(seleccionado.fecha_egreso).split("T")[0]
      : "";
    setFormData({
      ubicacion: seleccionado.fc_granja || formData.ubicacion || defaultUbicacion || "",
      fi_pileta_destino_id: String(
        seleccionado.fi_pileta_destino_id ?? seleccionado.pileta_destino_id ?? seleccionado.pileta_id ?? "",
      ),
      lote: seleccionado.lote ?? seleccionado.fc_lote ?? "",
      huevos_ml: seleccionado.huevos_ml != null ? String(seleccionado.huevos_ml) : "",
      fecha_ingreso: fechaIngreso,
      dias_en_pileta:
        seleccionado.dias_en_pileta != null
          ? String(seleccionado.dias_en_pileta)
          : calcularDiasEnPileta(fechaIngreso, fechaEgreso),
      fecha_egreso: fechaEgreso,
      observacion: seleccionado.observacion ?? seleccionado.fc_observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizarIncubacionRegistro = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await updateIncubacion(
        seleccionado.fi_id ?? seleccionado.id,
        payloadComunBackend(),
      );
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      console.error("Error al actualizar incubación:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "No se pudo actualizar",
        "error",
      );
    }
  };

  const eliminarIncubacionRegistro = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro de incubación?")) return;
    try {
      await removeIncubacion(id);
      showSnackbar("Registro eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      console.error("Error al eliminar incubación:", err);
      showSnackbar("No se pudo eliminar", "error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      fi_pileta_destino_id: "",
      lote: "",
      huevos_ml: "",
      fecha_ingreso: hoyISO(),
      dias_en_pileta: "0",
      fecha_egreso: "",
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

  const cargarHistorialObservaciones = useCallback(
    (piletaId) => listObservacionesPileta(piletaId),
    [],
  );

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        Incubación
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
            {modoEdicion ? "Editar registro" : "Registrar nueva incubación"}
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
                label="Pileta (incubación)"
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
                label="Lote"
                name="lote"
                value={formData.lote}
                onChange={handleChange}
                fullWidth
                inputProps={{ style: { textTransform: "uppercase" } }}
                error={!!errors.lote}
                {...(errors.lote ? { helperText: errors.lote } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Huevos/ml"
                name="huevos_ml"
                value={formData.huevos_ml}
                onChange={handleChange}
                fullWidth
                inputProps={{ inputMode: "decimal" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Fecha de ingreso"
                type="date"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha_ingreso}
                {...(errors.fecha_ingreso ? { helperText: errors.fecha_ingreso } : {})}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Días en pileta"
                name="dias_en_pileta"
                value={formData.dias_en_pileta}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 0, inputMode: "numeric" }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 2 }}>
              <TextField
                label="Fecha de egreso"
                type="date"
                name="fecha_egreso"
                value={formData.fecha_egreso}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
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
                onClick={modoEdicion ? actualizarIncubacionRegistro : registrarIncubacion}
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {modoEdicion ? "Guardar cambios" : "Registrar incubación"}
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
        Muestra el último registro periódico de cada pileta. El historial de movimientos está en Trazabilidad.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => (
          <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pileta</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lote</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Huevos/ml</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha ingreso</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Días en pileta</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha egreso</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
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
                        <TableCell>
                          {l.nombre_pileta_destino || l.nombre_pileta || "—"}
                        </TableCell>
                        <TableCell>{l.lote ?? l.fc_lote ?? "—"}</TableCell>
                        <TableCell>{formatNumber(l.huevos_ml ?? l.fn_huevos_ml)}</TableCell>
                        <TableCell>{formatearFecha(l.fecha_ingreso ?? l.fd_fecha_ingreso)}</TableCell>
                        <TableCell>{formatNumber(l.dias_en_pileta ?? l.fn_dias_en_pileta)}</TableCell>
                        <TableCell>{formatearFecha(l.fecha_egreso ?? l.fd_fecha_egreso)}</TableCell>
                        <TableCell sx={{ maxWidth: 220, verticalAlign: "top" }}>
                          <CeldaObservacionConHistorial
                            texto={l.observacion ?? l.fc_observacion ?? ""}
                            piletaId={
                              l.fi_pileta_destino_id ?? l.pileta_destino_id ?? l.pileta_id
                            }
                            piletaNombre={l.nombre_pileta_destino || l.nombre_pileta}
                            etapaLabel="Incubación"
                            cargarHistorial={cargarHistorialObservaciones}
                          />
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
            onClick={() => eliminarIncubacionRegistro(seleccionado.fi_id ?? seleccionado.id)}
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

export default Incubacion;
