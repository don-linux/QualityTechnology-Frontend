import React, { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import {
  listControlVisitas,
  createControlVisita,
  updateControlVisita,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";
import CapturaIdentificacionModal from "./CapturaIdentificacionModal";
import FotoIdentificacionDialog from "./FotoIdentificacionDialog";

function ControlVisitasContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getColor, getGroups } =
    useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_nombre_completo: "",
    fc_origen: "",
    fc_motivo: "",
    fc_observaciones: "",
    fc_foto_identificacion: "",
    fd_entrada: "",
    fd_salida: "",
    fi_usuario_id: usuarioId,
    ubicacion: "",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const [cameraOpen, setCameraOpen] = useState(false);
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoVer, setFotoVer] = useState({ open: false, path: "" });

  const requiredFields = [
    "ubicacion",
    "fd_fecha", "fc_nombre_completo", "fc_origen", "fc_motivo",
    "fc_observaciones", "fd_entrada",
    ...(editId ? [] : ["fc_foto_identificacion"]),
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCapturaFoto = (file) => {
    clearFieldError("fc_foto_identificacion");
    setForm((prev) => ({ ...prev, fc_foto_identificacion: file }));
  };

  const cargarDatos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setData([]);
      return;
    }

    try {
      const granjas = ubicacionesGranja.map((op) => op.value);
      const rows = await fetchMergedPorUbicaciones(granjas, (g) =>
        listControlVisitas(g),
      );
      setData(rows);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    const foto = form.fc_foto_identificacion;
    if (foto instanceof File) {
      const url = URL.createObjectURL(foto);
      setFotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setFotoPreview("");
    return undefined;
  }, [form.fc_foto_identificacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      const formData = new FormData();
      const appendIfValue = (key, value) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      };

      appendIfValue("fd_fecha", form.fd_fecha);
      appendIfValue("fc_nombre_completo", form.fc_nombre_completo);
      appendIfValue("fc_origen", form.fc_origen);
      appendIfValue("fc_motivo", form.fc_motivo);
      appendIfValue("fc_observaciones", form.fc_observaciones);
      if (form.fc_foto_identificacion instanceof File) {
        formData.append("fc_foto_identificacion", form.fc_foto_identificacion);
      }
      appendIfValue("fd_entrada", form.fd_entrada);
      appendIfValue("fd_salida", form.fd_salida);
      appendIfValue("fi_usuario_id", form.fi_usuario_id);
      appendIfValue("ubicacion", form.ubicacion);

      if (editId) {
        await updateControlVisita(editId, formData);
      } else {
        await createControlVisita(formData);
      }
      setEditId(null);
      cerrarFormulario();
      setForm({
        fd_fecha: "",
        fc_nombre_completo: "",
        fc_origen: "",
        fc_motivo: "",
        fc_observaciones: "",
        fc_foto_identificacion: "",
        fd_entrada: "",
        fd_salida: "",
        fi_usuario_id: usuarioId,
        ubicacion: form.ubicacion,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      fd_fecha: r.fd_fecha?.split("T")[0] || "",
      fc_nombre_completo: r.fc_nombre_completo || "",
      fc_origen: r.fc_origen || "",
      fc_motivo: r.fc_motivo || "",
      fc_observaciones: r.fc_observaciones || "",
      fc_foto_identificacion: r.fc_foto_identificacion || "",
      fd_entrada: r.fd_entrada || "",
      fd_salida: r.fd_salida || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
      ubicacion: r.ubicacion || defaultUbicacion,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha) },
    { header: "Nombre", value: (r) => r.fc_nombre_completo },
    { header: "Origen", value: (r) => r.fc_origen },
    { header: "Motivo", value: (r) => r.fc_motivo, truncate: true, maxWidth: 160 },
    {
      header: "Foto ID",
      value: (r) => (r.fc_foto_identificacion ? "Sí" : "No"),
      render: (r) =>
        r.fc_foto_identificacion ? (
          <Link
            component="button"
            type="button"
            onClick={() => setFotoVer({ open: true, path: r.fc_foto_identificacion })}
            sx={{ color: "#1976d2", fontWeight: "bold", textDecoration: "none" }}
          >
            Ver foto
          </Link>
        ) : (
          "—"
        ),
    },
    { header: "Entrada", value: (r) => r.fd_entrada },
    { header: "Salida", value: (r) => r.fd_salida },
    { header: "Observaciones", value: (r) => r.fc_observaciones, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaVisitas = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1180}
      acciones={(r) => (
        <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
          Editar
        </Button>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Control de Visitas
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                fullWidth
                size="small"
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

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                value={form.fd_fecha}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Nombre Completo"
                name="fc_nombre_completo"
                value={form.fc_nombre_completo}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_nombre_completo}
                helperText={errors.fc_nombre_completo}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Origen"
                name="fc_origen"
                value={form.fc_origen}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_origen}
                helperText={errors.fc_origen}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Motivo"
                name="fc_motivo"
                value={form.fc_motivo}
                onChange={handleChange}
                fullWidth
                multiline
                inputProps={{ maxLength: 300 }}
                error={!!errors.fc_motivo}
                helperText={errors.fc_motivo || `${form.fc_motivo.length}/300`}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${form.fc_observaciones.length}/500`}
              />
            </Grid>

            {/* Fila final: identificación (cámara) y horas */}
            <Grid size={12}>
              <Grid container spacing={2} alignItems="flex-start">
                <Grid size={{ xs: 12, md: editId ? 4 : 6 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: errors.fc_foto_identificacion ? "error.main" : "divider",
                    }}
                  >
                    {fotoPreview ? (
                      <Box
                        component="img"
                        src={fotoPreview}
                        alt="Identificación"
                        sx={{
                          width: 64,
                          height: 44,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 64,
                          height: 44,
                          borderRadius: 1,
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(25,118,210,0.06)",
                          border: "1px dashed",
                          borderColor: "rgba(25,118,210,0.4)",
                          color: "#1976d2",
                        }}
                      >
                        <PhotoCameraRoundedIcon fontSize="small" />
                      </Box>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PhotoCameraRoundedIcon />}
                          onClick={() => setCameraOpen(true)}
                          sx={{
                            textTransform: "none",
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
                          }}
                        >
                          {form.fc_foto_identificacion ? "Volver a tomar" : "Tomar fotografía"}
                        </Button>
                        {editId &&
                          typeof form.fc_foto_identificacion === "string" &&
                          form.fc_foto_identificacion && (
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<VisibilityRoundedIcon />}
                              onClick={() =>
                                setFotoVer({ open: true, path: form.fc_foto_identificacion })
                              }
                              sx={{ textTransform: "none" }}
                            >
                              Ver
                            </Button>
                          )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: errors.fc_foto_identificacion ? "error.main" : "text.secondary",
                        }}
                      >
                        {errors.fc_foto_identificacion
                          ? errors.fc_foto_identificacion
                          : form.fc_foto_identificacion
                            ? fotoPreview
                              ? "Fotografía lista"
                              : "Identificación registrada"
                            : editId
                              ? "Sin identificación"
                              : "Identificación (obligatoria)"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: editId ? 4 : 6 }}>
                  <TextField
                    label="Hora de Entrada"
                    type="time"
                    name="fd_entrada"
                    value={form.fd_entrada}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.fd_entrada}
                    helperText={errors.fd_entrada}
                  />
                </Grid>

                {editId && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Hora de Salida (opcional)"
                      type="time"
                      name="fd_salida"
                      value={form.fd_salida}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fd_salida}
                      helperText={errors.fd_salida}
                    />
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>

          {/* Botones */}
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
        renderTabla={renderTablaVisitas}
        buscar
        searchKeys={["fc_nombre_completo", "fc_origen", "fc_motivo", "fc_observaciones"]}
        placeholderBusqueda="Buscar nombre, origen o motivo"
        exportar={{
          columnas,
          titulo: "Control de Visitas",
          subtitulo: "Registro de visitas, motivos y observaciones",
          nombreArchivo: "Control_Visitas",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />

      <CapturaIdentificacionModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapturaFoto}
      />
      <FotoIdentificacionDialog
        open={fotoVer.open}
        path={fotoVer.path}
        onClose={() => setFotoVer({ open: false, path: "" })}
      />
    </Box>
  );
}

export default function ControlVisitas() {
  return <ControlVisitasContent />;
}
