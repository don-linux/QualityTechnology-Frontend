import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import {
  listInventarioInsumos,
  listEmpleadosInventarioInsumos,
  createInventarioInsumo,
  updateInventarioInsumo,
} from "../services/inventarioInsumosService";
import { listCatalogoInsumosActivos } from "@features/catalogos/services/catalogoInsumosService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useEmpleadosActivos from "@shared/hooks/useEmpleadosActivos";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoResponsableEmpleado from "@shared/components/CampoResponsableEmpleado";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import ListadoTabla from "@shared/components/ListadoTabla";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";

const TIPOS_MOVIMIENTO = [
  { value: "ingreso", label: "Ingreso" },
  { value: "egreso", label: "Egreso" },
  { value: "traspaso", label: "Traspaso" },
];
const DESTINOS_INGRESO = ["Almacén de Alimento", "Auto"];
const DESTINOS_EGRESO = ["Alevinaje", "Engorda", "Reproductores", "Venta", "Otros"];
const TIPO_LABEL = { ingreso: "Ingreso", egreso: "Egreso", traspaso: "Traspaso" };
const SENTIDO_LABEL = { salida: "Salida", entrada: "Entrada" };

const emptyForm = (usuarioId, ubicacion = "") => ({
  tipo_movimiento: "ingreso",
  ubicacion,
  fecha: "",
  insumo_id: "",
  insumo_nombre: "",
  destino: "",
  responsable: "",
  observaciones: "",
  ubicacion_salida: "",
  ubicacion_entrada: "",
  usuario_id: usuarioId,
});

// Select de unidad de negocio (granja) con opción de respaldo para valores que
// no coinciden exactamente con el catálogo (p. ej. al editar un registro).
function UdnSelect({ label, name, value, onChange, options, error, helperText, disabled }) {
  const matched = options.some((op) => op.value === value);
  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      size="small"
      disabled={disabled}
      error={!!error}
      helperText={helperText}
    >
      {options.map((op) => (
        <MenuItem key={op.value} value={op.value}>
          {op.label}
        </MenuItem>
      ))}
      {value && !matched && <MenuItem value={value}>{value}</MenuItem>}
    </TextField>
  );
}

function InsumosContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getColor, getGroups } =
    useUbicacionesGranja();

  const [form, setForm] = useState(emptyForm(usuarioId));
  const [data, setData] = useState([]);
  const { empleados } = useEmpleadosActivos(listEmpleadosInventarioInsumos, {
    errorMessage: "Error al cargar empleados o insumos.",
  });
  const [insumos, setInsumos] = useState([]);
  const [editId, setEditId] = useState(null);
  const [registroDetalle, setRegistroDetalle] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  const esTraspaso = form.tipo_movimiento === "traspaso";
  const destinosDisponibles = form.tipo_movimiento === "egreso" ? DESTINOS_EGRESO : DESTINOS_INGRESO;

  const camposRequeridos = (tipo) =>
    tipo === "traspaso"
      ? ["fecha", "ubicacion_salida", "ubicacion_entrada", "insumo_id", "responsable"]
      : ["ubicacion", "fecha", "insumo_id", "destino", "responsable"];

  // Con solo dos granjas, seleccionar una asigna la contraria automáticamente.
  const otraGranja = (value) => {
    const otras = ubicacionesGranja.filter((op) => op.value !== value);
    return otras.length === 1 ? otras[0].value : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "tipo_movimiento") {
        next.destino = "";
        if (value === "traspaso") {
          const salida = prev.ubicacion || defaultUbicacion || "";
          const entrada = otraGranja(salida);
          next.ubicacion_salida = salida;
          next.ubicacion_entrada = entrada;
          next.destino = entrada || "";
        } else {
          next.ubicacion_salida = "";
          next.ubicacion_entrada = "";
        }
      }
      if (name === "ubicacion_salida") {
        const entrada = otraGranja(value);
        next.ubicacion_entrada = entrada;
        next.destino = entrada || "";
      }
      if (name === "ubicacion_entrada") {
        next.ubicacion_salida = otraGranja(value);
        next.destino = value || "";
      }
      return next;
    });
  };

  const cargarCatalogos = async () => {
    try {
      const insumosRes = await listCatalogoInsumosActivos();
      setInsumos(insumosRes.data ?? []);
    } catch {
      showSnackbar("Error al cargar insumos.", "error");
    }
  };

  const cargarDatos = useCallback(async () => {
    if (!ubicacionesGranja.length) {
      setData([]);
      return;
    }
    try {
      const granjas = ubicacionesGranja.map((op) => op.value);
      const rows = await fetchMergedPorUbicaciones(granjas, listInventarioInsumos);
      setData(rows);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja]);

  useEffect(() => {
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardar = async () => {
    if (!validate(form, camposRequeridos(form.tipo_movimiento))) return;
    try {
      const payload = {
        tipo_movimiento: form.tipo_movimiento,
        fecha: form.fecha,
        insumo_id: form.insumo_id || null,
        responsable: form.responsable || null,
        observaciones: form.observaciones || null,
      };
      if (esTraspaso) {
        payload.ubicacion_salida = form.ubicacion_salida;
        payload.ubicacion_entrada = form.ubicacion_entrada;
      } else {
        payload.ubicacion = form.ubicacion;
        payload.destino = form.destino || null;
      }

      if (editId) await updateInventarioInsumo(editId, payload);
      else await createInventarioInsumo(payload);

      const wasEdit = Boolean(editId);
      setEditId(null);
      cerrarFormulario();
      setForm(emptyForm(usuarioId, form.ubicacion));
      cargarDatos();
      showSnackbar(wasEdit ? "Registro actualizado" : "Registro guardado", "success");
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.id);
    setForm({
      tipo_movimiento: r.tipo_movimiento || "ingreso",
      ubicacion: r.ubicacion || defaultUbicacion,
      fecha: r.fecha?.split("T")[0] || "",
      insumo_id: r.insumo_id != null ? String(r.insumo_id) : "",
      insumo_nombre: r.producto || r.insumo_nombre || "",
      destino: r.destino || "",
      responsable: r.responsable || "",
      observaciones: r.observaciones || "",
      ubicacion_salida: r.unidad_negocio_salida || "",
      ubicacion_entrada: r.unidad_negocio_entrada || "",
      usuario_id: r.usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const tipoLabel = (r) => {
    const base = TIPO_LABEL[r.tipo_movimiento] || r.tipo_movimiento || "";
    if (r.tipo_movimiento === "traspaso" && r.traspaso_sentido) {
      return `${base} (${SENTIDO_LABEL[r.traspaso_sentido] || r.traspaso_sentido})`;
    }
    return base;
  };

  const insumoMatched = insumos.some((i) => String(i.insumo_id) === String(form.insumo_id));

  const columnas = [
    { header: "Folio", value: (r) => r.codigo || "", render: (r) => r.codigo || r._num },
    { header: "Fecha", value: (r) => formatFecha(r.fecha) },
    { header: "Tipo", value: (r) => tipoLabel(r) },
    { header: "Producto", value: (r) => r.producto || r.insumo_nombre, truncate: true, maxWidth: 180 },
    { header: "Destino", value: (r) => r.destino, truncate: true, maxWidth: 160 },
    { header: "Responsable", value: (r) => r.responsable },
    { header: "Observaciones", value: (r) => r.observaciones, truncate: true, maxWidth: 160 },
  ];

  const gruposUbicacion = getGroups(data);

  const renderTabla = (rows) => (
    <ListadoTabla
      columnas={columnas}
      filas={rows}
      minWidth={1150}
      numerar={false}
      accionesMinWidth={200}
      acciones={(r) => (
        <>
          <Button size="small" variant="outlined" color="info" onClick={() => setRegistroDetalle(r)}>
            Ver
          </Button>
          <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
            Editar
          </Button>
        </>
      )}
    />
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Insumos
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  select
                  label="Tipo de movimiento"
                  name="tipo_movimiento"
                  value={form.tipo_movimiento}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  disabled={!!editId}
                  error={!!errors.tipo_movimiento}
                  helperText={errors.tipo_movimiento}
                >
                  {TIPOS_MOVIMIENTO.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {!esTraspaso && (
                <Grid size={{ xs: 12, sm: 3 }}>
                  <UdnSelect
                    label="Unidad de negocio"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    options={ubicacionesGranja}
                    error={errors.ubicacion}
                    helperText={errors.ubicacion}
                  />
                </Grid>
              )}

              {esTraspaso && (
                <>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <UdnSelect
                      label="UdN de salida"
                      name="ubicacion_salida"
                      value={form.ubicacion_salida}
                      onChange={handleChange}
                      options={ubicacionesGranja}
                      disabled={!!editId}
                      error={errors.ubicacion_salida}
                      helperText={errors.ubicacion_salida}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <UdnSelect
                      label="UdN de entrada"
                      name="ubicacion_entrada"
                      value={form.ubicacion_entrada}
                      onChange={handleChange}
                      options={ubicacionesGranja}
                      disabled={!!editId}
                      error={errors.ubicacion_entrada}
                      helperText={errors.ubicacion_entrada}
                    />
                  </Grid>
                </>
              )}

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
                  select
                  label="Producto"
                  name="insumo_id"
                  value={form.insumo_id}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  error={!!errors.insumo_id}
                  helperText={errors.insumo_id}
                >
                  <MenuItem value="">Selecciona un insumo</MenuItem>
                  {insumos.map((i) => (
                    <MenuItem key={i.insumo_id} value={String(i.insumo_id)}>
                      {i.codigo ? `${i.codigo} - ${i.nombre}` : i.nombre}
                    </MenuItem>
                  ))}
                  {form.insumo_id && !insumoMatched && (
                    <MenuItem value={form.insumo_id}>
                      {form.insumo_nombre || `Insumo #${form.insumo_id}`}
                    </MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                {esTraspaso ? (
                  <TextField
                    label="Destino"
                    name="destino"
                    value={form.destino ? getLabel(form.destino) || form.destino : ""}
                    fullWidth
                    size="small"
                    InputProps={{ readOnly: true }}
                    helperText="Se autocompleta con la granja de entrada"
                  />
                ) : (
                  <TextField
                    select
                    label="Destino"
                    name="destino"
                    value={form.destino}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    error={!!errors.destino}
                    helperText={errors.destino}
                  >
                    <MenuItem value="">Selecciona un destino</MenuItem>
                    {destinosDisponibles.map((op) => (
                      <MenuItem key={op} value={op}>
                        {op}
                      </MenuItem>
                    ))}
                    {form.destino && !destinosDisponibles.includes(form.destino) && (
                      <MenuItem value={form.destino}>{form.destino}</MenuItem>
                    )}
                  </TextField>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <CampoResponsableEmpleado
                  value={form.responsable}
                  onChange={handleChange}
                  empleados={empleados}
                  error={!!errors.responsable}
                  helperText={errors.responsable}
                />
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
        renderTabla={renderTabla}
        exportar={{
          columnas,
          titulo: "Insumos",
          subtitulo: "Movimientos de insumos por unidad de negocio",
          nombreArchivo: "Insumos",
        }}
        getLogo={getLogo}
        getColor={getColor}
      />

      <Dialog
        open={!!registroDetalle}
        onClose={() => setRegistroDetalle(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalle del movimiento</DialogTitle>
        <DialogContent dividers>
          {registroDetalle && (
            <Grid container spacing={1.5}>
              {[
                { label: "Folio / ID", value: registroDetalle.codigo },
                { label: "Fecha", value: formatFecha(registroDetalle.fecha) },
                { label: "Tipo de movimiento", value: tipoLabel(registroDetalle) },
                { label: "Unidad de negocio", value: registroDetalle.ubicacion },
                { label: "Producto", value: registroDetalle.producto || registroDetalle.insumo_nombre },
                { label: "Destino", value: registroDetalle.destino },
                { label: "Responsable", value: registroDetalle.responsable },
                ...(registroDetalle.tipo_movimiento === "traspaso"
                  ? [
                      { label: "UdN de salida", value: registroDetalle.unidad_negocio_salida },
                      { label: "UdN de entrada", value: registroDetalle.unidad_negocio_entrada },
                    ]
                  : []),
              ].map(({ label, value }) => (
                <Grid size={{ xs: 12, sm: 6 }} key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography variant="body2">{value || "—"}</Typography>
                </Grid>
              ))}
              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Observaciones
                </Typography>
                <Typography variant="body2">{registroDetalle.observaciones || "—"}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistroDetalle(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function Insumos() {
  return <InsumosContent />;
}
