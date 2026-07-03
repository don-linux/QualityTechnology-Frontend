import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {
  listMedicamentos,
  createMedicamento,
  updateMedicamento,
} from "../services/bitacorasService";
import { listInfraestructuraFisica } from "@features/inventarios/services/infraestructuraFisicaService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { formatFecha, toInputDate } from "@shared/utils/formatters";

const MAX_DIAGNOSTICO = 500;
const MAX_FARMACO = 500;

const tipoLabel = (t) => {
  if (!t) return "—";
  const map = { alevinaje: "Alevinaje", reproductores: "Reproductores", engorda: "Engorda" };
  return map[String(t).toLowerCase()] || t;
};

function calcularPeriodoDias(fechaInicio, fechaFinal) {
  if (!fechaInicio || !fechaFinal) return "";
  const inicio = new Date(`${fechaInicio}T00:00:00`);
  const fin = new Date(`${fechaFinal}T00:00:00`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime()) || fin < inicio) {
    return "";
  }
  return Math.floor((fin - inicio) / 86400000) + 1;
};

const FORM_INICIAL = (ubicacion = "", usuarioId = "") => ({
  ubicacion,
  infraestructura_fisica_id: "",
  diagnostico: "",
  farmaco: "",
  fecha_inicio: "",
  fecha_final: "",
  usuario_id: usuarioId,
});

function MedicamentosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups, resolveFiltroUbicacion } =
    useUbicacionesGranja();
  const [form, setForm] = useState(FORM_INICIAL("", usuarioId));
  const [data, setData] = useState([]);
  const [infraestructurasFisicas, setInfraestructurasFisicas] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } =
    useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "infraestructura_fisica_id",
    "diagnostico",
    "farmaco",
    "fecha_inicio",
    "fecha_final",
  ];

  const periodoPreview = useMemo(
    () => calcularPeriodoDias(form.fecha_inicio, form.fecha_final),
    [form.fecha_inicio, form.fecha_final],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    if (name === "ubicacion") {
      setForm((prev) => ({ ...prev, ubicacion: value, infraestructura_fisica_id: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const cargarDatos = async () => {
    try {
      const res = await listMedicamentos();
      setData(Array.isArray(res.data) ? res.data : []);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarInfraestructuraFisica = async (ubicacionSeleccionNombre) => {
    if (!ubicacionSeleccionNombre) {
      setInfraestructurasFisicas([]);
      return;
    }
    const filtro = resolveFiltroUbicacion(ubicacionSeleccionNombre);
    if (!filtro.granja && !filtro.ubicacion_id) {
      setInfraestructurasFisicas([]);
      return;
    }
    try {
      const res = await listInfraestructuraFisica(filtro);
      setInfraestructurasFisicas(Array.isArray(res.data) ? res.data : []);
    } catch {
      setInfraestructurasFisicas([]);
      showSnackbar("Error al cargar instalaciones.", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarInfraestructuraFisica(form.ubicacion);
  }, [form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;

    const payload = {
      ubicacion: form.ubicacion,
      infraestructura_fisica_id: Number(form.infraestructura_fisica_id),
      diagnostico: form.diagnostico,
      farmaco: form.farmaco,
      fecha_inicio: form.fecha_inicio,
      fecha_final: form.fecha_final,
    };

    try {
      if (editId) {
        await updateMedicamento(editId, payload);
      } else {
        await createMedicamento(payload);
      }

      setEditId(null);
      cerrarFormulario();
      setForm(FORM_INICIAL(form.ubicacion, usuarioId));
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      ubicacion: r.ubicacion || "",
      infraestructura_fisica_id: r.infraestructura_fisica_id ? String(r.infraestructura_fisica_id) : "",
      diagnostico: r.diagnostico || "",
      farmaco: r.farmaco || "",
      fecha_inicio: toInputDate(r.fecha_inicio),
      fecha_final: toInputDate(r.fecha_final),
      usuario_id: r.usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Instalación", value: (r) => r.nombre_instalacion ?? "—", truncate: true, maxWidth: 160 },
    { header: "Diagnóstico", value: (r) => r.diagnostico, truncate: true, maxWidth: 160 },
    { header: "Fármaco", value: (r) => r.farmaco, truncate: true, maxWidth: 160 },
    { header: "Fecha Inicio", value: (r) => formatFecha(r.fecha_inicio) },
    { header: "Fecha Final", value: (r) => formatFecha(r.fecha_final) },
    { header: "Periodo", value: (r) => r.periodo ?? "—" },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1100}
      acciones={(r) => (
        <Button size="small" color="warning" variant="contained" onClick={() => editar(r)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Aplicación de Medicamentos
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Ubicación"
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.ubicacion}
                  helperText={errors.ubicacion}
                >
                  {ubicacionesGranja.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  select
                  label="Instalación"
                  name="infraestructura_fisica_id"
                  value={form.infraestructura_fisica_id}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.infraestructura_fisica_id}
                  helperText={errors.infraestructura_fisica_id}
                  SelectProps={{
                    renderValue: (selected) => {
                      const p = infraestructurasFisicas.find(
                        (x) => String(x.infraestructura_fisica_id ?? x.id) === String(selected),
                      );
                      if (!p) return selected ? `#${selected}` : "";
                      return `${p.nombre} · ${tipoLabel(p.tipo)} · ${p.estado || "—"}`;
                    },
                  }}
                >
                  <MenuItem value="">Selecciona instalación</MenuItem>
                  {infraestructurasFisicas.map((p) => (
                    <MenuItem key={p.infraestructura_fisica_id ?? p.id} value={String(p.infraestructura_fisica_id ?? p.id)}>
                      {p.nombre} · {tipoLabel(p.tipo)} · {p.estado || "—"}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Diagnóstico"
                  name="diagnostico"
                  value={form.diagnostico}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.diagnostico}
                  helperText={errors.diagnostico || `${form.diagnostico.length}/${MAX_DIAGNOSTICO}`}
                  inputProps={{ maxLength: MAX_DIAGNOSTICO }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Fármaco"
                  name="farmaco"
                  value={form.farmaco}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.farmaco}
                  helperText={errors.farmaco || `${form.farmaco.length}/${MAX_FARMACO}`}
                  inputProps={{ maxLength: MAX_FARMACO }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  name="fecha_inicio"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_inicio}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fecha_inicio}
                  helperText={errors.fecha_inicio}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Fecha Final"
                  type="date"
                  name="fecha_final"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_final}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fecha_final}
                  helperText={errors.fecha_final}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Periodo"
                  value={periodoPreview !== "" ? periodoPreview : ""}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  helperText={periodoPreview !== "" ? "días" : "Se calcula al seleccionar ambas fechas"}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" onClick={guardar}>
                {editId ? "Actualizar" : "Guardar"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja
        grupos={gruposUbicacion}
        renderTabla={renderTabla}
        filtros={["busqueda"]}
        filtroConfig={{
          busqueda: {
            keys: ["nombre_instalacion", "diagnostico", "farmaco"],
            placeholder: "Buscar instalación, diagnóstico o fármaco",
          },
        }}
        exportar={{
          columnas,
          titulo: "Aplicación de Medicamentos",
          subtitulo: "Registro de aplicación de fármacos por instalación",
          nombreArchivo: "Medicamentos",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function Medicamentos() {
  return <MedicamentosContent />;
}
