import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import {
  listRecepcionInsumos,
  listEmpleadosRecepcionInsumos,
  createRecepcionInsumo,
  updateRecepcionInsumo,
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
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";

function RecepcionInsumosContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getColor, getGroups } =
    useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_proveedor: "",
    fc_producto: "",
    fc_lote: "",
    fc_cantidad: "",
    fc_unidad_medida: "",
    fc_condiciones_entrega: "",
    fc_encargado_entrega: "",
    fc_verifico: "",
    fc_observaciones: "",
    fi_usuario_id: usuarioId,
    ubicacion: "",
  });

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fd_fecha", "fc_proveedor", "fc_producto", "fc_lote",
    "fc_cantidad", "fc_unidad_medida", "fc_condiciones_entrega",
    "fc_encargado_entrega", "fc_verifico", "fc_observaciones",
  ];

  //  Opciones para selects
  const unidadesMedida = ["Kg", "Litros", "Piezas", "Bultos", "Otro"];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosRecepcionInsumos();
      setEmpleados(res.data);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  //  Cargar y filtrar registros
  const cargarDatos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setData([]);
      return;
    }

    try {
      const granjas = ubicacionesGranja.map((op) => op.value);
      const rows = await fetchMergedPorUbicaciones(granjas, listRecepcionInsumos);
      setData(rows);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja]);

  useEffect(() => {
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  //  Guardar o actualizar
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateRecepcionInsumo(editId, form);
      else await createRecepcionInsumo(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        fd_fecha: "",
        fc_proveedor: "",
        fc_producto: "",
        fc_lote: "",
        fc_cantidad: "",
        fc_unidad_medida: "",
        fc_condiciones_entrega: "",
        fc_encargado_entrega: "",
        fc_verifico: "",
        fc_observaciones: "",
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
    setForm({ ...r, fd_fecha: r.fd_fecha?.split("T")[0] });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fd_fecha) },
    { header: "Proveedor", value: (r) => r.fc_proveedor },
    { header: "Producto", value: (r) => r.fc_producto, truncate: true, maxWidth: 160 },
    { header: "Lote", value: (r) => r.fc_lote },
    { header: "Cantidad", value: (r) => r.fc_cantidad },
    { header: "Unidad", value: (r) => r.fc_unidad_medida },
    { header: "Condiciones de entrega", value: (r) => r.fc_condiciones_entrega, truncate: true, maxWidth: 160 },
    { header: "Encargado entrega", value: (r) => r.fc_encargado_entrega },
    { header: "Verificó", value: (r) => r.fc_verifico },
    { header: "Observaciones", value: (r) => r.fc_observaciones, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTablaRecepcion = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1320}
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
        Recepción de Insumos
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Proveedor"
                name="fc_proveedor"
                value={form.fc_proveedor}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_proveedor}
                helperText={errors.fc_proveedor}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Producto"
                name="fc_producto"
                value={form.fc_producto}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_producto}
                helperText={errors.fc_producto}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Lote"
                name="fc_lote"
                value={form.fc_lote}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_lote}
                helperText={errors.fc_lote}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoNumerico
                label="Cantidad"
                name="fc_cantidad"
                value={form.fc_cantidad}
                onChange={handleChange}
                fullWidth
                size="small"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!errors.fc_cantidad}
                helperText={errors.fc_cantidad}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Unidad de Medida"
                name="fc_unidad_medida"
                value={form.fc_unidad_medida}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_unidad_medida}
                helperText={errors.fc_unidad_medida}
              >
                {unidadesMedida.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Condiciones de entrega"
                name="fc_condiciones_entrega"
                value={form.fc_condiciones_entrega}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_condiciones_entrega}
                helperText={errors.fc_condiciones_entrega}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Encargado de Entrega"
                name="fc_encargado_entrega"
                value={form.fc_encargado_entrega}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_encargado_entrega}
                helperText={errors.fc_encargado_entrega}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_encargado_entrega && !empleados.some((e) => e.fc_nombre_completo === form.fc_encargado_entrega) && (
                  <MenuItem value={form.fc_encargado_entrega}>{form.fc_encargado_entrega}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Verificó"
                name="fc_verifico"
                value={form.fc_verifico}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_verifico}
                helperText={errors.fc_verifico}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_verifico && !empleados.some((e) => e.fc_nombre_completo === form.fc_verifico) && (
                  <MenuItem value={form.fc_verifico}>{form.fc_verifico}</MenuItem>
                )}
              </TextField>
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
                size="small"
                inputProps={{ maxLength: 500 }}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${form.fc_observaciones.length}/500`}
              />
            </Grid>
          </Grid>

          {/* Botones */}
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button variant="contained" size="small" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja
        grupos={gruposUbicacion}
        renderTabla={renderTablaRecepcion}
        buscar
        searchKeys={["fc_producto", "fc_lote", "fc_proveedor"]}
        placeholderBusqueda="Buscar producto, lote o proveedor"
        exportar={{
          columnas,
          titulo: "Bitácora de Recepción de Insumos",
          subtitulo: "Registro de insumos recibidos en la granja",
          nombreArchivo: "Recepcion_Insumos",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />
    </Box>
  );
}

export default function RecepcionInsumos() {
  return <RecepcionInsumosContent />;
}
