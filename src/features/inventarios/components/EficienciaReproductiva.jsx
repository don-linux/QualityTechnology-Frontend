import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listEficienciaReproductiva,
  createEficienciaReproductiva,
  updateEficienciaReproductiva,
} from "../services/eficienciaReproductivaService";
import { listObservacionesInfraestructuraFisica, listInfraestructuraFisica } from "../services/infraestructuraFisicaService";
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
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { filtrarPorUbicacion } from "@shared/utils/fetchMergedPorUbicaciones";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

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
  const fuente = ev.volumen_por_tipo;
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
  "infraestructura_fisica_origen_id",
  "fecha_cosecha",
  "tipo_cosecha",
  "hembras_ovadas",
  "infraestructura_fisica_destino_id",
];

const formularioVacio = (ubicacionDefault = "") => ({
  ubicacion: ubicacionDefault,
  infraestructura_fisica_origen_id: "",
  fecha_cosecha: hoyISO(),
  tipo_cosecha: ["huevo"],
  volumen_por_tipo: { huevo: "" },
  estadio_desarrollo: "",
  hembras_ovadas: "",
  marcar_agotado: false,
  infraestructura_fisica_destino_id: "",
  fecha_ingreso: hoyISO(),
  fecha_egreso: "",
  observacion: "",
});

