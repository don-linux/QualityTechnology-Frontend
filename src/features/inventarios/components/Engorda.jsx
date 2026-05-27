import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listEngordas,
  createEngorda,
  updateEngorda,
  removeEngorda,
} from "../services/engordaService";
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

export default function Engorda() {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const requiredFields = [
    "ubicacion",
    "fi_pileta_destino_id",
    "cantidad_total",
    "fecha_peso",
    "peso_kg",
  ];

  const [piletasDestinoEngorda, setPiletasDestinoEngorda] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    fi_pileta_destino_id: "",
    cantidad_total: "",
    cantidad_alimento: "",
    peso_kg: "",
    fecha_peso: "",
    observacion: "",
  });

  const piletasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasDestinoEngorda, formData.ubicacion, ubicacionesGranja),
    [piletasDestinoEngorda, formData.ubicacion, ubicacionesGranja],
  );

  const registrosVista = useMemo(() => vistaActualPorPileta(registros), [registros]);

  const gruposRegistros = useMemo(
    () => getGroups(registrosVista, "fc_granja"),
    [getGroups, registrosVista],
  );

  const payloadComunBackend = () => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_destino_id: Number(formData.fi_pileta_destino_id),
    cantidad_total: Number(formData.cantidad_total || 0),
    cantidad_alimento: Number(formData.cantidad_alimento || 0),
    peso_kg: formData.peso_kg === "" ? null : Number(formData.peso_kg),
    fecha_peso: formData.fecha_peso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cantidad_total" || name === "cantidad_alimento") {
      if (!soloEntero(value)) return;
    }
    if (name === "peso_kg") {
      if (!soloDecimal(value)) return;
    }

    setFormData((prev) => {
      if (name === "ubicacion") {
        return { ...prev, ubicacion: value, fi_pileta_destino_id: "" };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarPiletasDestinoEngorda = useCallback(async () => {
    try {
      const res = await listPiletas(null, "engorda");
      setPiletasDestinoEngorda(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas engorda:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listEngordas();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando registros de engorda:", err);
    }
  }, []);

  useEffect(() => {
    cargarPiletasDestinoEngorda();
    cargarRegistros();
  }, [cargarPiletasDestinoEngorda, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const registrarEngorda = async () => {
    if (!validate(formData, requiredFields)) return;
    if (Number(formData.cantidad_total || 0) < 1) {
      showSnackbar("La cantidad total debe ser mayor a cero.", "error");
      return;
    }
    try {
      await createEngorda(payloadComunBackend());
      showSnackbar("Registro periódico guardado (vista actual actualizada)", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      console.error("Error al registrar engorda:", err);
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
        seleccionado.fi_pileta_destino_id ?? seleccionado.pileta_destino_id ?? seleccionado.pileta_id ?? "",
      ),
      cantidad_total: String(seleccionado.cantidad_total ?? seleccionado.cantidad ?? ""),
      cantidad_alimento: String(seleccionado.cantidad_alimento ?? ""),
      peso_kg:
        seleccionado.peso_kg != null
          ? String(seleccionado.peso_kg)
          : seleccionado.peso != null
            ? String(seleccionado.peso)
            : "",
      fecha_peso: seleccionado.fecha_peso
        ? String(seleccionado.fecha_peso).split("T")[0]
        : "",
      observacion: seleccionado.observacion ?? seleccionado.fc_observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizarEngordaRegistro = async () => {
    if (!validate(formData, requiredFields)) return;
    if (Number(formData.cantidad_total || 0) < 1) {
      showSnackbar("La cantidad total debe ser mayor a cero.", "error");
      return;
    }
    try {
      await updateEngorda(
        seleccionado.fi_engorda_id ?? seleccionado.fi_id ?? seleccionado.id,
        payloadComunBackend(),
      );
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      console.error("Error al actualizar engorda:", err);
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "No se pudo actualizar",
        "error",
      );
    }
  };

  const eliminarEngordaRegistro = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro de engorda?")) return;
    try {
      await removeEngorda(id);
      showSnackbar("Registro eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      console.error("Error al eliminar engorda:", err);
      showSnackbar("No se pudo eliminar", "error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      fi_pileta_destino_id: "",
      cantidad_total: "",
      cantidad_alimento: "",
      peso_kg: "",
      fecha_peso: "",
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

  const totalCantidad = registros.reduce(
    (acc, e) => acc + Number(e.cantidad_total ?? e.cantidad ?? 0),
    0,
  );

  const cargarHistorialObservaciones = useCallback(
    (piletaId) => listObservacionesPileta(piletaId, ["engorda", "trazabilidad", "venta"]),
    [],
  );

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        Engorda
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Registros:</b> {registros.length}</Typography>
        <Typography><b>Total organismos en engorda:</b> {totalCantidad.toLocaleString("es-MX")}</Typography>
      </Paper>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
              {modoEdicion ? "Editar registro" : "Registrar nueva engorda"}
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
                  label="Pileta (engorda)"
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
                  label="Cantidad total"
                  name="cantidad_total"
                  type="number"
                  value={formData.cantidad_total}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, inputMode: "numeric" }}
                  error={!!errors.cantidad_total}
                  {...(errors.cantidad_total ? { helperText: errors.cantidad_total } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Cantidad alimento"
                  name="cantidad_alimento"
                  type="number"
                  value={formData.cantidad_alimento}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ min: 0, inputMode: "numeric" }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Peso (kg)"
                  name="peso_kg"
                  value={formData.peso_kg}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ inputMode: "decimal" }}
                  error={!!errors.peso_kg}
                  {...(errors.peso_kg ? { helperText: errors.peso_kg } : {})}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  label="Fecha peso"
                  type="date"
                  name="fecha_peso"
                  value={formData.fecha_peso}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.fecha_peso}
                  {...(errors.fecha_peso ? { helperText: errors.fecha_peso } : {})}
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
                  onClick={modoEdicion ? actualizarEngordaRegistro : registrarEngorda}
                  sx={{ mt: 1, fontWeight: "bold" }}
                >
                  {modoEdicion ? "Guardar cambios" : "Registrar engorda"}
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
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cantidad total</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Cant. alimento</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Peso (kg)</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha peso</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((l) => (
                      <TableRow
                        key={l.fi_engorda_id ?? l.fi_id ?? l.id}
                        onClick={() => setSeleccionado(l)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            (seleccionado?.fi_engorda_id ?? seleccionado?.fi_id ?? seleccionado?.id) ===
                            (l.fi_engorda_id ?? l.fi_id ?? l.id)
                              ? "#e0f7fa"
                              : "transparent",
                        }}
                      >
                        <TableCell>
                          {l.nombre_pileta_destino || l.nombre_pileta || "—"}
                        </TableCell>
                        <TableCell>{formatNumber(l.cantidad_total ?? l.cantidad)}</TableCell>
                        <TableCell>{formatNumber(l.cantidad_alimento)}</TableCell>
                        <TableCell>{formatNumber(l.peso_kg ?? l.peso)}</TableCell>
                        <TableCell>{formatearFecha(l.fecha_peso)}</TableCell>
                        <TableCell sx={{ maxWidth: 220, verticalAlign: "top" }}>
                          <CeldaObservacionConHistorial
                            texto={l.observacion ?? l.fc_observacion ?? ""}
                            piletaId={
                              l.fi_pileta_destino_id ?? l.pileta_destino_id ?? l.pileta_id
                            }
                            piletaNombre={l.nombre_pileta_destino || l.nombre_pileta}
                            etapaLabel="Engorda"
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
            onClick={() =>
              eliminarEngordaRegistro(seleccionado.fi_engorda_id ?? seleccionado.fi_id ?? seleccionado.id)
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
