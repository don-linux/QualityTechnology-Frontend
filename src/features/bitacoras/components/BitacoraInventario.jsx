import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {
  listInventario,
  createInventario,
  updateInventario,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { formatFecha } from "@shared/utils/formatters";

function BitacoraInventarioContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLogo, getColor, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    pileta_id: "",
    cantidad: "",
    talla: "",
    lote_nombre: "",
    observacion: "",
    fecha_siembra: "",
    fecha_salida_hormonado: "",
    usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "pileta_id", "cantidad", "talla", "lote_nombre",
    "fecha_siembra", "fecha_salida_hormonado", "observacion",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listInventario();
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar inventario:", err.message);
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

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateInventario(editId, form);
      else
        await createInventario(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        ubicacion: form.ubicacion,
        pileta_id: "",
        cantidad: "",
        talla: "",
        lote_nombre: "",
        observacion: "",
        fecha_siembra: "",
        fecha_salida_hormonado: "",
        usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      ubicacion: r.ubicacion || "",
      pileta_id: r.pileta_id ?? "",
      cantidad: r.cantidad ?? "",
      talla: r.talla ?? "",
      lote_nombre: r.lote_nombre || "",
      observacion: r.observacion || "",
      fecha_siembra: r.fecha_siembra?.split("T")[0],
      fecha_salida_hormonado: r.fecha_salida_hormonado?.split("T")[0],
      usuario_id: r.usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Instalación", value: (r) => r.pileta_id },
    { header: "Cantidad", value: (r) => r.cantidad },
    { header: "Talla", value: (r) => r.talla },
    { header: "Lote", value: (r) => r.lote_nombre },
    { header: "Siembra", value: (r) => formatFecha(r.fecha_siembra) },
    { header: "Salida Hormonado", value: (r) => formatFecha(r.fecha_salida_hormonado) },
    { header: "Observación", value: (r) => r.observacion, truncate: true, maxWidth: 200 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaInventario = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1000}
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
        Inventario de Alevines
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
                label="No. Instalación"
                name="pileta_id"
                value={form.pileta_id}
                onChange={handleChange}
                fullWidth
                error={!!errors.pileta_id}
                helperText={errors.pileta_id}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Cantidad"
                name="cantidad"
                decimalScale={0}
                value={form.cantidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.cantidad}
                helperText={errors.cantidad}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Talla"
                name="talla"
                value={form.talla}
                onChange={handleChange}
                fullWidth
                error={!!errors.talla}
                helperText={errors.talla}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Lote"
                name="lote_nombre"
                value={form.lote_nombre}
                onChange={handleChange}
                fullWidth
                error={!!errors.lote_nombre}
                helperText={errors.lote_nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Siembra"
                type="date"
                name="fecha_siembra"
                InputLabelProps={{ shrink: true }}
                value={form.fecha_siembra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha_siembra}
                helperText={errors.fecha_siembra}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Salida Hormonado"
                type="date"
                name="fecha_salida_hormonado"
                InputLabelProps={{ shrink: true }}
                value={form.fecha_salida_hormonado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha_salida_hormonado}
                helperText={errors.fecha_salida_hormonado}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Observación"
                name="observacion"
                multiline
                rows={2}
                fullWidth
                value={form.observacion}
                onChange={handleChange}
                error={!!errors.observacion}
                helperText={errors.observacion}
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

      {/* TABLAS POR UBICACIÓN */}
      <TablasPorUbicacionGranja
        grupos={gruposUbicacion}
        renderTabla={renderTablaInventario}
        buscar
        searchKeys={["pileta_id", "lote_nombre", "observacion"]}
        placeholderBusqueda="Buscar instalación, lote u observación"
        exportar={{
          columnas,
          titulo: "Bitácora de Inventario",
          subtitulo: "Control de inventario de alevines, siembras y observaciones",
          nombreArchivo: "Bitacora_Inventario",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function BitacoraInventario() {
  return <BitacoraInventarioContent />;
}
