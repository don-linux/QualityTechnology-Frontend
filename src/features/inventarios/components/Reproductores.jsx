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

const REPRODUCTOR_FORM_REQUIRED = [
  "ubicacion",
  "fi_pileta_destino_id",
  "fn_machos",
  "fc_genetica_machos",
  "fc_familia_machos",
  "fc_tipo_procedencia_machos",
  "fn_hembras",
  "fc_genetica_hembras",
  "fc_familia_hembras",
  "fc_tipo_procedencia_hembras",
  "fn_talla",
  "observacion",
];

const FORM_INICIAL = {
  ubicacion: "",
  fi_pileta_destino_id: "",
  fn_machos: "",
  fc_genetica_machos: "",
  fc_familia_machos: "",
  fc_tipo_procedencia_machos: "",
  fc_procedencia_machos_pileta_id: "",
  fc_procedencia_machos_externa: "",
  fn_hembras: "",
  fc_genetica_hembras: "",
  fc_familia_hembras: "",
  fc_tipo_procedencia_hembras: "",
  fc_procedencia_hembras_pileta_id: "",
  fc_procedencia_hembras_externa: "",
  fn_cantidad: "",
  fc_ratio: "",
  fn_talla: "",
  observacion: "",
};

function resolverProcedencia(tipo, piletaId, textoExterno, piletasEngorda) {
  if (tipo === "interna") {
    const pileta = piletasEngorda.find(
      (p) => String(p.fi_pileta_id ?? p.pileta_id) === String(piletaId),
    );
    return pileta?.nombre?.trim() ?? "";
  }
  if (tipo === "externa") {
    return String(textoExterno ?? "").trim();
  }
  return "";
}

function parseProcedenciaDesdeBackend(valor, piletasEngorda) {
  const texto = String(valor ?? "").trim();
  if (!texto) {
    return { tipo: "", piletaId: "", externa: "" };
  }
  const pileta = piletasEngorda.find((p) => String(p.nombre ?? "").trim() === texto);
  if (pileta) {
    return {
      tipo: "interna",
      piletaId: String(pileta.fi_pileta_id ?? pileta.pileta_id ?? ""),
      externa: "",
    };
  }
  return { tipo: "externa", piletaId: "", externa: texto };
}

function CeldaTipoProcedencia({ valor, piletasEngorda }) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "—";

  const { tipo } = parseProcedenciaDesdeBackend(texto, piletasEngorda);
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

function valorProcedenciaTabla(valor, piletasEngorda) {
  const texto = String(valor ?? "").trim();
  if (!texto) return "—";
  const { tipo } = parseProcedenciaDesdeBackend(texto, piletasEngorda);
  if (tipo === "interna") {
    const pileta = piletasEngorda.find((p) => String(p.nombre ?? "").trim() === texto);
    const granja = pileta?.fc_granja ?? pileta?.granja ?? "";
    return granja ? `${texto} (${granja})` : texto;
  }
  return texto;
}

function camposRequeridosProcedencia(formData) {
  const campos = [...REPRODUCTOR_FORM_REQUIRED];
  if (formData.fc_tipo_procedencia_machos === "interna") {
    campos.push("fc_procedencia_machos_pileta_id");
  } else if (formData.fc_tipo_procedencia_machos === "externa") {
    campos.push("fc_procedencia_machos_externa");
  }
  if (formData.fc_tipo_procedencia_hembras === "interna") {
    campos.push("fc_procedencia_hembras_pileta_id");
  } else if (formData.fc_tipo_procedencia_hembras === "externa") {
    campos.push("fc_procedencia_hembras_externa");
  }
  return campos;
}

