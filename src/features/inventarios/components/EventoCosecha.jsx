import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listIncubacion,
  createIncubacion,
  updateIncubacion,
  removeIncubacion,
} from "../services/eventoCosechaService";
import { listObservacionesPileta, listPiletas } from "../services/piletasService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
import { formatCantidad, formatFecha } from "@shared/utils/formatters";
import {
  CampoConEtiquetaArriba,
  TituloSeccionFormulario,
  botonRegistroInventarioSx,
  campoFormSx,
} from "@shared/components/FormularioInventarioSecciones";
import Button from "@mui/material/Button";
import CampoTexto from "@shared/components/CampoTexto";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { filtrarPorUbicacion } from "@shared/utils/fetchMergedPorUbicaciones";
import { ordenarYNumerar, SIGLAS_MODULO } from "@shared/utils/ordenarFilas";

const MAX_OBSERVACION = 500;
const hoyISO = () => new Date().toISOString().split("T")[0];

const TIPOS_COSECHA = [
  { value: "huevo", label: "Huevo" },
  { value: "larva_saco", label: "Larva con saco" },
  { value: "alevin_nadando", label: "Alevín nadando" },
];

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

// Reconstruye el mapa { tipo: "valor" } para edición a partir del registro serializado,
// con compatibilidad para registros antiguos de un solo tipo (sin desglose).
const mapaVolumenDesdeEvento = (ev) => {
  const fuente = ev.volumen_por_tipo ?? ev.fc_volumen_por_tipo;
  const mapa = {};
  if (fuente && typeof fuente === "object" && !Array.isArray(fuente)) {
    for (const [tipo, valor] of Object.entries(fuente)) {
      if (valor != null && valor !== "") mapa[tipo] = String(valor);
    }
  }
  const tipos = Array.isArray(ev.tipo_cosecha)
    ? ev.tipo_cosecha
    : ev.tipo_cosecha
      ? [ev.tipo_cosecha]
      : [];
  if (Object.keys(mapa).length === 0 && tipos.length === 1) {
    const total = ev.volumen_ml ?? ev.huevos_ml;
    if (total != null) mapa[tipos[0]] = String(total);
  }
  return mapa;
};

const requiredFieldsCosecha = [
  "ubicacion",
  "fi_pileta_origen_id",
  "fd_fecha_cosecha",
  "fc_tipo_cosecha",
  "fn_hembras_ovadas",
  "fi_pileta_destino_id",
];

