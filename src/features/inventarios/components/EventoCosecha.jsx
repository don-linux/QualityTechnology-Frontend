import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listEventosCosecha,
  createEventoCosecha,
  updateEventoCosecha,
  removeEventoCosecha,
} from "../services/eventoCosechaService";
import { listObservacionesPileta, listPiletas } from "../services/piletasService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
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
import Chip from "@mui/material/Chip";
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
const hoyISO = () => new Date().toISOString().split("T")[0];

const TIPOS_COSECHA = [
  { value: "huevo", label: "Huevo" },
  { value: "larva_saco", label: "Larva con saco" },
  { value: "alevin_nadando", label: "Alevín nadando" },
];

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);

const requiredFields = [
  "ubicacion",
  "fi_pileta_origen_id",
  "fd_fecha_cosecha",
  "fc_tipo_cosecha",
  "fn_volumen_ml",
];

const EventoCosecha = () => {
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

  const [piletasReproductoras, setPiletasReproductoras] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({
    ubicacion: "",
    fi_pileta_origen_id: "",
    fd_fecha_cosecha: hoyISO(),
    fc_tipo_cosecha: "",
    fc_estadio_desarrollo: "",
    fn_volumen_ml: "",
    observacion: "",
  });

  const piletasFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasReproductoras, formData.ubicacion, ubicacionesGranja),
    [piletasReproductoras, formData.ubicacion, ubicacionesGranja],
  );

  const gruposRegistros = useMemo(
    () => getGroups(registros, "fc_granja"),
    [getGroups, registros],
  );

  const payloadComunBackend = () => ({
    pileta_id: Number(formData.fi_pileta_origen_id),
    pileta_origen_id: Number(formData.fi_pileta_origen_id),
    fecha_cosecha: formData.fd_fecha_cosecha || null,
    tipo_cosecha: formData.fc_tipo_cosecha,
    estadio_desarrollo: formData.fc_estadio_desarrollo || null,
    volumen_ml: formData.fn_volumen_ml === "" ? null : Number(formData.fn_volumen_ml),
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "fn_volumen_ml" && !soloDecimal(value)) return;
    setFormData((prev) => {
      if (name === "ubicacion") {
        return { ...prev, ubicacion: value, fi_pileta_origen_id: "" };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarPiletas = useCallback(async () => {
    try {
      const res = await listPiletas(null, "reproductores");
      setPiletasReproductoras(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas reproductoras:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listEventosCosecha();
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando eventos de cosecha:", err);
    }
  }, []);

  useEffect(() => {
    cargarPiletas();
    cargarRegistros();
  }, [cargarPiletas, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const registrar = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await createEventoCosecha(payloadComunBackend());
      showSnackbar("Evento de cosecha registrado", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar evento",
        "error",
      );
    }
  };

  const activarEdicion = () => {
    if (!seleccionado) return;
    clearErrors();
    setFormData({
      ubicacion: seleccionado.fc_granja || defaultUbicacion || "",
      fi_pileta_origen_id: String(
        seleccionado.fi_pileta_origen_id ?? seleccionado.pileta_id ?? "",
      ),
      fd_fecha_cosecha: seleccionado.fecha_cosecha
        ? String(seleccionado.fecha_cosecha).split("T")[0]
        : hoyISO(),
      fc_tipo_cosecha: seleccionado.tipo_cosecha ?? "",
      fc_estadio_desarrollo: seleccionado.estadio_desarrollo ?? "",
      fn_volumen_ml:
        seleccionado.volumen_ml != null ? String(seleccionado.volumen_ml) : "",
      observacion: seleccionado.observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizar = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await updateEventoCosecha(seleccionado.fi_id ?? seleccionado.id, payloadComunBackend());
      showSnackbar("Evento actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo actualizar", "error");
    }
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar este evento de cosecha?")) return;
    try {
      await removeEventoCosecha(id);
      showSnackbar("Evento eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo eliminar", "error");
    }
  };

  const resetFormulario = () => {
    setFormData({
      ubicacion: defaultUbicacion || ubicacionesGranja[0]?.value || "",
      fi_pileta_origen_id: "",
      fd_fecha_cosecha: hoyISO(),
      fc_tipo_cosecha: "",
      fc_estadio_desarrollo: "",
      fn_volumen_ml: "",
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
    return new Date(fechaISO).toLocaleDateString("es-MX");
  };

  const cargarHistorialObservaciones = useCallback(
    (piletaId) => listObservacionesPileta(piletaId),
    [],
  );

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#004d73" }}>
        Evento de cosecha
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Módulo 2: registra el desove y enlaza el lote de reproductores activo con la incubación.
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3, bgcolor: "#fff" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#1a3c34" }}>
              {modoEdicion ? "Editar evento" : "Registrar evento de cosecha"}
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
                  label="Estanque origen (TR)"
                  name="fi_pileta_origen_id"
                  value={formData.fi_pileta_origen_id || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
                  error={!!errors.fi_pileta_origen_id}
                  {...(errors.fi_pileta_origen_id ? { helperText: errors.fi_pileta_origen_id } : {})}
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

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Datos del desove" mt={0} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Fecha de cosecha"
                      name="fd_fecha_cosecha"
                      type="date"
                      value={formData.fd_fecha_cosecha}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={campoFormSx}
                      error={!!errors.fd_fecha_cosecha}
                      {...(errors.fd_fecha_cosecha ? { helperText: errors.fd_fecha_cosecha } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Tipo de cosecha"
                      name="fc_tipo_cosecha"
                      value={formData.fc_tipo_cosecha}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      error={!!errors.fc_tipo_cosecha}
                      {...(errors.fc_tipo_cosecha ? { helperText: errors.fc_tipo_cosecha } : {})}
                    >
                      {TIPOS_COSECHA.map((t) => (
                        <MenuItem key={t.value} value={t.value}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Volumen / contrapeso (ml o g)"
                      name="fn_volumen_ml"
                      value={formData.fn_volumen_ml}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      error={!!errors.fn_volumen_ml}
                      {...(errors.fn_volumen_ml ? { helperText: errors.fn_volumen_ml } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Estadio de desarrollo (opcional)"
                      name="fc_estadio_desarrollo"
                      value={formData.fc_estadio_desarrollo}
                      onChange={handleChange}
                      fullWidth
                      placeholder="Ej. Amarillo, Ojo"
                      sx={campoFormSx}
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
                    minRows={2}
                    inputProps={{ maxLength: MAX_OBSERVACION }}
                    sx={campoFormSx}
                    hiddenLabel
                  />
                </CampoConEtiquetaArriba>
              </Grid>

              <Grid size={12}>
                <Button
                  variant="contained"
                  startIcon={<AddCircleIcon />}
                  sx={botonRegistroInventarioSx}
                  onClick={modoEdicion ? actualizar : registrar}
                >
                  {modoEdicion ? "ACTUALIZAR" : "REGISTRAR"}
                </Button>
                {modoEdicion && (
                  <Button sx={{ ml: 2 }} onClick={resetEdicion}>
                    Cancelar
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja grupos={gruposRegistros}>
        {(filas) => (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e8f4f8" }}>
                  <TableCell>ID evento</TableCell>
                  <TableCell>Estanque</TableCell>
                  <TableCell>Lote genético</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estadio</TableCell>
                  <TableCell>Volumen</TableCell>
                  <TableCell>Incubación</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((row) => (
                  <TableRow
                    key={row.fi_id ?? row.id}
                    hover
                    selected={seleccionado?.fi_id === row.fi_id}
                    onClick={() => setSeleccionado(row)}
                  >
                    <TableCell>{row.codigo ?? row.fc_codigo}</TableCell>
                    <TableCell>{row.nombre_pileta_origen}</TableCell>
                    <TableCell>{row.lote_genetico ?? row.fc_lote_genetico}</TableCell>
                    <TableCell>{formatearFecha(row.fecha_cosecha)}</TableCell>
                    <TableCell>{row.tipo_cosecha_label ?? row.tipo_cosecha}</TableCell>
                    <TableCell>{row.estadio_desarrollo ?? "—"}</TableCell>
                    <TableCell>{row.volumen_ml ?? "—"}</TableCell>
                    <TableCell>
                      {row.pendiente_incubacion ? (
                        <Chip label="Pendiente" size="small" color="warning" />
                      ) : (
                        <Chip
                          label={row.incubacion_lote ?? "Recibido"}
                          size="small"
                          color="success"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <CeldaObservacionConHistorial
                        comentario={row.observacion ?? row.fc_observacion}
                        piletaId={row.pileta_id ?? row.fi_pileta_origen_id}
                        cargarHistorial={cargarHistorialObservaciones}
                      />
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Button size="small" onClick={activarEdicion} disabled={!seleccionado}>
                        Editar
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!row.pendiente_incubacion}
                        onClick={() => eliminar(row.fi_id ?? row.id)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TablasPorUbicacionGranja>

      <ConfirmModal />
    </div>
  );
};

export default EventoCosecha;
