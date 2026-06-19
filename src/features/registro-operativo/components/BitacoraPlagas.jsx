import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CampoTexto from "@shared/components/CampoTexto";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import {
  listPlagas,
  listEmpleadosPlagas,
  createPlaga,
  updatePlaga,
  removePlaga,
  removeAllPlagas,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import TablasPorUbicacionGranja from "@shared/components/TablasPorUbicacionGranja";
import { fetchMergedPorUbicaciones } from "@shared/utils/fetchMergedPorUbicaciones";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar, SIGLAS_MODULO } from "@shared/utils/ordenarFilas";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

function BitacoraPlagasContent() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getColor, getGroups } =
    useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_num_trampa: "",
    tipo_trampa: "",
    fc_hallazgo: "",
    fc_malla: "",
    fc_veneno: "",
    fc_observaciones: "",
    fc_verifico: "",
    unidad_produccion: "",
    fi_usuario_id: usuarioId,
    ubicacion: "",
  });

  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [registroDetalle, setRegistroDetalle] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fd_fecha", "fc_num_trampa", "tipo_trampa", "fc_hallazgo",
    "fc_malla", "fc_veneno", "fc_observaciones", "fc_verifico",
    "unidad_produccion",
  ];

  //  Opciones para selects: tipos base + tipos registrados previamente
  const tiposTrampaBase = ["Adhesiva", "Cebadera", "Mecánica", "Luz UV", "Otro"];
  const tiposTrampa = [...new Set([...tiposTrampaBase, ...data.map((r) => r.tipo_trampa).filter(Boolean)])];
  const tiposMalla = ["Buena", "Dañada", "Sin Malla"];
  const tiposVeneno = ["Rodenticida", "Gel", "Granulado", "Líquido", "Ninguno"];
  const unidadesProduccion = ["Engorda", "Alevinaje", "Reproductores"];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosPlagas();
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
      const rows = await fetchMergedPorUbicaciones(granjas, listPlagas);
      const filtrados = rows.filter((r) => {
        if (!busqueda) return true;
        return (
          r.tipo_trampa?.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.fc_num_trampa?.toString().includes(busqueda)
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
        await updatePlaga(editId, form);
      else await createPlaga(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        fd_fecha: "",
        fc_num_trampa: "",
        tipo_trampa: "",
        fc_hallazgo: "",
        fc_malla: "",
        fc_veneno: "",
        fc_observaciones: "",
        fc_verifico: "",
        unidad_produccion: "",
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
      fc_num_trampa: r.fc_num_trampa || "",
      tipo_trampa: r.tipo_trampa || "",
      fc_hallazgo: r.fc_hallazgo || "",
      fc_malla: r.fc_malla || "",
      fc_veneno: r.fc_veneno || "",
      fc_observaciones: r.fc_observaciones || "",
      fc_verifico: r.fc_verifico || "",
      unidad_produccion: r.unidad_produccion || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
      ubicacion: r.ubicacion || defaultUbicacion,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removePlaga(id);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm("¿Eliminar todos los registros de todas las ubicaciones?")) return;
    await Promise.all(ubicacionesGranja.map((op) => removeAllPlagas(op.value)));
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
      // Logo is optional for exported PDFs.
    }

    doc.setFontSize(14);
    doc.text(
      "Bitácora de Control de Plagas — Todas las ubicaciones",
      45,
      20
    );
    doc.setFontSize(10);
    doc.text("Registro de trampas por unidad de producción", 45, 26);

    const columnas = [
      "Fecha",
      "Trampa",
      "Tipo",
      "Unidad",
      "Hallazgo",
      "Malla",
      "Veneno",
      "Verificó",
      "Observaciones",
    ];
    const filas = data.map((r) => [
      formatFecha(r.fd_fecha),
      r.fc_num_trampa,
      r.tipo_trampa,
      r.unidad_produccion,
      r.fc_hallazgo,
      r.fc_malla,
      r.fc_veneno,
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
    doc.save(`Bitacora_Plagas_${fecha}.pdf`);
  };

  const gruposUbicacion = getGroups(data);

  const renderTablaPlagas = (rows, { siglaGranja } = {}) => {
    const filas = ordenarYNumerar(rows, ["fi_id"], {
      siglaGranja,
      siglaModulo: SIGLAS_MODULO.plagas,
    });
    return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth: 1200 }}>
        <TableHead sx={{ background: "#E3F2FD" }}>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Trampa</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Unidad</TableCell>
            <TableCell>Hallazgo</TableCell>
            <TableCell>Malla</TableCell>
            <TableCell>Veneno</TableCell>
            <TableCell>Verificó</TableCell>
            <TableCell>Observaciones</TableCell>
            <TableCell align="center" sx={{ minWidth: 260, whiteSpace: "nowrap" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.map((r) => (
            <TableRow key={r.fi_id}>
              <TableCell>{r._num}</TableCell>
              <TableCell>{formatFecha(r.fd_fecha)}</TableCell>
              <TableCell>{r.fc_num_trampa}</TableCell>
              <TableCell>{r.tipo_trampa}</TableCell>
              <TableCell>{r.unidad_produccion}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={r.fc_hallazgo}>{truncar(r.fc_hallazgo)}</span>
              </TableCell>
              <TableCell>{r.fc_malla}</TableCell>
              <TableCell>{r.fc_veneno}</TableCell>
              <TableCell>{r.fc_verifico}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={r.fc_observaciones}>{truncar(r.fc_observaciones)}</span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ minWidth: 260, verticalAlign: "middle", whiteSpace: "nowrap" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="info"
                    onClick={() => setRegistroDetalle(r)}
                  >
                    Ver
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => editar(r)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => eliminar(r.fi_id)}
                  >
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
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Control de Plagas
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <CampoTexto
          label="Buscar Trampa / Tipo"
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
          sx={{ width: 250 }}
        />
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoTexto
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
              </CampoTexto>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoTexto
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
              <CampoTexto
                label="No. Trampa"
                name="fc_num_trampa"
                value={form.fc_num_trampa}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_num_trampa}
                helperText={errors.fc_num_trampa}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoTexto
                select
                label="Tipo de Trampa"
                name="tipo_trampa"
                value={form.tipo_trampa}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.tipo_trampa}
                helperText={errors.tipo_trampa}
              >
                {tiposTrampa.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </CampoTexto>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <CampoTexto
                select
                label="Unidad de Producción"
                name="unidad_produccion"
                value={form.unidad_produccion}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.unidad_produccion}
                helperText={errors.unidad_produccion}
              >
                {unidadesProduccion.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </CampoTexto>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CampoTexto
                select
                label="Malla"
                name="fc_malla"
                value={form.fc_malla}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_malla}
                helperText={errors.fc_malla}
              >
                {tiposMalla.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </CampoTexto>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CampoTexto
                select
                label="Veneno"
                name="fc_veneno"
                value={form.fc_veneno}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_veneno}
                helperText={errors.fc_veneno}
              >
                {tiposVeneno.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </CampoTexto>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <CampoTexto
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
              </CampoTexto>
            </Grid>

            <Grid size={12}>
              <CampoTexto
                label="Hallazgo"
                name="fc_hallazgo"
                value={form.fc_hallazgo}
                onChange={handleChange}
                fullWidth
                size="small"
                inputProps={{ maxLength: 500 }}
                error={!!errors.fc_hallazgo}
                helperText={errors.fc_hallazgo || `${form.fc_hallazgo.length}/500`}
              />
            </Grid>

            <Grid size={12}>
              <CampoTexto
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

      <TablasPorUbicacionGranja grupos={gruposUbicacion} renderTabla={renderTablaPlagas} />
      {ConfirmModal}

      <Dialog
        open={!!registroDetalle}
        onClose={() => setRegistroDetalle(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalle del Registro</DialogTitle>
        <DialogContent dividers>
          {registroDetalle && (
            <Grid container spacing={1.5}>
              {[
                { label: "Fecha", value: formatFecha(registroDetalle.fd_fecha) },
                { label: "No. Trampa", value: registroDetalle.fc_num_trampa },
                { label: "Tipo de Trampa", value: registroDetalle.tipo_trampa },
                { label: "Unidad de Producción", value: registroDetalle.unidad_produccion },
                { label: "Malla", value: registroDetalle.fc_malla },
                { label: "Veneno", value: registroDetalle.fc_veneno },
                { label: "Verificó", value: registroDetalle.fc_verifico },
              ].map(({ label, value }) => (
                <Grid size={{ xs: 12, sm: 6 }} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2">{value || "—"}</Typography>
                </Grid>
              ))}

              <Grid size={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">Hallazgo</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {registroDetalle.fc_hallazgo || "—"}
                </Typography>
              </Grid>

              <Grid size={12}>
                <Typography variant="caption" color="text.secondary">Observaciones</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {registroDetalle.fc_observaciones || "—"}
                </Typography>
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

export default function BitacoraPlagas() {
  return <BitacoraPlagasContent />;
}