const formularioVacio = (ubicacionDefault = "") => ({
  ubicacion: ubicacionDefault,
  fi_pileta_origen_id: "",
  fd_fecha_cosecha: hoyISO(),
  fc_tipo_cosecha: ["huevo"],
  fc_volumen_por_tipo: { huevo: "" },
  fc_estadio_desarrollo: "",
  fn_hembras_ovadas: "",
  fb_marcar_agotado: false,
  fi_pileta_destino_id: "",
  fecha_ingreso: hoyISO(),
  fecha_egreso: "",
  observacion: "",
});

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
  const [piletasDestinoIncubacion, setPiletasDestinoIncubacion] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionadoEvento, setSeleccionadoEvento] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());

  const piletasOrigenFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasReproductoras, formData.ubicacion, ubicacionesGranja),
    [piletasReproductoras, formData.ubicacion, ubicacionesGranja],
  );

  const piletasDestinoFiltradas = useMemo(
    () => filtrarPorUbicacion(piletasDestinoIncubacion, formData.ubicacion, ubicacionesGranja),
    [piletasDestinoIncubacion, formData.ubicacion, ubicacionesGranja],
  );

  const gruposRegistros = useMemo(
    () => getGroups(registros, "fc_granja"),
    [getGroups, registros],
  );

  const construirVolumenPorTipo = () => {
    const mapa = {};
    (formData.fc_tipo_cosecha || []).forEach((tipo) => {
      const valor = formData.fc_volumen_por_tipo?.[tipo];
      if (valor !== "" && valor != null) mapa[tipo] = Number(valor);
    });
    return mapa;
  };

  const payloadBackend = () => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_destino_id: Number(formData.fi_pileta_destino_id),
    pileta_origen_id: Number(formData.fi_pileta_origen_id),
    fecha_cosecha: formData.fd_fecha_cosecha || null,
    tipo_cosecha: formData.fc_tipo_cosecha,
    volumen_por_tipo: construirVolumenPorTipo(),
    estadio_desarrollo: formData.fc_estadio_desarrollo || null,
    hembras_ovadas: Number(formData.fn_hembras_ovadas || 0),
    marcar_agotado: Boolean(formData.fb_marcar_agotado),
    fecha_ingreso: formData.fecha_ingreso || formData.fd_fecha_cosecha || null,
    fecha_egreso: formData.fecha_egreso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "fn_hembras_ovadas" && !soloEntero(value)) return;
    setFormData((prev) => {
      if (name === "ubicacion") {
        return {
          ...prev,
          ubicacion: value,
          fi_pileta_origen_id: "",
          fi_pileta_destino_id: "",
        };
      }
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }
      const next = { ...prev, [name]: value };
      if (name === "fd_fecha_cosecha" && !modoEdicion) {
        next.fecha_ingreso = value;
      }
      return next;
    });
    clearFieldError(name);
  };

  const toggleTipoCosecha = (value) => {
    setFormData((prev) => {
      const actuales = Array.isArray(prev.fc_tipo_cosecha) ? prev.fc_tipo_cosecha : [];
      const yaSeleccionado = actuales.includes(value);
      const next = yaSeleccionado
        ? actuales.filter((v) => v !== value)
        : [...actuales, value];
      const volumenes = { ...(prev.fc_volumen_por_tipo || {}) };
      if (yaSeleccionado) {
        delete volumenes[value];
      } else if (volumenes[value] === undefined) {
        volumenes[value] = "";
      }
      return { ...prev, fc_tipo_cosecha: next, fc_volumen_por_tipo: volumenes };
    });
    clearFieldError("fc_tipo_cosecha");
    clearFieldError(`volumen_${value}`);
  };

  const handleVolumenTipo = (tipo, value) => {
    if (!soloDecimal(value)) return;
    setFormData((prev) => ({
      ...prev,
      fc_volumen_por_tipo: { ...(prev.fc_volumen_por_tipo || {}), [tipo]: value },
    }));
    clearFieldError(`volumen_${tipo}`);
  };

  // Valida los campos requeridos más un volumen por cada tipo de cosecha marcado.
  const validarCosecha = () => {
    const tipos = formData.fc_tipo_cosecha || [];
    const volKeys = tipos.map((t) => `volumen_${t}`);
    const formParaValidar = { ...formData };
    tipos.forEach((t) => {
      formParaValidar[`volumen_${t}`] = formData.fc_volumen_por_tipo?.[t] ?? "";
    });
    return validate(formParaValidar, [...requiredFieldsCosecha, ...volKeys]);
  };

  const cargarPiletas = useCallback(async () => {
    try {
      const [rep, inc] = await Promise.all([
        listPiletas(null, "reproductores"),
        listPiletas(null, "incubacion"),
      ]);
      setPiletasReproductoras(Array.isArray(rep.data) ? rep.data : []);
      setPiletasDestinoIncubacion(Array.isArray(inc.data) ? inc.data : []);
    } catch (err) {
      console.error("Error cargando piletas:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const inc = await listIncubacion(null, null, { historial: true });
      setRegistros(Array.isArray(inc.data) ? inc.data : []);
    } catch (err) {
      console.error("Error cargando registros:", err);
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
    if (!validarCosecha()) return;
    try {
      await createIncubacion(payloadBackend());
      showSnackbar("Cosecha e ingreso a incubación registrados", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar",
        "error",
      );
    }
  };

  const activarEdicionEvento = () => {
    if (!seleccionadoEvento) return;
    clearErrors();
    const ev = seleccionadoEvento;
    setFormData({
      ubicacion: ev.fc_granja || defaultUbicacion || "",
      fi_pileta_origen_id: String(ev.fi_pileta_origen_id ?? ev.pileta_origen_id ?? ""),
      fd_fecha_cosecha: ev.fecha_cosecha
        ? String(ev.fecha_cosecha).split("T")[0]
        : hoyISO(),
      fc_tipo_cosecha: Array.isArray(ev.tipo_cosecha)
        ? ev.tipo_cosecha
        : ev.tipo_cosecha
          ? [ev.tipo_cosecha]
          : [],
      fc_estadio_desarrollo: ev.estadio_desarrollo ?? "",
      fc_volumen_por_tipo: mapaVolumenDesdeEvento(ev),
      fn_hembras_ovadas:
        ev.hembras_ovadas != null
          ? String(ev.hembras_ovadas)
          : ev.fn_hembras_ovadas != null
            ? String(ev.fn_hembras_ovadas)
            : "",
      fb_marcar_agotado: false,
      fi_pileta_destino_id: String(ev.fi_pileta_destino_id ?? ev.pileta_id ?? ""),
      fecha_ingreso: ev.fecha_ingreso
        ? String(ev.fecha_ingreso).split("T")[0]
        : ev.fecha_cosecha
          ? String(ev.fecha_cosecha).split("T")[0]
          : hoyISO(),
      fecha_egreso: ev.fecha_egreso ? String(ev.fecha_egreso).split("T")[0] : "",
      observacion: ev.observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizar = async () => {
    if (!validarCosecha()) return;
    const incubacionId =
      seleccionadoEvento.fi_id ??
      seleccionadoEvento.id ??
      seleccionadoEvento.incubacion_id;

    try {
      await updateIncubacion(incubacionId, payloadBackend());
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo actualizar", "error");
    }
  };

  const eliminarEvento = async (id) => {
    if (!await confirm("¿Eliminar este registro de cosecha e incubación?")) return;
    try {
      await removeIncubacion(id);
      showSnackbar("Registro eliminado", "success");
      cargarRegistros();
      resetEdicion();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo eliminar", "error");
    }
  };

  const resetFormulario = (cerrarPanel = true) => {
    setFormData(
      formularioVacio(defaultUbicacion || ubicacionesGranja[0]?.value || ""),
    );
    clearErrors();
    if (cerrarPanel) cerrarFormulario();
  };

  const resetEdicion = () => {
    setModoEdicion(false);
    setSeleccionadoEvento(null);
    resetFormulario();
  };

  const formatearFecha = (fechaISO) => formatFecha(fechaISO, "");

  const cargarHistorialObservaciones = useCallback(
    (piletaId) => listObservacionesPileta(piletaId),
    [],
  );

  const tituloFormulario = () =>
    modoEdicion ? "Editar cosecha e incubación" : "Registrar cosecha e ingreso a incubación";

  const onSubmitFormulario = () => (modoEdicion ? actualizar() : registrar());

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#004d73" }}>
        Cosecha e incubación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre el desove y el ingreso a la pileta de incubación en un solo paso. El historial
        muestra ambos en la misma fila. Para modificar un registro, selecciónelo y use Editar.
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3, bgcolor: "#fff" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#1a3c34" }}>
              {tituloFormulario()}
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <CampoTexto
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
                </CampoTexto>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CampoTexto
                  select
                  label="Estanque origen (TR)"
                  name="fi_pileta_origen_id"
                  value={formData.fi_pileta_origen_id || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
                  error={!!errors.fi_pileta_origen_id}
                  {...(errors.fi_pileta_origen_id
                    ? { helperText: errors.fi_pileta_origen_id }
                    : {})}
                >
                  {piletasOrigenFiltradas.map((p) => {
                    const pid = p.fi_pileta_id ?? p.pileta_id;
                    return (
                      <MenuItem key={pid} value={String(pid)}>
                        {p.nombre}
                      </MenuItem>
                    );
                  })}
                </CampoTexto>
              </Grid>

              <Grid size={12}>
                  <TituloSeccionFormulario titulo="Datos del desove" mt={0} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <CampoTexto
                        label="Fecha de cosecha"
                        name="fd_fecha_cosecha"
                        type="date"
                        value={formData.fd_fecha_cosecha}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={campoFormSx}
                        error={!!errors.fd_fecha_cosecha}
                        {...(errors.fd_fecha_cosecha
                          ? { helperText: errors.fd_fecha_cosecha }
                          : {})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Box
                        component="fieldset"
                        sx={{
                          border: "1px solid",
                          borderColor: errors.fc_tipo_cosecha
                            ? "error.main"
                            : "rgba(0, 0, 0, 0.23)",
                          borderRadius: 2,
                          m: 0,
                          px: 1.5,
                          pt: 0.5,
                          pb: 1.25,
                          bgcolor: "#fff",
                        }}
                      >
                        <Box
                          component="legend"
                          sx={{
                            px: 0.75,
                            fontSize: 12,
                            lineHeight: 1.2,
                            color: errors.fc_tipo_cosecha ? "error.main" : "text.secondary",
                          }}
                        >
                          Tipo de cosecha (una o varias)
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                            gap: 3,
                            minHeight: 34,
                          }}
                        >
                          {TIPOS_COSECHA.map((t) => {
                            const marcado = (formData.fc_tipo_cosecha || []).includes(t.value);
                            return (
                              <Box
                                key={t.value}
                                sx={{
                                  display: "flex",
                                  flexDirection: "column",
                                  minWidth: 130,
                                }}
                              >
                                <FormControlLabel
                                  sx={{ mr: 0 }}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={marcado}
                                      onChange={() => toggleTipoCosecha(t.value)}
                                    />
                                  }
                                  label={t.label}
                                />
                                {marcado && (
                                  <CampoTexto
                                    size="small"
                                    value={formData.fc_volumen_por_tipo?.[t.value] ?? ""}
                                    onChange={(e) =>
                                      handleVolumenTipo(t.value, e.target.value)
                                    }
                                    placeholder="0"
                                    inputProps={{ inputMode: "decimal" }}
                                    sx={{ ...campoFormSx, ml: 3.5, mt: 0.5, maxWidth: 96 }}
                                    error={!!errors[`volumen_${t.value}`]}
                                    {...(errors[`volumen_${t.value}`]
                                      ? { helperText: errors[`volumen_${t.value}`] }
                                      : {})}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                      {errors.fc_tipo_cosecha && (
                        <FormHelperText error sx={{ mx: 1.75 }}>
                          {errors.fc_tipo_cosecha}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <CampoTexto
                        label="Hembras ovadas"
                        name="fn_hembras_ovadas"
                        value={formData.fn_hembras_ovadas}
                        onChange={handleChange}
                        fullWidth
                        sx={campoFormSx}
                        error={!!errors.fn_hembras_ovadas}
                        {...(errors.fn_hembras_ovadas
                          ? { helperText: errors.fn_hembras_ovadas }
                          : {})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <CampoTexto
                        label="Estadio de desarrollo (opcional)"
                        name="fc_estadio_desarrollo"
                        value={formData.fc_estadio_desarrollo}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Ej. Amarillo, Ojo"
                        sx={campoFormSx}
                      />
                    </Grid>
                    <Grid size={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="fb_marcar_agotado"
                            checked={Boolean(formData.fb_marcar_agotado)}
                            onChange={handleChange}
                          />
                        }
                        label="Marcar lote como agotado (no admite más cosechas)"
                      />
                    </Grid>
                  </Grid>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Incubación (destino)" mt={1} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CampoTexto
                      select
                      label="Pileta de incubación"
                      name="fi_pileta_destino_id"
                      value={formData.fi_pileta_destino_id || ""}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      error={!!errors.fi_pileta_destino_id}
                      {...(errors.fi_pileta_destino_id
                        ? { helperText: errors.fi_pileta_destino_id }
                        : {})}
                    >
                      {piletasDestinoFiltradas.map((p) => {
                        const pid = p.fi_pileta_id ?? p.pileta_id;
                        return (
                          <MenuItem key={pid} value={String(pid)}>
                            {p.nombre}
                          </MenuItem>
                        );
                      })}
                    </CampoTexto>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <CampoTexto
                      label="Fecha de ingreso"
                      name="fecha_ingreso"
                      type="date"
                      value={formData.fecha_ingreso}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={campoFormSx}
                      helperText={
                        modoEdicion
                          ? undefined
                          : "Por defecto coincide con la fecha de cosecha"
                      }
                    />
                  </Grid>
                  {modoEdicion && (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <CampoTexto
                        label="Fecha de egreso (opcional)"
                        name="fecha_egreso"
                        type="date"
                        value={formData.fecha_egreso}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={campoFormSx}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Grid size={12}>
                <CampoConEtiquetaArriba label="Observaciones">
                  <CampoTexto
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
                  onClick={onSubmitFormulario}
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

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: "#023047" }}>
        Historial de cosechas e incubación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada fila incluye el desove y su ingreso a incubación. Seleccione un registro para
        editarlo.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows, { siglaGranja } = {}) => {
          const filas = ordenarYNumerar(rows, ["fi_id", "id"], {
            siglaGranja,
            siglaModulo: SIGLAS_MODULO.eventosCosecha,
          });
          return (
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e8f4f8" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>ID evento</TableCell>
                  <TableCell>Estanque TR</TableCell>
                  <TableCell>Lote genético</TableCell>
                  <TableCell>Fecha cosecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Pileta incubación</TableCell>
                  <TableCell>Huevos/ml</TableCell>
                  <TableCell>F. ingreso</TableCell>
                  <TableCell>Días en incubación</TableCell>
                  <TableCell>F. egreso</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} align="center">
                      No hay registros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filas.map((row) => (
                    <TableRow
                      key={row.fi_id ?? row.id}
                      hover
                      selected={
                        (seleccionadoEvento?.fi_id ?? seleccionadoEvento?.id) ===
                        (row.fi_id ?? row.id)
                      }
                      onClick={() => setSeleccionadoEvento(row)}
                    >
                      <TableCell>{row._num}</TableCell>
                      <TableCell>{row.codigo ?? row.fc_codigo}</TableCell>
                      <TableCell>{row.nombre_pileta_origen}</TableCell>
                      <TableCell>{row.lote_genetico ?? row.fc_lote_genetico}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_cosecha)}</TableCell>
                      <TableCell>
                        {row.tipo_cosecha_label ??
                          (Array.isArray(row.tipo_cosecha)
                            ? row.tipo_cosecha.join(", ")
                            : row.tipo_cosecha)}
                      </TableCell>
                      <TableCell>
                        {row.incubacion_pileta_nombre ?? row.nombre_pileta_destino ?? "—"}
                      </TableCell>
                      <TableCell align="right">{formatCantidad(row.huevos_ml ?? row.fn_huevos_ml)}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_ingreso ?? row.fd_fecha_ingreso)}</TableCell>
                      <TableCell align="right">{formatCantidad(row.dias_en_pileta ?? row.fn_dias_en_pileta)}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_egreso ?? row.fd_fecha_egreso)}</TableCell>
                      <TableCell>
                        <CeldaObservacionConHistorial
                          texto={
                            row.observacion ??
                            row.fc_observacion ??
                            row.observacion_incubacion ??
                            row.fc_observacion_incubacion
                          }
                          piletaId={
                            row.fi_pileta_destino_id ??
                            row.pileta_id ??
                            row.fi_pileta_origen_id
                          }
                          piletaNombre={
                            row.incubacion_pileta_nombre ??
                            row.nombre_pileta_destino ??
                            row.nombre_pileta_origen
                          }
                          etapaLabel="Cosecha e incubación"
                          cargarHistorial={cargarHistorialObservaciones}
                        />
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={activarEdicionEvento}
                          disabled={
                            !seleccionadoEvento ||
                            (seleccionadoEvento?.fi_id ?? seleccionadoEvento?.id) !==
                              (row.fi_id ?? row.id)
                          }
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => eliminarEvento(row.fi_id ?? row.id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          );
        }}
      />

      {ConfirmModal}
    </div>
  );
};

export default EventoCosecha;
