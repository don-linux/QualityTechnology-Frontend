import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listEventosCosecha,
  createEventoCosecha,
  updateEventoCosecha,
  removeEventoCosecha,
  listIncubacion,
  createIncubacion,
  updateIncubacion,
  removeIncubacion,
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
import FormControlLabel from "@mui/material/FormControlLabel";
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
import { vistaActualPorPileta } from "@shared/utils/inventarioVigente";

const MAX_OBSERVACION = 500;
const hoyISO = () => new Date().toISOString().split("T")[0];

const TIPOS_COSECHA = [
  { value: "huevo", label: "Huevo" },
  { value: "larva_saco", label: "Larva con saco" },
  { value: "alevin_nadando", label: "Alevín nadando" },
];

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

const requiredFieldsCosecha = [
  "ubicacion",
  "fi_pileta_origen_id",
  "fd_fecha_cosecha",
  "fc_tipo_cosecha",
  "fn_volumen_ml",
  "fn_hembras_ovadas",
  "fi_pileta_destino_id",
];

const requiredFieldsSoloIncubacion = ["ubicacion", "fi_pileta_destino_id"];

const formularioVacio = (ubicacionDefault = "") => ({
  ubicacion: ubicacionDefault,
  fi_pileta_origen_id: "",
  fd_fecha_cosecha: hoyISO(),
  fc_tipo_cosecha: "",
  fc_estadio_desarrollo: "",
  fn_volumen_ml: "",
  fn_hembras_ovadas: "",
  fb_marcar_agotado: false,
  fi_pileta_destino_id: "",
  fecha_ingreso: hoyISO(),
  fecha_egreso: "",
  lote: "",
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
  const [registrosIncubacion, setRegistrosIncubacion] = useState([]);
  const [seleccionadoEvento, setSeleccionadoEvento] = useState(null);
  const [seleccionadoIncubacion, setSeleccionadoIncubacion] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  /** 'cosecha' = evento completo; 'incubacion' = actualización periódica en pileta */
  const [tipoFormulario, setTipoFormulario] = useState("cosecha");
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

  const registrosIncubacionVista = useMemo(
    () => vistaActualPorPileta(registrosIncubacion),
    [registrosIncubacion],
  );

  const gruposIncubacion = useMemo(
    () => getGroups(registrosIncubacionVista, "fc_granja"),
    [getGroups, registrosIncubacionVista],
  );

  const esFormularioCosecha = tipoFormulario === "cosecha";

  const payloadCosechaBackend = () => ({
    pileta_id: Number(formData.fi_pileta_origen_id),
    pileta_origen_id: Number(formData.fi_pileta_origen_id),
    fecha_cosecha: formData.fd_fecha_cosecha || null,
    tipo_cosecha: formData.fc_tipo_cosecha,
    estadio_desarrollo: formData.fc_estadio_desarrollo || null,
    volumen_ml: formData.fn_volumen_ml === "" ? null : Number(formData.fn_volumen_ml),
    hembras_ovadas: Number(formData.fn_hembras_ovadas || 0),
    marcar_agotado: Boolean(formData.fb_marcar_agotado),
    observacion: formData.observacion,
    pileta_destino_incubacion_id: Number(formData.fi_pileta_destino_id),
    fecha_ingreso: formData.fecha_ingreso || formData.fd_fecha_cosecha || null,
    fecha_egreso: formData.fecha_egreso || null,
  });

  const payloadIncubacionBackend = (eventoCosechaId) => ({
    pileta_id: Number(formData.fi_pileta_destino_id),
    pileta_destino_id: Number(formData.fi_pileta_destino_id),
    evento_cosecha_id: eventoCosechaId ?? undefined,
    lote: formData.lote.trim() ? formData.lote.trim() : undefined,
    huevos_ml: formData.fn_volumen_ml === "" ? null : Number(formData.fn_volumen_ml),
    fecha_ingreso: formData.fecha_ingreso || formData.fd_fecha_cosecha || null,
    fecha_egreso: formData.fecha_egreso || null,
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "fn_volumen_ml" && !soloDecimal(value)) return;
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
      if (name === "fd_fecha_cosecha" && esFormularioCosecha && !modoEdicion) {
        next.fecha_ingreso = value;
      }
      return next;
    });
    clearFieldError(name);
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
      const [ev, inc] = await Promise.all([listEventosCosecha(), listIncubacion()]);
      setRegistros(Array.isArray(ev.data) ? ev.data : []);
      setRegistrosIncubacion(Array.isArray(inc.data) ? inc.data : []);
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
    if (!validate(formData, requiredFieldsCosecha)) return;
    try {
      await createEventoCosecha(payloadCosechaBackend());
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

  const registrarActualizacionIncubacion = async () => {
    if (!validate(formData, requiredFieldsSoloIncubacion)) return;
    if (!formData.lote.trim()) {
      showSnackbar("Indique el lote genético", "error");
      return;
    }
    if (!formData.fecha_ingreso) {
      showSnackbar("La fecha de ingreso es obligatoria", "error");
      return;
    }
    try {
      await createIncubacion(payloadIncubacionBackend(null));
      showSnackbar("Registro en incubación guardado", "success");
      resetFormulario();
      cargarRegistros();
    } catch (err) {
      showSnackbar(
        err?.response?.data?.error ||
          err?.response?.data?.detalle ||
          "Error al registrar incubación",
        "error",
      );
    }
  };

  const activarEdicionEvento = () => {
    if (!seleccionadoEvento) return;
    clearErrors();
    const ev = seleccionadoEvento;
    setTipoFormulario("cosecha");
    setFormData({
      ubicacion: ev.fc_granja || defaultUbicacion || "",
      fi_pileta_origen_id: String(ev.fi_pileta_origen_id ?? ev.pileta_id ?? ""),
      fd_fecha_cosecha: ev.fecha_cosecha
        ? String(ev.fecha_cosecha).split("T")[0]
        : hoyISO(),
      fc_tipo_cosecha: ev.tipo_cosecha ?? "",
      fc_estadio_desarrollo: ev.estadio_desarrollo ?? "",
      fn_volumen_ml: ev.volumen_ml != null ? String(ev.volumen_ml) : "",
      fn_hembras_ovadas:
        ev.hembras_ovadas != null
          ? String(ev.hembras_ovadas)
          : ev.fn_hembras_ovadas != null
            ? String(ev.fn_hembras_ovadas)
            : "",
      fb_marcar_agotado: false,
      fi_pileta_destino_id: ev.fi_pileta_destino_id
        ? String(ev.fi_pileta_destino_id)
        : "",
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

  const activarEdicionIncubacion = () => {
    if (!seleccionadoIncubacion) return;
    clearErrors();
    const row = seleccionadoIncubacion;
    setTipoFormulario("incubacion");
    setFormData({
      ubicacion: row.fc_granja || formData.ubicacion || defaultUbicacion || "",
      fi_pileta_origen_id: "",
      fd_fecha_cosecha: hoyISO(),
      fc_tipo_cosecha: "",
      fc_estadio_desarrollo: "",
      fn_volumen_ml: row.huevos_ml != null ? String(row.huevos_ml) : "",
      fn_hembras_ovadas: "",
      fb_marcar_agotado: false,
      fi_pileta_destino_id: String(
        row.fi_pileta_destino_id ?? row.pileta_destino_id ?? row.pileta_id ?? "",
      ),
      fecha_ingreso: row.fecha_ingreso
        ? String(row.fecha_ingreso).split("T")[0]
        : hoyISO(),
      fecha_egreso: row.fecha_egreso ? String(row.fecha_egreso).split("T")[0] : "",
      lote:
        row.lote_genetico ??
        row.fc_lote_genetico ??
        row.lote ??
        row.fc_lote ??
        "",
      observacion: row.observacion ?? row.fc_observacion ?? "",
    });
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizar = async () => {
    if (tipoFormulario === "incubacion") {
      if (!validate(formData, requiredFieldsSoloIncubacion)) return;
      try {
        await updateIncubacion(
          seleccionadoIncubacion.fi_id ?? seleccionadoIncubacion.id,
          payloadIncubacionBackend(seleccionadoIncubacion.evento_cosecha_id),
        );
        showSnackbar("Registro de incubación actualizado", "success");
        resetEdicion();
        cargarRegistros();
      } catch (err) {
        showSnackbar(err?.response?.data?.error || "No se pudo actualizar", "error");
      }
      return;
    }

    if (!validate(formData, requiredFieldsCosecha)) return;
    const eventoId = seleccionadoEvento.fi_id ?? seleccionadoEvento.id;
    const incubacionId =
      seleccionadoEvento.incubacion_id ?? seleccionadoEvento.fi_incubacion_id;
    const pendiente = seleccionadoEvento.pendiente_incubacion;

    try {
      await updateEventoCosecha(eventoId, {
        pileta_id: Number(formData.fi_pileta_origen_id),
        pileta_origen_id: Number(formData.fi_pileta_origen_id),
        fecha_cosecha: formData.fd_fecha_cosecha || null,
        tipo_cosecha: formData.fc_tipo_cosecha,
        estadio_desarrollo: formData.fc_estadio_desarrollo || null,
        volumen_ml: formData.fn_volumen_ml === "" ? null : Number(formData.fn_volumen_ml),
        hembras_ovadas: Number(formData.fn_hembras_ovadas || 0),
        observacion: formData.observacion,
      });

      if (pendiente && formData.fi_pileta_destino_id) {
        await createIncubacion(
          payloadIncubacionBackend(eventoId),
        );
      } else if (incubacionId) {
        await updateIncubacion(incubacionId, payloadIncubacionBackend(eventoId));
      }

      showSnackbar("Registro actualizado", "success");
      resetEdicion();
      cargarRegistros();
    } catch (err) {
      showSnackbar(err?.response?.data?.error || "No se pudo actualizar", "error");
    }
  };

  const eliminarEvento = async (id) => {
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

  const eliminarIncubacion = async (id) => {
    if (!await confirm("¿Eliminar este registro de incubación?")) return;
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
    setTipoFormulario("cosecha");
    clearErrors();
    if (cerrarPanel) cerrarFormulario();
  };

  const resetEdicion = () => {
    setModoEdicion(false);
    setSeleccionadoEvento(null);
    setSeleccionadoIncubacion(null);
    resetFormulario();
  };

  const abrirNuevoRegistroCosecha = () => {
    setTipoFormulario("cosecha");
    setSeleccionadoEvento(null);
    setSeleccionadoIncubacion(null);
    setModoEdicion(false);
    resetFormulario(false);
    abrirFormulario();
  };

  const abrirActualizacionIncubacion = () => {
    setTipoFormulario("incubacion");
    setSeleccionadoEvento(null);
    setSeleccionadoIncubacion(null);
    setModoEdicion(false);
    setFormData(
      formularioVacio(defaultUbicacion || ubicacionesGranja[0]?.value || ""),
    );
    clearErrors();
    abrirFormulario();
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    return new Date(fechaISO).toLocaleDateString("es-MX");
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

  const tituloFormulario = () => {
    if (modoEdicion && tipoFormulario === "incubacion") return "Editar registro en incubación";
    if (modoEdicion) return "Editar cosecha e incubación";
    if (tipoFormulario === "incubacion") return "Actualización periódica en incubación";
    return "Registrar cosecha e ingreso a incubación";
  };

  const onSubmitFormulario = () => {
    if (modoEdicion) return actualizar();
    if (tipoFormulario === "incubacion") return registrarActualizacionIncubacion();
    return registrar();
  };

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#004d73" }}>
        Cosecha e incubación
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Registre el desove y el ingreso a la pileta de incubación en un solo paso. Use la tabla
        inferior para actualizar fechas de egreso u otros datos periódicos.
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

              {esFormularioCosecha && (
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
                  </TextField>
                </Grid>
              )}

              {esFormularioCosecha && (
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
                        {...(errors.fd_fecha_cosecha
                          ? { helperText: errors.fd_fecha_cosecha }
                          : {})}
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
                        {...(errors.fc_tipo_cosecha
                          ? { helperText: errors.fc_tipo_cosecha }
                          : {})}
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
                        {...(errors.fn_volumen_ml
                          ? { helperText: errors.fn_volumen_ml }
                          : {})}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
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
              )}

              <Grid size={12}>
                <TituloSeccionFormulario
                  titulo={esFormularioCosecha ? "Incubación (destino)" : "Pileta de incubación"}
                  mt={esFormularioCosecha ? 1 : 0}
                />
                <Grid container spacing={2}>
                  {!esFormularioCosecha && (
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Lote genético"
                        name="lote"
                        value={formData.lote}
                        onChange={handleChange}
                        fullWidth
                        sx={campoFormSx}
                        inputProps={{
                          maxLength: 60,
                          readOnly: Boolean(
                            modoEdicion && seleccionadoIncubacion?.evento_cosecha_id,
                          ),
                        }}
                        helperText={
                          modoEdicion && seleccionadoIncubacion?.evento_cosecha_id
                            ? "Vinculado a evento de cosecha"
                            : "Requerido sin evento de cosecha"
                        }
                      />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
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
                        esFormularioCosecha
                          ? "Por defecto coincide con la fecha de cosecha"
                          : undefined
                      }
                    />
                  </Grid>
                  {(modoEdicion || !esFormularioCosecha) && (
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

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={abrirNuevoRegistroCosecha}>
          Nueva cosecha + incubación
        </Button>
        <Button variant="outlined" color="secondary" onClick={abrirActualizacionIncubacion}>
          Actualización en pileta (sin cosecha)
        </Button>
      </div>

      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: "#023047" }}>
        Historial de cosechas
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(filas) => (
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#e8f4f8" }}>
                  <TableCell>ID evento</TableCell>
                  <TableCell>Estanque TR</TableCell>
                  <TableCell>Lote genético</TableCell>
                  <TableCell>Fecha cosecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Pileta incubación</TableCell>
                  <TableCell>F. ingreso</TableCell>
                  <TableCell>F. egreso</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((row) => (
                  <TableRow
                    key={row.fi_id ?? row.id}
                    hover
                    selected={
                      (seleccionadoEvento?.fi_id ?? seleccionadoEvento?.id) ===
                      (row.fi_id ?? row.id)
                    }
                    onClick={() => {
                      setSeleccionadoEvento(row);
                      setSeleccionadoIncubacion(null);
                    }}
                  >
                    <TableCell>{row.codigo ?? row.fc_codigo}</TableCell>
                    <TableCell>{row.nombre_pileta_origen}</TableCell>
                    <TableCell>{row.lote_genetico ?? row.fc_lote_genetico}</TableCell>
                    <TableCell>{formatearFecha(row.fecha_cosecha)}</TableCell>
                    <TableCell>{row.tipo_cosecha_label ?? row.tipo_cosecha}</TableCell>
                    <TableCell>
                      {row.pendiente_incubacion ? (
                        <Chip label="Pendiente" size="small" color="warning" />
                      ) : (
                        row.incubacion_pileta_nombre ?? "—"
                      )}
                    </TableCell>
                    <TableCell>{formatearFecha(row.fecha_ingreso)}</TableCell>
                    <TableCell>{formatearFecha(row.fecha_egreso)}</TableCell>
                    <TableCell>
                      <CeldaObservacionConHistorial
                        texto={row.observacion ?? row.fc_observacion}
                        piletaId={row.pileta_id ?? row.fi_pileta_origen_id}
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
                        disabled={!row.pendiente_incubacion}
                        onClick={() => eliminarEvento(row.fi_id ?? row.id)}
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
      />

      <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700, color: "#023047" }}>
        Estado actual por pileta (incubación)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Último registro de cada pileta. Seleccione una fila para editar fechas de egreso u otros
        datos.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposIncubacion}
        renderTabla={(rows) => (
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#006d77" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Pileta</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lote</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Huevos/ml</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>F. ingreso</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Días</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>F. egreso</TableCell>
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
                      hover
                      selected={
                        (seleccionadoIncubacion?.fi_id ?? seleccionadoIncubacion?.id) ===
                        (l.fi_id ?? l.id)
                      }
                      onClick={() => {
                        setSeleccionadoIncubacion(l);
                        setSeleccionadoEvento(null);
                      }}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell>
                        {l.nombre_pileta_destino || l.nombre_pileta || "—"}
                      </TableCell>
                      <TableCell>{l.lote ?? l.fc_lote ?? "—"}</TableCell>
                      <TableCell>{formatNumber(l.huevos_ml ?? l.fn_huevos_ml)}</TableCell>
                      <TableCell>
                        {formatearFecha(l.fecha_ingreso ?? l.fd_fecha_ingreso)}
                      </TableCell>
                      <TableCell>
                        {formatNumber(l.dias_en_pileta ?? l.fn_dias_en_pileta)}
                      </TableCell>
                      <TableCell>
                        {formatearFecha(l.fecha_egreso ?? l.fd_fecha_egreso)}
                      </TableCell>
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
        )}
      />

      {seleccionadoIncubacion && (
        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Button variant="contained" color="warning" onClick={activarEdicionIncubacion}>
            Editar registro en pileta
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() =>
              eliminarIncubacion(seleccionadoIncubacion.fi_id ?? seleccionadoIncubacion.id)
            }
          >
            Eliminar registro
          </Button>
          <Button variant="outlined" onClick={() => setSeleccionadoIncubacion(null)}>
            Cerrar
          </Button>
        </div>
      )}

      {ConfirmModal}
    </div>
  );
};

export default EventoCosecha;
