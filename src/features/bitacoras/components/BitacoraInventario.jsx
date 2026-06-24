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
    fn_num_instalacion: "",
    fn_cantidad: "",
    fn_talla: "",
    fc_lote: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_salida_hormonado: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fn_num_instalacion", "fn_cantidad", "fn_talla", "fc_lote",
    "fd_fecha_siembra", "fd_fecha_salida_hormonado", "fc_observacion",
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
        fn_num_instalacion: "",
        fn_cantidad: "",
        fn_talla: "",
        fc_lote: "",
        fc_observacion: "",
        fd_fecha_siembra: "",
        fd_fecha_salida_hormonado: "",
        fi_usuario_id: usuarioId,
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
      ubicacion: r.ubicacion || "",
      fn_num_instalacion: r.fn_num_instalacion ?? "",
      fn_cantidad: r.fn_cantidad ?? "",
      fn_talla: r.fn_talla ?? "",
      fc_lote: r.fc_lote || "",
      fc_observacion: r.fc_observacion || "",
      fd_fecha_siembra: r.fd_fecha_siembra?.split("T")[0],
      fd_fecha_salida_hormonado: r.fd_fecha_salida_hormonado?.split("T")[0],
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Instalación", value: (r) => r.fn_num_instalacion },
    { header: "Cantidad", value: (r) => r.fn_cantidad },
    { header: "Talla", value: (r) => r.fn_talla },
    { header: "Lote", value: (r) => r.fc_lote },
    { header: "Siembra", value: (r) => formatFecha(r.fd_fecha_siembra) },
    { header: "Salida Hormonado", value: (r) => formatFecha(r.fd_fecha_salida_hormonado) },
    { header: "Observación", value: (r) => r.fc_observacion, truncate: true, maxWidth: 200 },
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
                name="fn_num_instalacion"
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Cantidad"
                name="fn_cantidad"
                decimalScale={0}
                value={form.fn_cantidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_cantidad}
                helperText={errors.fn_cantidad}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico
                label="Talla"
                name="fn_talla"
                value={form.fn_talla}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_talla}
                helperText={errors.fn_talla}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Lote"
                name="fc_lote"
                value={form.fc_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_lote}
                helperText={errors.fc_lote}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Siembra"
                type="date"
                name="fd_fecha_siembra"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_siembra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_siembra}
                helperText={errors.fd_fecha_siembra}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Salida Hormonado"
                type="date"
                name="fd_fecha_salida_hormonado"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_salida_hormonado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_salida_hormonado}
                helperText={errors.fd_fecha_salida_hormonado}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Observación"
                name="fc_observacion"
                multiline
                rows={2}
                fullWidth
                value={form.fc_observacion}
                onChange={handleChange}
                error={!!errors.fc_observacion}
                helperText={errors.fc_observacion}
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
        searchKeys={["fn_num_instalacion", "fc_lote", "fc_observacion"]}
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
