import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  listReproductores,
  createReproductor,
  updateReproductor,
} from "../services/reproductoresService";
import { listObservacionesInfraestructuraFisica, listInfraestructuraFisica } from "../services/infraestructuraFisicaService";
import CeldaObservacionConHistorial from "@shared/components/CeldaObservacionConHistorial";
import { formatCantidad, formatFecha } from "@shared/utils/formatters";
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
import {
  BloqueSeccionGris,
  CampoConEtiquetaArriba,
  TituloSeccionFormulario,
  botonRegistroInventarioSx,
  campoFormSx,
} from "@shared/components/FormularioInventarioSecciones";

const MAX_OBSERVACION = 500;
const MAX_TEXTO_CORTO = 60;
const MAX_PROCEDENCIA = 100;

const TIPOS_PROCEDENCIA = [
  { value: "interna", label: "Interna" },
  { value: "externa", label: "Externa" },
];

const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);
const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);

const hoyISO = () => new Date().toISOString().split("T")[0];

const REPRODUCTOR_FORM_REQUIRED = [
  "ubicacion",
  "infraestructura_fisica_destino_id",
  "fecha_siembra",
  "lote_genetico",
  "machos",
  "genetica_machos",
  "familia_machos",
  "tipo_procedencia_machos",
  "hembras",
  "genetica_hembras",
  "familia_hembras",
  "tipo_procedencia_hembras",
  "talla",
  "observacion",
];

const FORM_INICIAL = {
  ubicacion: "",
  infraestructura_fisica_destino_id: "",
  fecha_siembra: hoyISO(),
  lote_genetico: "",
  machos: "",
  genetica_machos: "",
  familia_machos: "",
  tipo_procedencia_machos: "",
  procedencia_machos_infraestructura_fisica_id: "",
  procedencia_machos_externa: "",
  hembras: "",
  genetica_hembras: "",
  familia_hembras: "",
  tipo_procedencia_hembras: "",
  procedencia_hembras_infraestructura_fisica_id: "",
  procedencia_hembras_externa: "",
  cantidad: "",
  ratio: "",
  talla: "",
  observacion: "",
};

function resolverProcedencia(tipo, infraestructuraFisicaId, textoExterno, infraestructurasFisicasEngorda) {
  if (tipo === "interna") {
    const infraestructuraFisica = infraestructurasFisicasEngorda.find(
      (p) => String(p.infraestructura_fisica_id) === String(infraestructuraFisicaId),
    );
    return infraestructuraFisica?.nombre?.trim() ?? "";
  }
  if (tipo === "externa") {
    return String(textoExterno ?? "").trim();
  }
  return "";
}

function parseProcedenciaDesdeBackend(valor, infraestructurasFisicasEngorda) {
  const texto = String(valor ?? "").trim();
  if (!texto) {
    return { tipo: "", infraestructuraFisicaId: "", externa: "" };
  }
  const infraestructuraFisica = infraestructurasFisicasEngorda.find((p) => String(p.nombre ?? "").trim() === texto);
  if (infraestructuraFisica) {
    return {
      tipo: "interna",
      infraestructuraFisicaId: String(infraestructuraFisica.infraestructura_fisica_id ?? ""),
      externa: "",
    };
  }
  return { tipo: "externa", infraestructuraFisicaId: "", externa: texto };
}

function CeldaTipoProcedencia({ valor, infraestructurasFisicasEngorda }) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "—";

  const { tipo } = parseProcedenciaDesdeBackend(texto, infraestructurasFisicasEngorda);
  if (tipo !== "interna" && tipo !== "externa") return "—";

  const esInterna = tipo === "interna";

  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        color: esInterna ? "#01579b" : "#5d4037",
        bgcolor: esInterna ? "#e1f5fe" : "#efebe9",
        border: "1px solid",
        borderColor: esInterna ? "#81d4fa" : "#bcaaa4",
      }}
    >
      {esInterna ? "Interna" : "Externa"}
    </Box>
  );
}

