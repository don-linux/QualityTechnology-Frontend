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
    fecha: "",
    proveedor_nombre: "",
    producto: "",
    numero_lote: "",
    cantidad: "",
    unidad_medida: "",
    condiciones_entrega: "",
    encargado_entrega: "",
    verificador: "",
    observaciones: "",
    usuario_id: usuarioId,
    ubicacion: "",
  });

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fecha", "proveedor_nombre", "producto", "numero_lote",
    "cantidad", "unidad_medida", "condiciones_entrega",
    "encargado_entrega", "verificador", "observaciones",
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
        fecha: "",
        proveedor_nombre: "",
        producto: "",
        numero_lote: "",
        cantidad: "",
        unidad_medida: "",
        condiciones_entrega: "",
        encargado_entrega: "",
        verificador: "",
        observaciones: "",
        usuario_id: usuarioId,
        ubicacion: form.ubicacion,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({ ...r, fecha: r.fecha?.split("T")[0] });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const columnas = [
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Proveedor", value: (r) => r.proveedor_nombre },
    { header: "Producto", value: (r) => r.producto, truncate: true, maxWidth: 160 },
    { header: "Lote", value: (r) => r.numero_lote },
    { header: "Cantidad", value: (r) => r.cantidad },
    { header: "Unidad", value: (r) => r.unidad_medida },
    { header: "Condiciones de entrega", value: (r) => r.condiciones_entrega, truncate: true, maxWidth: 160 },
    { header: "Encargado entrega", value: (r) => r.encargado_entrega },
    { header: "Verificó", value: (r) => r.verificador },
    { header: "Observaciones", value: (r) => r.observaciones, truncate: true, maxWidth: 160 },
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
                name="fecha"
                value={form.fecha}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Proveedor"
                name="proveedor_nombre"
                value={form.proveedor_nombre}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.proveedor_nombre}
                helperText={errors.proveedor_nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Producto"
                name="producto"
                value={form.producto}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.producto}
                helperText={errors.producto}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Lote"
                name="numero_lote"
                value={form.numero_lote}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.numero_lote}
                helperText={errors.numero_lote}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoNumerico
                label="Cantidad"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                fullWidth
                size="small"
                inputProps={{ step: "0.01", min: "0" }}
                error={!!errors.cantidad}
                helperText={errors.cantidad}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Unidad de Medida"
                name="unidad_medida"
                value={form.unidad_medida}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.unidad_medida}
                helperText={errors.unidad_medida}
              >
                {unidadesMedida.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Condiciones de entrega"
                name="condiciones_entrega"
                value={form.condiciones_entrega}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.condiciones_entrega}
                helperText={errors.condiciones_entrega}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Encargado de Entrega"
                name="encargado_entrega"
                value={form.encargado_entrega}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.encargado_entrega}
                helperText={errors.encargado_entrega}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
                    {empleado.nombre_completo}
                  </MenuItem>
                ))}
                {form.encargado_entrega && !empleados.some((e) => e.nombre_completo === form.encargado_entrega) && (
                  <MenuItem value={form.encargado_entrega}>{form.encargado_entrega}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Verificó"
                name="verificador"
                value={form.verificador}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.verificador}
                helperText={errors.verificador}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.empleado_id} value={empleado.nombre_completo}>
                    {empleado.nombre_completo}
                  </MenuItem>
                ))}
                {form.verificador && !empleados.some((e) => e.nombre_completo === form.verificador) && (
                  <MenuItem value={form.verificador}>{form.verificador}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                size="small"
                inputProps={{ maxLength: 500 }}
                error={!!errors.observaciones}
                helperText={errors.observaciones || `${form.observaciones.length}/500`}
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
        searchKeys={["producto", "numero_lote", "proveedor_nombre"]}
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