const EficienciaReproductiva = () => {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const [infraestructurasFisicasReproductoras, setInfraestructurasFisicasReproductoras] = useState([]);
  const [infraestructurasFisicasDestinoIncubacion, setInfraestructurasFisicasDestinoIncubacion] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionadoEvento, setSeleccionadoEvento] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState(formularioVacio());

  const infraestructurasFisicasOrigenFiltradas = useMemo(
    () => filtrarPorUbicacion(infraestructurasFisicasReproductoras, formData.ubicacion, ubicacionesGranja),
    [infraestructurasFisicasReproductoras, formData.ubicacion, ubicacionesGranja],
  );

  const infraestructurasFisicasDestinoFiltradas = useMemo(
    () => filtrarPorUbicacion(infraestructurasFisicasDestinoIncubacion, formData.ubicacion, ubicacionesGranja),
    [infraestructurasFisicasDestinoIncubacion, formData.ubicacion, ubicacionesGranja],
  );

  const gruposRegistros = useMemo(
    () => getGroups(registros, "granja"),
    [getGroups, registros],
  );

  const construirVolumenPorTipo = () => {
    const mapa = {};
    (formData.tipo_cosecha || []).forEach((tipo) => {
      const valor = formData.volumen_por_tipo?.[tipo];
      if (valor !== "" && valor != null) mapa[tipo] = Number(valor);
    });
    return mapa;
  };

  const payloadBackend = () => ({
    infraestructura_fisica_id: Number(formData.infraestructura_fisica_destino_id),
    infraestructura_fisica_destino_id: Number(formData.infraestructura_fisica_destino_id),
    infraestructura_fisica_origen_id: Number(formData.infraestructura_fisica_origen_id),
    fecha_cosecha: formData.fecha_cosecha || null,
    tipo_cosecha: formData.tipo_cosecha,
    volumen_por_tipo: construirVolumenPorTipo(),
    estadio_desarrollo: formData.estadio_desarrollo || null,
    hembras_ovadas: Number(formData.hembras_ovadas || 0),
    marcar_agotado: Boolean(formData.marcar_agotado),
    fecha_ingreso: formData.fecha_ingreso || formData.fecha_cosecha || null,
    fecha_egreso: formData.fecha_egreso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "hembras_ovadas" && !soloEntero(value)) return;
    setFormData((prev) => {
      if (name === "ubicacion") {
        return {
          ...prev,
          ubicacion: value,
          infraestructura_fisica_origen_id: "",
          infraestructura_fisica_destino_id: "",
        };
      }
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }
      const next = { ...prev, [name]: value };
      if (name === "fecha_cosecha" && !modoEdicion) {
        next.fecha_ingreso = value;
      }
      return next;
    });
    clearFieldError(name);
  };

  const toggleTipoCosecha = (value) => {
    setFormData((prev) => {
      const actuales = Array.isArray(prev.tipo_cosecha) ? prev.tipo_cosecha : [];
      const yaSeleccionado = actuales.includes(value);
      const next = yaSeleccionado
        ? actuales.filter((v) => v !== value)
        : [...actuales, value];
      const volumenes = { ...(prev.volumen_por_tipo || {}) };
      if (yaSeleccionado) {
        delete volumenes[value];
      } else if (volumenes[value] === undefined) {
        volumenes[value] = "";
      }
      return { ...prev, tipo_cosecha: next, volumen_por_tipo: volumenes };
    });
    clearFieldError("tipo_cosecha");
    clearFieldError(`volumen_${value}`);
  };

  const handleVolumenTipo = (tipo, value) => {
    if (!soloDecimal(value)) return;
    setFormData((prev) => ({
      ...prev,
      volumen_por_tipo: { ...(prev.volumen_por_tipo || {}), [tipo]: value },
    }));
    clearFieldError(`volumen_${tipo}`);
  };

  // Valida los campos requeridos más un volumen por cada tipo de cosecha marcado.
  const validarCosecha = () => {
    const tipos = formData.tipo_cosecha || [];
    const volKeys = tipos.map((t) => `volumen_${t}`);
    const formParaValidar = { ...formData };
    tipos.forEach((t) => {
      formParaValidar[`volumen_${t}`] = formData.volumen_por_tipo?.[t] ?? "";
    });
    return validate(formParaValidar, [...requiredFieldsCosecha, ...volKeys]);
  };

  const cargarInfraestructuraFisica = useCallback(async () => {
    try {
      const [rep, inc] = await Promise.all([
        listInfraestructuraFisica(null, "reproductores"),
        listInfraestructuraFisica(null, "incubacion"),
      ]);
      setInfraestructurasFisicasReproductoras(Array.isArray(rep.data) ? rep.data : []);
      setInfraestructurasFisicasDestinoIncubacion(Array.isArray(inc.data) ? inc.data : []);
    } catch (err) {
      console.error("Error cargando infraestructuraFisica:", err);
    }
  }, []);

  const cargarRegistros = useCallback(async () => {
    try {
      const res = await listEficienciaReproductiva(null, null, { historial: true });
      setRegistros(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando registros:", err);
    }
  }, []);

  useEffect(() => {
    cargarInfraestructuraFisica();
    cargarRegistros();
  }, [cargarInfraestructuraFisica, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const registrar = async () => {
    if (!validarCosecha()) return;
    try {
      await createEficienciaReproductiva(payloadBackend());
      showSnackbar("Registro de eficiencia reproductiva guardado", "success");
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
      ubicacion: ev.granja || defaultUbicacion || "",
      infraestructura_fisica_origen_id: String(ev.infraestructura_fisica_origen_id ?? ""),
      fecha_cosecha: ev.fecha_cosecha
        ? String(ev.fecha_cosecha).split("T")[0]
        : hoyISO(),
      tipo_cosecha: Array.isArray(ev.tipo_cosecha)
        ? ev.tipo_cosecha
        : ev.tipo_cosecha
          ? [ev.tipo_cosecha]
          : [],
      estadio_desarrollo: ev.estadio_desarrollo ?? "",
      volumen_por_tipo: mapaVolumenDesdeEvento(ev),
      hembras_ovadas:
        ev.hembras_ovadas != null ? String(ev.hembras_ovadas) : "",
      marcar_agotado: false,
      infraestructura_fisica_destino_id: String(ev.infraestructura_fisica_destino_id ?? ev.infraestructura_fisica_id ?? ""),
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
    const eficienciaReproductivaId =
      seleccionadoEvento.id ??
      seleccionadoEvento.eficiencia_reproductiva_id ??
      seleccionadoEvento.incubacion_id;

    try {
      await updateEficienciaReproductiva(eficienciaReproductivaId, payloadBackend());
      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo actualizar", "error");
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
    (infraestructuraFisicaId) => listObservacionesInfraestructuraFisica(infraestructuraFisicaId),
    [],
  );

  const tituloFormulario = () =>
    modoEdicion ? "Editar eficiencia reproductiva" : "Registrar eficiencia reproductiva";

  const onSubmitFormulario = () => (modoEdicion ? actualizar() : registrar());

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#004d73" }}>
        Eficiencia reproductiva
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre el desove y el ingreso a la infraestructura física de incubación en un solo paso. El historial
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
                  name="infraestructura_fisica_origen_id"
                  value={formData.infraestructura_fisica_origen_id || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
                  error={!!errors.infraestructura_fisica_origen_id}
                  {...(errors.infraestructura_fisica_origen_id
                    ? { helperText: errors.infraestructura_fisica_origen_id }
                    : {})}
                >
                  {infraestructurasFisicasOrigenFiltradas.map((p) => {
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
                  <TituloSeccionFormulario titulo="Datos del desove" mt={0} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Fecha de cosecha"
                        name="fecha_cosecha"
                        type="date"
                        value={formData.fecha_cosecha}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={campoFormSx}
                        error={!!errors.fecha_cosecha}
                        {...(errors.fecha_cosecha
                          ? { helperText: errors.fecha_cosecha }
                          : {})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Box
                        component="fieldset"
                        sx={{
                          border: "1px solid",
                          borderColor: errors.tipo_cosecha
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
                            color: errors.tipo_cosecha ? "error.main" : "text.secondary",
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
                            const marcado = (formData.tipo_cosecha || []).includes(t.value);
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
                                  <TextField
                                    size="small"
                                    value={formData.volumen_por_tipo?.[t.value] ?? ""}
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
                      {errors.tipo_cosecha && (
                        <FormHelperText error sx={{ mx: 1.75 }}>
                          {errors.tipo_cosecha}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Hembras ovadas"
                        name="hembras_ovadas"
                        value={formData.hembras_ovadas}
                        onChange={handleChange}
                        fullWidth
                        sx={campoFormSx}
                        error={!!errors.hembras_ovadas}
                        {...(errors.hembras_ovadas
                          ? { helperText: errors.hembras_ovadas }
                          : {})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        label="Estadio de desarrollo (opcional)"
                        name="estadio_desarrollo"
                        value={formData.estadio_desarrollo}
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
                            name="marcar_agotado"
                            checked={Boolean(formData.marcar_agotado)}
                            onChange={handleChange}
                          />
                        }
                        label="Marcar lote como agotado (no admite más cosechas)"
                      />
                    </Grid>
                  </Grid>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Destino en infraestructura física de incubación" mt={1} />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      label="Infraestructura física de incubación"
                      name="infraestructura_fisica_destino_id"
                      value={formData.infraestructura_fisica_destino_id || ""}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      error={!!errors.infraestructura_fisica_destino_id}
                      {...(errors.infraestructura_fisica_destino_id
                        ? { helperText: errors.infraestructura_fisica_destino_id }
                        : {})}
                    >
                      {infraestructurasFisicasDestinoFiltradas.map((p) => {
                        const pid = p.infraestructura_fisica_id;
                        return (
                          <MenuItem key={pid} value={String(pid)}>
                            {p.nombre}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
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
                      <TextField
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
        Historial de eficiencia reproductiva
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Cada fila incluye el desove y su ingreso a la infraestructura física de incubación. Seleccione un registro para
        editarlo.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => {
          const filas = ordenarYNumerar(rows, ["id"]);
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
                  <TableCell>Infraestructura física destino</TableCell>
                  <TableCell>Huevos/ml</TableCell>
                  <TableCell>F. ingreso</TableCell>
                  <TableCell>Días en infraestructura física</TableCell>
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
                      key={row.id}
                      hover
                      selected={seleccionadoEvento?.id === row.id}
                      onClick={() => setSeleccionadoEvento(row)}
                    >
                      <TableCell>{row._num}</TableCell>
                      <TableCell>{row.codigo}</TableCell>
                      <TableCell>{row.nombre_infraestructura_fisica_origen}</TableCell>
                      <TableCell>{row.lote_genetico}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_cosecha)}</TableCell>
                      <TableCell>
                        {row.tipo_cosecha_label ??
                          (Array.isArray(row.tipo_cosecha)
                            ? row.tipo_cosecha.join(", ")
                            : row.tipo_cosecha)}
                      </TableCell>
                      <TableCell>
                        {row.eficiencia_reproductiva_nombre_infraestructura_fisica ??
                          row.incubacion_nombre_infraestructura_fisica ??
                          row.nombre_infraestructura_fisica_destino ??
                          "—"}
                      </TableCell>
                      <TableCell align="right">{formatCantidad(row.huevos_ml)}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_ingreso)}</TableCell>
                      <TableCell align="right">{formatCantidad(row.dias_en_infraestructura_fisica)}</TableCell>
                      <TableCell>{formatearFecha(row.fecha_egreso)}</TableCell>
                      <TableCell>
                        <CeldaObservacionConHistorial
                          texto={
                            row.observacion ??
                            row.observacion_eficiencia_reproductiva ??
                            row.observacion_incubacion
                          }
                          infraestructuraFisicaId={
                            row.infraestructura_fisica_destino_id ??
                            row.infraestructura_fisica_id ??
                            row.infraestructura_fisica_origen_id
                          }
                          infraestructuraFisicaNombre={
                            row.eficiencia_reproductiva_nombre_infraestructura_fisica ??
                            row.incubacion_nombre_infraestructura_fisica ??
                            row.nombre_infraestructura_fisica_destino ??
                            row.nombre_infraestructura_fisica_origen
                          }
                          etapaLabel="Eficiencia reproductiva"
                          cargarHistorial={cargarHistorialObservaciones}
                        />
                      </TableCell>
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          onClick={activarEdicionEvento}
                          disabled={
                            !seleccionadoEvento ||
                            seleccionadoEvento?.id !== row.id
                          }
                        >
                          Editar
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
    </div>
  );
};

export default EficienciaReproductiva;
