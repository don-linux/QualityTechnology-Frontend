import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import SearchIcon from "@mui/icons-material/Search";
import {
  listRecepcionInsumos,
  listEmpleadosRecepcionInsumos,
  createRecepcionInsumo,
  updateRecepcionInsumo,
  removeRecepcionInsumo,
  removeAllRecepcionInsumos,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

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
  const [busqueda, setBusqueda] = useState("");
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
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
      const filtrados = rows.filter((r) => {
        if (!busqueda) return true;
        return (
          r.fc_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.fc_lote?.toString().includes(busqueda)
        );
      });
      setData(filtrados);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [ubicacionesGranja, busqueda]);

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

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeRecepcionInsumo(id);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm("¿Eliminar todos los registros de todas las ubicaciones?")) return;
    await Promise.all(
      ubicacionesGranja.map((op) => removeAllRecepcionInsumos(op.value)),
    );
    cargarDatos();
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = getLogo(defaultUbicacion);
    const color = getColor(defaultUbicacion);

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {
      // El PDF debe generarse aunque el logo de la ubicación no esté disponible.
    }

    doc.setFontSize(14);
    doc.text(
      "Bitácora de Recepción de Insumos — Todas las ubicaciones",
      45,
      20
    );
    doc.setFontSize(10);
    doc.text("Registro de insumos recibidos en la granja", 45, 26);

    const columnas = [
      "Fecha",
      "Proveedor",
      "Producto",
      "Lote",
      "Cantidad",
      "Unidad",
      "Condiciones de entrega",
      "Encargado entrega",
      "Verificó",
      "Observaciones",
    ];
    const filas = data.map((r) => [
      formatFecha(r.fd_fecha),
      r.fc_proveedor,
      r.fc_producto,
      r.fc_lote,
      r.fc_cantidad,
      r.fc_unidad_medida,
      r.fc_condiciones_entrega,
      r.fc_encargado_entrega,
      r.fc_verifico,
      r.fc_observaciones,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7 },
      headStyles: { fillColor: color, textColor: 255, halign: "center" },
    });

    const fecha = formatFecha(new Date());
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Recepcion_Insumos_${fecha}.pdf`);
  };

  const gruposUbicacion = getGroups(data);

  const renderTablaRecepcion = (rows) => (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth: 1320 }}>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Proveedor</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell>Lote</TableCell>
            <TableCell>Cantidad</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell>Condiciones de entrega</TableCell>
            <TableCell>Encargado entrega</TableCell>
            <TableCell>Verificó</TableCell>
            <TableCell>Observaciones</TableCell>
            <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.fi_id}>
              <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
              <TableCell>{r.fc_proveedor}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={r.fc_producto}>{truncar(r.fc_producto)}</span>
              </TableCell>
              <TableCell>{r.fc_lote}</TableCell>
              <TableCell>{r.fc_cantidad}</TableCell>
              <TableCell>{r.fc_unidad_medida}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={r.fc_condiciones_entrega}>{truncar(r.fc_condiciones_entrega)}</span>
              </TableCell>
              <TableCell>{r.fc_encargado_entrega}</TableCell>
              <TableCell>{r.fc_verifico}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={r.fc_observaciones}>{truncar(r.fc_observaciones)}</span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                  <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
                    Editar
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => eliminar(r.fi_id)}>
                    Eliminar
                  </Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Recepción de Insumos
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TextField
          label="Buscar Producto / Lote"
          variant="outlined"
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

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
            <Button variant="outlined" size="small" onClick={exportarPDF}>
               Exportar PDF
            </Button>
            <Button variant="contained" size="small" color="error" onClick={eliminarTodos}>
               Eliminar Todos
            </Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      <TablasPorUbicacionGranja grupos={gruposUbicacion} renderTabla={renderTablaRecepcion} />
      {ConfirmModal}
    </Box>
  );
}

export default function RecepcionInsumos() {
  return <RecepcionInsumosContent />;
}