function valorProcedenciaTabla(valor, infraestructurasFisicasEngorda) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "—";
  const { tipo } = parseProcedenciaDesdeBackend(texto, infraestructurasFisicasEngorda);
  if (tipo === "interna") {
    const infraestructuraFisica = infraestructurasFisicasEngorda.find((p) => String(p.nombre ?? "").trim() === texto);
    const granja = infraestructuraFisica?.granja ?? "";
    return granja ? `${texto} (${granja})` : texto;
  }
  return texto;
}

function camposRequeridosProcedencia(formData) {
  const campos = [...REPRODUCTOR_FORM_REQUIRED];
  if (formData.tipo_procedencia_machos === "interna") {
    campos.push("procedencia_machos_infraestructura_fisica_id");
  } else if (formData.tipo_procedencia_machos === "externa") {
    campos.push("procedencia_machos_externa");
  }
  if (formData.tipo_procedencia_hembras === "interna") {
    campos.push("procedencia_hembras_infraestructura_fisica_id");
  } else if (formData.tipo_procedencia_hembras === "externa") {
    campos.push("procedencia_hembras_externa");
  }
  return campos;
}

function CamposProcedencia({ prefijo, etiquetaTipo, formData, handleChange, errors, infraestructurasFisicasEngorda }) {
  const tipoField = `tipo_procedencia_${prefijo}`;
  const infraestructuraFisicaField = `procedencia_${prefijo}_infraestructura_fisica_id`;
  const externaField = `procedencia_${prefijo}_externa`;
  const tipo = formData[tipoField];

  return (
    <>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <TextField
          select
          label={etiquetaTipo}
          name={tipoField}
          value={formData[tipoField] || ""}
          onChange={handleChange}
          fullWidth
          sx={campoFormSx}
          error={!!errors[tipoField]}
          {...(errors[tipoField] ? { helperText: errors[tipoField] } : {})}
        >
          {TIPOS_PROCEDENCIA.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      {tipo === "interna" && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            select
            label="Infraestructura física de engorda"
            name={infraestructuraFisicaField}
            value={formData[infraestructuraFisicaField] || ""}
            onChange={handleChange}
            fullWidth
            sx={campoFormSx}
            error={!!errors[infraestructuraFisicaField]}
            {...(errors[infraestructuraFisicaField] ? { helperText: errors[infraestructuraFisicaField] } : {})}
          >
            {infraestructurasFisicasEngorda.map((p) => {
              const pid = p.infraestructura_fisica_id;
              const granja = p.granja ?? p.nombre_ubicacion ?? "";
              const etiqueta = granja ? `${p.nombre} (${granja})` : p.nombre;
              return (
                <MenuItem key={pid} value={String(pid)}>
                  {etiqueta}
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
      )}
      {tipo === "externa" && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            label="Ubicación externa"
            name={externaField}
            value={formData[externaField] || ""}
            onChange={handleChange}
            fullWidth
            sx={campoFormSx}
            inputProps={{ maxLength: MAX_PROCEDENCIA }}
            error={!!errors[externaField]}
            {...(errors[externaField] ? { helperText: errors[externaField] } : {})}
          />
        </Grid>
      )}
    </>
  );
}

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
    machos: machosRaw === "" && m === 0 ? "" : String(m),
    hembras: hembrasRaw === "" && h === 0 ? "" : String(h),
    cantidad: total > 0 ? String(total) : "",
    ratio: ratio,
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
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();
  const { ubicacionesGranja, defaultUbicacion, getGroups } = useUbicacionesGranja();

  const [infraestructurasFisicasDestino, setInfraestructurasFisicasDestino] = useState([]);
  const [infraestructurasFisicasEngorda, setInfraestructurasFisicasEngorda] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState({ ...FORM_INICIAL });

  const infraestructurasFisicasFiltradas = useMemo(
    () => filtrarPorUbicacion(infraestructurasFisicasDestino, formData.ubicacion, ubicacionesGranja),
    [infraestructurasFisicasDestino, formData.ubicacion, ubicacionesGranja],
  );

  const registrosVista = useMemo(() => vistaActualPorInfraestructuraFisica(registros), [registros]);

  const gruposRegistros = useMemo(
    () => getGroups(registrosVista, "granja"),
    [getGroups, registrosVista],
  );

  const payloadComunBackend = () => ({
    infraestructura_fisica_id: Number(formData.infraestructura_fisica_destino_id),
    infraestructura_fisica_destino_id: Number(formData.infraestructura_fisica_destino_id),
    fecha_siembra: formData.fecha_siembra || null,
    lote_genetico: formData.lote_genetico?.trim() || null,
    machos: Number(formData.machos || 0),
    hembras: Number(formData.hembras || 0),
    tipo_procedencia_machos: formData.tipo_procedencia_machos || undefined,
    procedencia_machos_infraestructura_fisica_id: formData.procedencia_machos_infraestructura_fisica_id
      ? Number(formData.procedencia_machos_infraestructura_fisica_id)
      : undefined,
    tipo_procedencia_hembras: formData.tipo_procedencia_hembras || undefined,
    procedencia_hembras_infraestructura_fisica_id: formData.procedencia_hembras_infraestructura_fisica_id
      ? Number(formData.procedencia_hembras_infraestructura_fisica_id)
      : undefined,
    genetica_machos: formData.genetica_machos,
    familia_machos: formData.familia_machos,
    procedencia_machos: resolverProcedencia(
      formData.tipo_procedencia_machos,
      formData.procedencia_machos_infraestructura_fisica_id,
      formData.procedencia_machos_externa,
      infraestructurasFisicasEngorda,
    ),
    genetica_hembras: formData.genetica_hembras,
    familia_hembras: formData.familia_hembras,
    procedencia_hembras: resolverProcedencia(
      formData.tipo_procedencia_hembras,
      formData.procedencia_hembras_infraestructura_fisica_id,
      formData.procedencia_hembras_externa,
      infraestructurasFisicasEngorda,
    ),
    talla: formData.talla === "" ? null : Number(formData.talla),
    observacion: formData.observacion,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "machos" || name === "hembras") {
      if (!soloEntero(value)) return;
    }
    if (name === "talla") {
      if (!soloDecimal(value)) return;
    }

    setFormData((prev) => {
      if (name === "ubicacion") {
        return { ...prev, ubicacion: value, infraestructura_fisica_destino_id: "" };
      }
      if (name === "machos") {
        return aplicarMachosHembras(prev, value, prev.hembras);
      }
      if (name === "hembras") {
        return aplicarMachosHembras(prev, prev.machos, value);
      }
      if (name === "tipo_procedencia_machos") {
        return {
          ...prev,
          tipo_procedencia_machos: value,
          procedencia_machos_infraestructura_fisica_id: "",
          procedencia_machos_externa: "",
        };
      }
      if (name === "tipo_procedencia_hembras") {
        return {
          ...prev,
          tipo_procedencia_hembras: value,
          procedencia_hembras_infraestructura_fisica_id: "",
          procedencia_hembras_externa: "",
        };
      }
      return { ...prev, [name]: value };
    });
    clearFieldError(name);
  };

  const cargarInfraestructuraFisicaDestino = useCallback(async () => {
    try {
      const res = await listInfraestructuraFisica(null, "reproductores");
      setInfraestructurasFisicasDestino(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando infraestructurasFisicas reproductores:", err);
    }
  }, []);

  const cargarInfraestructuraFisicaEngorda = useCallback(async () => {
    try {
      const res = await listInfraestructuraFisica(null, "engorda");
      setInfraestructurasFisicasEngorda(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando infraestructurasFisicas engorda:", err);
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
    cargarInfraestructuraFisicaDestino();
    cargarInfraestructuraFisicaEngorda();
    cargarRegistros();
  }, [cargarInfraestructuraFisicaDestino, cargarInfraestructuraFisicaEngorda, cargarRegistros]);

  useEffect(() => {
    if (!formData.ubicacion && defaultUbicacion) {
      setFormData((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, formData.ubicacion]);

  const validarTotalPositivo = () => {
    const total = Number(formData.machos || 0) + Number(formData.hembras || 0);
    if (total < 1) {
      showSnackbar("Debe haber al menos un macho o una hembra.", "error");
      return false;
    }
    return true;
  };

  const registrarReproductor = async () => {
    if (!validate(formData, camposRequeridosProcedencia(formData))) return;
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

  const mapSeleccionadoAForm = (row) => {
    const procedenciaMachos = parseProcedenciaDesdeBackend(
      row.procedencia_machos,
      infraestructurasFisicasEngorda,
    );
    const procedenciaHembras = parseProcedenciaDesdeBackend(
      row.procedencia_hembras,
      infraestructurasFisicasEngorda,
    );

    return {
      ubicacion: row.granja || defaultUbicacion || "",
      infraestructura_fisica_destino_id: String(
        row.infraestructura_fisica_destino_id ?? row.infraestructura_fisica_id ?? "",
      ),
      fecha_siembra: row.fecha_siembra
        ? String(row.fecha_siembra).split("T")[0]
        : hoyISO(),
      lote_genetico: row.lote_genetico ?? "",
      machos: String(row.machos ?? ""),
      genetica_machos: row.genetica_machos ?? "",
      familia_machos: row.familia_machos ?? "",
      tipo_procedencia_machos: procedenciaMachos.tipo,
      procedencia_machos_infraestructura_fisica_id: procedenciaMachos.infraestructuraFisicaId,
      procedencia_machos_externa: procedenciaMachos.externa,
      hembras: String(row.hembras ?? ""),
      genetica_hembras: row.genetica_hembras ?? "",
      familia_hembras: row.familia_hembras ?? "",
      tipo_procedencia_hembras: procedenciaHembras.tipo,
      procedencia_hembras_infraestructura_fisica_id: procedenciaHembras.infraestructuraFisicaId,
      procedencia_hembras_externa: procedenciaHembras.externa,
      cantidad: String(row.cantidad_total ?? row.cantidad ?? ""),
      ratio: row.ratio ?? "",
      talla: row.talla != null ? String(row.talla) : "",
      observacion: row.observacion ?? "",
    };
  };

  const activarEdicion = () => {
    if (!seleccionado) return;
    clearErrors();
    setFormData(mapSeleccionadoAForm(seleccionado));
    setModoEdicion(true);
    abrirFormulario();
  };

  const actualizarRegistro = async () => {
    if (!validate(formData, camposRequeridosProcedencia(formData))) return;
    if (!validarTotalPositivo()) return;
    try {
      await updateReproductor(
        seleccionado.reproductor_id ?? seleccionado.id,
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

  const formatearFecha = (fechaISO) => formatFecha(fechaISO);

  const totalOrganismos = registros.reduce(
    (acc, r) => acc + Number(r.cantidad_total ?? 0),
    0,
  );

  const cargarHistorialObservaciones = useCallback(
    (infraestructuraFisicaId) => listObservacionesInfraestructuraFisica(infraestructuraFisicaId),
    [],
  );

  const headerCell = { color: "white", fontWeight: "bold", whiteSpace: "nowrap" };

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold", color: "#004d73" }}>
        Lote de reproductores
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Módulo 1: registra el grupo activo en el estanque de reproducción (padres, proporción y lote genético).
      </Typography>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Registros:</b> {registros.length}</Typography>
        <Typography>
          <b>Total reproductores (vista):</b> {formatCantidad(totalOrganismos, "0")}
        </Typography>
      </Paper>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3, bgcolor: "#fff" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: "#1a3c34" }}>
              {modoEdicion ? "Editar registro" : "Registrar nuevo inventario"}
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
                  label="Infraestructura física (reproductores)"
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

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Fecha siembra reproductores"
                  name="fecha_siembra"
                  type="date"
                  value={formData.fecha_siembra}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={campoFormSx}
                  error={!!errors.fecha_siembra}
                  {...(errors.fecha_siembra ? { helperText: errors.fecha_siembra } : {})}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Lote genético (origen padres)"
                  name="lote_genetico"
                  value={formData.lote_genetico}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
                  inputProps={{ maxLength: 120 }}
                  error={!!errors.lote_genetico}
                  {...(errors.lote_genetico ? { helperText: errors.lote_genetico } : {})}
                />
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Información machos" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CampoNumerico
                      label="Machos"
                      name="machos"
                      decimalScale={0}
                      value={formData.machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                      error={!!errors.machos}
                      {...(errors.machos ? { helperText: errors.machos } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Genética machos"
                      name="genetica_machos"
                      value={formData.genetica_machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.genetica_machos}
                      {...(errors.genetica_machos ? { helperText: errors.genetica_machos } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Familia machos"
                      name="familia_machos"
                      value={formData.familia_machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.familia_machos}
                      {...(errors.familia_machos ? { helperText: errors.familia_machos } : {})}
                    />
                  </Grid>
                  <CamposProcedencia
                    prefijo="machos"
                    etiquetaTipo="Procedencia machos"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    infraestructurasFisicasEngorda={infraestructurasFisicasEngorda}
                  />
                </Grid>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Información hembras" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <CampoNumerico
                      label="Hembras"
                      name="hembras"
                      decimalScale={0}
                      value={formData.hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                      error={!!errors.hembras}
                      {...(errors.hembras ? { helperText: errors.hembras } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Genética hembras"
                      name="genetica_hembras"
                      value={formData.genetica_hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.genetica_hembras}
                      {...(errors.genetica_hembras ? { helperText: errors.genetica_hembras } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Familia hembras"
                      name="familia_hembras"
                      value={formData.familia_hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.familia_hembras}
                      {...(errors.familia_hembras ? { helperText: errors.familia_hembras } : {})}
                    />
                  </Grid>
                  <CamposProcedencia
                    prefijo="hembras"
                    etiquetaTipo="Procedencia hembras"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    infraestructurasFisicasEngorda={infraestructurasFisicasEngorda}
                  />
                </Grid>
              </Grid>

              <Grid size={12}>
                <BloqueSeccionGris titulo="Datos técnicos">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CampoConEtiquetaArriba label="Total reproductores">
                        <TextField
                          name="cantidad"
                          value={formData.cantidad}
                          fullWidth
                          disabled
                          placeholder="Total reproduct..."
                          sx={campoFormSx}
                          hiddenLabel
                        />
                      </CampoConEtiquetaArriba>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CampoConEtiquetaArriba label="Relación (H/M)">
                        <TextField
                          name="ratio"
                          value={formData.ratio}
                          fullWidth
                          disabled
                          placeholder="Relación (H/M)"
                          sx={campoFormSx}
                          hiddenLabel
                        />
                      </CampoConEtiquetaArriba>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CampoConEtiquetaArriba label="Talla (Gr)">
                        <TextField
                          name="talla"
                          value={formData.talla}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Talla (Gr)"
                          sx={campoFormSx}
                          hiddenLabel
                          inputProps={{ inputMode: "decimal" }}
                          error={!!errors.talla}
                          {...(errors.talla ? { helperText: errors.talla } : {})}
                        />
                      </CampoConEtiquetaArriba>
                    </Grid>
                  </Grid>
                </BloqueSeccionGris>
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
                    error={!!errors.observacion}
                    {...(errors.observacion ? { helperText: errors.observacion } : {})}
                  />
                </CampoConEtiquetaArriba>
              </Grid>

              <Grid size={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={modoEdicion ? actualizarRegistro : registrarReproductor}
                  sx={botonRegistroInventarioSx}
                >
                  {modoEdicion ? "Guardar cambios" : "Registrar reproductor"}
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
        Muestra el último registro periódico de cada infraestructura física. Fechas y días se calculan al consultar.
      </Typography>

      <TablasPorUbicacionGranja
        grupos={gruposRegistros}
        renderTabla={(rows) => {
          const filas = ordenarYNumerar(rows, ["reproductor_id", "id"]);
          return (
          <Paper sx={{ width: "100%", borderRadius: 2, boxShadow: 3 }}>
            <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
              <Table sx={{ minWidth: 2200 }}>
                <TableHead sx={{ backgroundColor: "#006d77" }}>
                  <TableRow>
                    <TableCell sx={headerCell}>ID</TableCell>
                    <TableCell sx={headerCell}>Infraestructura física</TableCell>
                    <TableCell sx={headerCell}>Machos</TableCell>
                    <TableCell sx={headerCell}>Genética machos</TableCell>
                    <TableCell sx={headerCell}>Familia machos</TableCell>
                    <TableCell sx={headerCell}>Tipo procedencia</TableCell>
                    <TableCell sx={headerCell}>Procedencia machos</TableCell>
                    <TableCell sx={headerCell}>Hembras</TableCell>
                    <TableCell sx={headerCell}>Genética hembras</TableCell>
                    <TableCell sx={headerCell}>Familia hembras</TableCell>
                    <TableCell sx={headerCell}>Tipo procedencia</TableCell>
                    <TableCell sx={headerCell}>Procedencia hembras</TableCell>
                    <TableCell sx={headerCell}>Total</TableCell>
                    <TableCell sx={headerCell}>Desovez</TableCell>
                    <TableCell sx={headerCell}>Estado ciclo</TableCell>
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
                  {filas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={22} align="center">
                        No hay registros.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filas.map((l) => {
                      const diasPila = l.dias_en_pila;
                      const diasBio = l.dias_transcurridos_biometria;
                      return (
                        <TableRow
                          key={l.reproductor_id ?? l.id}
                          onClick={() => setSeleccionado(l)}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              (seleccionado?.reproductor_id ?? seleccionado?.id) ===
                              (l.reproductor_id ?? l.id)
                                ? "#e0f7fa"
                                : "transparent",
                          }}
                        >
                          <TableCell>{l._num}</TableCell>
                          <TableCell>{l.nombre_infraestructura_fisica_destino || l.nombre_infraestructura_fisica || "—"}</TableCell>
                          <TableCell align="right">{formatCantidad(l.machos)}</TableCell>
                          <TableCell>{l.genetica_machos ?? "—"}</TableCell>
                          <TableCell>{l.familia_machos ?? "—"}</TableCell>
                          <TableCell>
                            <CeldaTipoProcedencia
                              valor={l.procedencia_machos}
                              infraestructurasFisicasEngorda={infraestructurasFisicasEngorda}
                            />
                          </TableCell>
                          <TableCell>
                            {valorProcedenciaTabla(
                              l.procedencia_machos,
                              infraestructurasFisicasEngorda,
                            )}
                          </TableCell>
                          <TableCell align="right">{formatCantidad(l.hembras)}</TableCell>
                          <TableCell>{l.genetica_hembras ?? "—"}</TableCell>
                          <TableCell>{l.familia_hembras ?? "—"}</TableCell>
                          <TableCell>
                            <CeldaTipoProcedencia
                              valor={l.procedencia_hembras}
                              infraestructurasFisicasEngorda={infraestructurasFisicasEngorda}
                            />
                          </TableCell>
                          <TableCell>
                            {valorProcedenciaTabla(
                              l.procedencia_hembras,
                              infraestructurasFisicasEngorda,
                            )}
                          </TableCell>
                          <TableCell align="right">{formatCantidad(l.cantidad_total)}</TableCell>
                          <TableCell align="right">{formatCantidad(l.desovez ?? 0)}</TableCell>
                          <TableCell>
                            {l.estado_ciclo === "agotado"
                              ? "Agotado"
                              : l.estado_ciclo_label ?? "Activo"}
                          </TableCell>
                          <TableCell>{l.ratio ?? "—"}</TableCell>
                          <TableCell align="right">{formatCantidad(l.talla)}</TableCell>
                          <TableCell sx={{ maxWidth: 200, verticalAlign: "top" }}>
                            <CeldaObservacionConHistorial
                              texto={l.observacion ?? ""}
                              infraestructuraFisicaId={
                                l.infraestructura_fisica_destino_id ?? l.infraestructura_fisica_id
                              }
                              infraestructuraFisicaNombre={l.nombre_infraestructura_fisica_destino || l.nombre_infraestructura_fisica}
                              etapaLabel="Reproductores"
                              cargarHistorial={cargarHistorialObservaciones}
                            />
                          </TableCell>
                          <TableCell>{formatearFecha(l.fecha_siembra)}</TableCell>
                          <TableCell>
                            <Box component="span" sx={{ color: colorDias(diasPila), fontWeight: "bold" }}>
                              {diasPila != null && diasPila !== "" ? diasPila : "—"}
                            </Box>
                          </TableCell>
                          <TableCell>{formatearFecha(l.fecha_biometria)}</TableCell>
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
