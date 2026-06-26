import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listEngordas,
  createEngorda,
  updateEngorda,
} from "../services/engordaService";
import { listObservacionesInfraestructuraFisica } from "../services/infraestructuraFisicaService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
import { formatCantidad, formatFecha } from "@shared/utils/formatters";
import {
  CampoConEtiquetaArriba,
  TituloSeccionFormulario,
  botonRegistroInventarioSx,
  campoFormSx,
} from "@shared/components/FormularioInventarioSecciones";
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
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import CampoNumerico from "@shared/components/CampoNumerico";
import { filtrarPorUbicacion } from "@shared/utils/fetchMergedPorUbicaciones";
import { vistaActualPorInfraestructuraFisica } from "@shared/utils/inventarioVigente";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import { listInfraestructuraFisica } from "../services/infraestructuraFisicaService";

const MAX_OBSERVACION = 500;

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

export default function Engorda() {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const requiredFields = [
    "ubicacion",
    "infraestructura_fisica_destino_id",
    "cantidad_total",
    "fecha_peso",
    "peso_gramos",
  ];

  const [infraestructurasFisicasDestinoEngorda, setInfraestructurasFisicasDestinoEngorda] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    infraestructura_fisica_destino_id: "",
    cantidad_total: "",
    cantidad_alimento: "",
    peso_gramos: "",
    fecha_peso: "",
    observacion: "",
  });

  const infraestructurasFisicasFiltradas = useMemo(
    () => filtrarPorUbicacion(infraestructurasFisicasDestinoEngorda, formData.ubicacion, ubicacionesGranja),
    [infraestructurasFisicasDestinoEngorda, formData.ubicacion, ubicacionesGranja],
  );

  const registrosVista = useMemo(() => vistaActualPorInfraestructuraFisica(registros), [registros]);

  const gruposRegistros = useMemo(
    () => getGroups(registrosVista, "granja"),
    [getGroups, registrosVista],
  );

  const payloadComunBackend = () => ({
    infraestructura_fisica_id: Number(formData.infraestructura_fisica_destino_id),
    infraestructura_fisica_destino_id: Number(formData.infraestructura_fisica_destino_id),
    cantidad_total: Number(formData.cantidad_total || 0),
    cantidad_alimento: Number(formData.cantidad_alimento || 0),
    peso_gramos: formData.peso_gramos === "" ? null : Number(formData.peso_gramos),
    fecha_peso: formData.fecha_peso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cantidad_total" || name === "cantidad_alimento") {
      if (!soloEntero(value)) return;
    }
    if (name === "peso_gramos") {
      if (!soloDecimal(value)) return;
    }

    setFormData((prev) => {
      if (name === "ubicacion") {
        return { ...prev, ubicacion: value, infraestructura_fisica_destino_id: "" };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarInfraestructuraFisicaDestinoEngorda = useCallback(async () => {
    try {
      const res = await listInfraestructuraFisica(null, "engorda");
      setInfraestructurasFisicasDestinoEngorda(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando infraestructurasFisicas engorda:", err);
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
    cargarInfraestructuraFisicaDestinoEngorda();
    cargarRegistros();
  }, [cargarInfraestructuraFisicaDestinoEngorda, cargarRegistros]);

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
      ubicacion: seleccionado.granja || formData.ubicacion || defaultUbicacion || "",
      infraestructura_fisica_destino_id: String(
        seleccionado.infraestructura_fisica_destino_id ?? seleccionado.infraestructura_fisica_id ?? "",
      ),
      cantidad_total: String(seleccionado.cantidad_total ?? seleccionado.cantidad ?? ""),
      cantidad_alimento: String(seleccionado.cantidad_alimento ?? ""),
      peso_gramos:
        seleccionado.peso_gramos != null
          ? String(seleccionado.peso_gramos)
          : seleccionado.peso != null
            ? String(seleccionado.peso)
            : "",
      fecha_peso: seleccionado.fecha_peso
        ? String(seleccionado.fecha_peso).split("T")[0]
        : "",
      observacion: seleccionado.observacion ?? "",
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
        seleccionado.engorda_id ?? seleccionado.id,
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

  const resetFormulario = () => {
    setFormData({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      infraestructura_fisica_destino_id: "",
      cantidad_total: "",
      cantidad_alimento: "",
      peso_gramos: "",
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

  const formatearFecha = (fechaISO) => formatFecha(fechaISO, "");

  const totalCantidad = registros.reduce(
    (acc, e) => acc + Number(e.cantidad_total ?? e.cantidad ?? 0),
    0,
  );

  const cargarHistorialObservaciones = useCallback(
    (infraestructuraFisicaId) => listObservacionesInfraestructuraFisica(infraestructuraFisicaId),
    [],
  );

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        Engorda
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Registros:</b> {registros.length}</Typography>
        <Typography><b>Total organismos en engorda:</b> {formatCantidad(totalCantidad, "0")}</Typography>
      </Paper>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3, bgcolor: "#fff" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#1a3c34" }}>
              {modoEdicion ? "Editar registro" : "Registrar nueva engorda"}
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Ubicación"
                  name="ubicacion"
                  value={formData.ubicacion || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Infraestructura física (engorda)"
                  name="infraestructura_fisica_destino_id"
                  value={formData.infraestructura_fisica_destino_id || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
                  error={!!errors.infraestructura_fisica_destino_id}
                  {...(errors.infraestructura_fisica_destino_id ? { helperText: errors.infraestructura_fisica_destino_id } : {})}
                >
                  {infraestructurasFisicasFiltradas.map((p) => {
                    const pid = p.infraestructura_fisica_id;
                    return (
                      <MenuItem key={pid} value={String(pid)}>
                        {p.nombre}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Información de cantidades" mt={0} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CampoNumerico
                      label="Cantidad inicial"
                      name="cantidad_total"
                      decimalScale={0}
                      value={formData.cantidad_total}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Cantidad inicial"
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                      error={!!errors.cantidad_total}
                      {...(errors.cantidad_total ? { helperText: errors.cantidad_total } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CampoNumerico
                      label="Cantidad actual"
                      name="cantidad_alimento"
                      decimalScale={0}
                      value={formData.cantidad_alimento}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Cantidad actual"
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Datos biométricos" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CampoNumerico
                      label="Peso (g)"
                      name="peso_gramos"
                      value={formData.peso_gramos}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Peso (g)"
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: "any" }}
                      error={!!errors.peso_gramos}
                      {...(errors.peso_gramos ? { helperText: errors.peso_gramos } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Fecha peso"
                      type="date"
                      name="fecha_peso"
                      value={formData.fecha_peso}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha_peso}
                      {...(errors.fecha_peso ? { helperText: errors.fecha_peso } : {})}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={12}>
                <CampoConEtiquetaArriba label="Observaciones">
                  <TextField
                    name="observacion"
                    value={formData.observacion}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Escriba aquí cualquier detalle adicional..."
                    sx={campoFormSx}
                    hiddenLabel
                    inputProps={{ maxLength: MAX_OBSERVACION }}
                  />
                </CampoConEtiquetaArriba>
              </Grid>

              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={modoEdicion ? actualizarEngordaRegistro : registrarEngorda}
                  sx={botonRegistroInventarioSx}
                >
                  {modoEdicion ? "Guardar cambios" : "Registrar engorda"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: "bold", color: "#023047" }}>
        Estado actual por infraestructura física
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Muestra el último registro periódico de cada infraestructura física. El historial de movimientos está en Trazabilidad.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => {
          const filas = ordenarYNumerar(rows, ["engorda_id", "id"]);
          return (
          <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Infraestructura física</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Cantidad total</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Cant. alimento</TableCell>
                    <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>Peso (g)</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha peso</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filas.map((l) => (
                      <TableRow
                        key={l.engorda_id ?? l.id}
                        onClick={() => setSeleccionado(l)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            (seleccionado?.engorda_id ?? seleccionado?.id) ===
                            (l.engorda_id ?? l.id)
                              ? "#e0f7fa"
                              : "transparent",
                        }}
                      >
                        <TableCell>{l._num}</TableCell>
                        <TableCell>
                          {l.nombre_infraestructura_fisica_destino || l.nombre_infraestructura_fisica || "—"}
                        </TableCell>
                        <TableCell align="right">{formatCantidad(l.cantidad_total ?? l.cantidad)}</TableCell>
                        <TableCell align="right">{formatCantidad(l.cantidad_alimento)}</TableCell>
                        <TableCell align="right">{formatCantidad(l.peso_gramos ?? l.peso)}</TableCell>
                        <TableCell>{formatearFecha(l.fecha_peso)}</TableCell>
                        <TableCell sx={{ maxWidth: 220, verticalAlign: "top" }}>
                          <CeldaObservacionConHistorial
                            texto={l.observacion ?? ""}
                            infraestructuraFisicaId={
                              l.infraestructura_fisica_destino_id ?? l.infraestructura_fisica_id
                            }
                            infraestructuraFisicaNombre={l.nombre_infraestructura_fisica_destino || l.nombre_infraestructura_fisica}
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
          );
        }}
      />

      {seleccionado && (
        <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
          <Button variant="contained" color="warning" onClick={activarEdicion}>
            Editar registro
          </Button>
          <Button variant="outlined" color="inherit" onClick={resetEdicion}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
}