function CamposProcedencia({ prefijo, etiquetaTipo, formData, handleChange, errors, piletasEngorda }) {
  const tipoField = `fc_tipo_procedencia_${prefijo}`;
  const piletaField = `fc_procedencia_${prefijo}_pileta_id`;
  const externaField = `fc_procedencia_${prefijo}_externa`;
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
            label="Pileta de engorda"
            name={piletaField}
            value={formData[piletaField] || ""}
            onChange={handleChange}
            fullWidth
            sx={campoFormSx}
            error={!!errors[piletaField]}
            {...(errors[piletaField] ? { helperText: errors[piletaField] } : {})}
          >
            {piletasEngorda.map((p) => {
              const pid = p.fi_pileta_id ?? p.pileta_id;
              const granja = p.fc_granja ?? p.granja ?? p.nombre_ubicacion ?? "";
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
  const [piletasEngorda, setPiletasEngorda] = useState([]);
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
    fc_tipo_procedencia_machos: formData.fc_tipo_procedencia_machos || undefined,
    fc_procedencia_machos_pileta_id: formData.fc_procedencia_machos_pileta_id
      ? Number(formData.fc_procedencia_machos_pileta_id)
      : undefined,
    fc_tipo_procedencia_hembras: formData.fc_tipo_procedencia_hembras || undefined,
    fc_procedencia_hembras_pileta_id: formData.fc_procedencia_hembras_pileta_id
      ? Number(formData.fc_procedencia_hembras_pileta_id)
      : undefined,
    genetica_machos: formData.fc_genetica_machos,
    familia_machos: formData.fc_familia_machos,
    procedencia_machos: resolverProcedencia(
      formData.fc_tipo_procedencia_machos,
      formData.fc_procedencia_machos_pileta_id,
      formData.fc_procedencia_machos_externa,
      piletasEngorda,
    ),
    genetica_hembras: formData.fc_genetica_hembras,
    familia_hembras: formData.fc_familia_hembras,
    procedencia_hembras: resolverProcedencia(
      formData.fc_tipo_procedencia_hembras,
      formData.fc_procedencia_hembras_pileta_id,
      formData.fc_procedencia_hembras_externa,
      piletasEngorda,
    ),
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
      if (name === "fc_tipo_procedencia_machos") {
        return {
          ...prev,
          fc_tipo_procedencia_machos: value,
          fc_procedencia_machos_pileta_id: "",
          fc_procedencia_machos_externa: "",
        };
      }
      if (name === "fc_tipo_procedencia_hembras") {
        return {
          ...prev,
          fc_tipo_procedencia_hembras: value,
          fc_procedencia_hembras_pileta_id: "",
          fc_procedencia_hembras_externa: "",
        };
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

  const cargarPiletasEngorda = useCallback(async () => {
    try {
      const res = await listPiletas(null, "engorda");
      setPiletasEngorda(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando piletas engorda:", err);
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
    cargarPiletasEngorda();
    cargarRegistros();
  }, [cargarPiletasDestino, cargarPiletasEngorda, cargarRegistros]);

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
      row.fc_procedencia_machos ?? row.procedencia_machos,
      piletasEngorda,
    );
    const procedenciaHembras = parseProcedenciaDesdeBackend(
      row.fc_procedencia_hembras ?? row.procedencia_hembras,
      piletasEngorda,
    );

    return {
      ubicacion: row.fc_granja || defaultUbicacion || "",
      fi_pileta_destino_id: String(
        row.fi_pileta_destino_id ?? row.pileta_destino_id ?? row.pileta_id ?? "",
      ),
      fn_machos: String(row.fn_machos ?? row.machos ?? ""),
      fc_genetica_machos: row.fc_genetica_machos ?? row.genetica_machos ?? "",
      fc_familia_machos: row.fc_familia_machos ?? row.familia_machos ?? "",
      fc_tipo_procedencia_machos: procedenciaMachos.tipo,
      fc_procedencia_machos_pileta_id: procedenciaMachos.piletaId,
      fc_procedencia_machos_externa: procedenciaMachos.externa,
      fn_hembras: String(row.fn_hembras ?? row.hembras ?? ""),
      fc_genetica_hembras: row.fc_genetica_hembras ?? row.genetica_hembras ?? "",
      fc_familia_hembras: row.fc_familia_hembras ?? row.familia_hembras ?? "",
      fc_tipo_procedencia_hembras: procedenciaHembras.tipo,
      fc_procedencia_hembras_pileta_id: procedenciaHembras.piletaId,
      fc_procedencia_hembras_externa: procedenciaHembras.externa,
      fn_cantidad: String(row.fn_cantidad ?? row.cantidad_total ?? row.cantidad ?? ""),
      fc_ratio: row.fc_ratio ?? row.ratio ?? "",
      fn_talla:
        row.fn_talla != null
          ? String(row.fn_talla)
          : row.talla != null
            ? String(row.talla)
            : "",
      observacion: row.observacion ?? row.fc_observacion ?? "",
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
                  label="Pileta (reproductores)"
                  name="fi_pileta_destino_id"
                  value={formData.fi_pileta_destino_id || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={campoFormSx}
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

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Información machos" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Machos"
                      name="fn_machos"
                      type="number"
                      value={formData.fn_machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                      error={!!errors.fn_machos}
                      {...(errors.fn_machos ? { helperText: errors.fn_machos } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Genética machos"
                      name="fc_genetica_machos"
                      value={formData.fc_genetica_machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.fc_genetica_machos}
                      {...(errors.fc_genetica_machos ? { helperText: errors.fc_genetica_machos } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Familia machos"
                      name="fc_familia_machos"
                      value={formData.fc_familia_machos}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.fc_familia_machos}
                      {...(errors.fc_familia_machos ? { helperText: errors.fc_familia_machos } : {})}
                    />
                  </Grid>
                  <CamposProcedencia
                    prefijo="machos"
                    etiquetaTipo="Procedencia machos"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    piletasEngorda={piletasEngorda}
                  />
                </Grid>
              </Grid>

              <Grid size={12}>
                <TituloSeccionFormulario titulo="Información hembras" />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Hembras"
                      name="fn_hembras"
                      type="number"
                      value={formData.fn_hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ min: 0, step: 1 }}
                      error={!!errors.fn_hembras}
                      {...(errors.fn_hembras ? { helperText: errors.fn_hembras } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Genética hembras"
                      name="fc_genetica_hembras"
                      value={formData.fc_genetica_hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.fc_genetica_hembras}
                      {...(errors.fc_genetica_hembras ? { helperText: errors.fc_genetica_hembras } : {})}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <TextField
                      label="Familia hembras"
                      name="fc_familia_hembras"
                      value={formData.fc_familia_hembras}
                      onChange={handleChange}
                      fullWidth
                      sx={campoFormSx}
                      inputProps={{ maxLength: MAX_TEXTO_CORTO }}
                      error={!!errors.fc_familia_hembras}
                      {...(errors.fc_familia_hembras ? { helperText: errors.fc_familia_hembras } : {})}
                    />
                  </Grid>
                  <CamposProcedencia
                    prefijo="hembras"
                    etiquetaTipo="Procedencia hembras"
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    piletasEngorda={piletasEngorda}
                  />
                </Grid>
              </Grid>

              <Grid size={12}>
                <BloqueSeccionGris titulo="Datos técnicos">
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <CampoConEtiquetaArriba label="Total reproductores">
                        <TextField
                          name="fn_cantidad"
                          value={formData.fn_cantidad}
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
                          name="fc_ratio"
                          value={formData.fc_ratio}
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
                          name="fn_talla"
                          value={formData.fn_talla}
                          onChange={handleChange}
                          fullWidth
                          placeholder="Talla (Gr)"
                          sx={campoFormSx}
                          hiddenLabel
                          inputProps={{ inputMode: "decimal" }}
                          error={!!errors.fn_talla}
                          {...(errors.fn_talla ? { helperText: errors.fn_talla } : {})}
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
                    <TableCell sx={headerCell}>Tipo procedencia</TableCell>
                    <TableCell sx={headerCell}>Procedencia machos</TableCell>
                    <TableCell sx={headerCell}>Hembras</TableCell>
                    <TableCell sx={headerCell}>Genética hembras</TableCell>
                    <TableCell sx={headerCell}>Familia hembras</TableCell>
                    <TableCell sx={headerCell}>Tipo procedencia</TableCell>
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
                      <TableCell colSpan={19} align="center">
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
                          <TableCell>
                            <CeldaTipoProcedencia
                              valor={l.fc_procedencia_machos ?? l.procedencia_machos}
                              piletasEngorda={piletasEngorda}
                            />
                          </TableCell>
                          <TableCell>
                            {valorProcedenciaTabla(
                              l.fc_procedencia_machos ?? l.procedencia_machos,
                              piletasEngorda,
                            )}
                          </TableCell>
                          <TableCell>{formatNumber(l.fn_hembras ?? l.hembras)}</TableCell>
                          <TableCell>{l.fc_genetica_hembras ?? l.genetica_hembras ?? "—"}</TableCell>
                          <TableCell>{l.fc_familia_hembras ?? l.familia_hembras ?? "—"}</TableCell>
                          <TableCell>
                            <CeldaTipoProcedencia
                              valor={l.fc_procedencia_hembras ?? l.procedencia_hembras}
                              piletasEngorda={piletasEngorda}
                            />
                          </TableCell>
                          <TableCell>
                            {valorProcedenciaTabla(
                              l.fc_procedencia_hembras ?? l.procedencia_hembras,
                              piletasEngorda,
                            )}
                          </TableCell>
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
