import React, { useEffect, useState } from "react";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  listInsumos,
  listEmpleadosInsumos,
  createInsumo,
  updateInsumo,
  removeInsumo,
  removeAllInsumos,
} from "../services/insumosService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import { listPiletas } from "@features/inventarios/services/piletasService";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const MAX_FC_DESCRIPCION = 300;
const MAX_FC_OBSERVACIONES = 500;

const TIPOS_MOVIMIENTO = [
  { value: "ingreso", label: "Ingreso" },
  { value: "egreso", label: "Egreso" },
];

const labelTipoMovimiento = (tipo) =>
  TIPOS_MOVIMIENTO.find((t) => t.value === tipo)?.label ?? tipo ?? "—";

export default function BioInsumos() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    fc_tipo_movimiento: "ingreso",
    fd_fecha: "",
    fc_cantidad_udm: "",
    fc_num_lote: "",
    fc_descripcion: "",
    fc_observaciones: "",
    fc_encargado_entrega: "",
    fc_encargado_recepcion: "",
    fi_usuario_id: usuarioId,
    pileta_id: "",
  });

  const [data, setData] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fc_tipo_movimiento",
    "fd_fecha", "fc_cantidad_udm", "fc_num_lote", "fc_descripcion",
    "fc_observaciones", "fc_encargado_entrega", "fc_encargado_recepcion",
  ];

  const esEgreso = form.fc_tipo_movimiento === "egreso";

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);
    if (name === "fc_tipo_movimiento" && value !== "egreso") {
      setForm({ ...form, [name]: value, pileta_id: "" });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listInsumos();
      setData(res.data);
    } catch {
      showSnackbar("Error cargando registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosInsumos();
      setEmpleados(res.data);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  const cargarPiletas = async (ubicacion) => {
    try {
      const res = await listPiletas(ubicacion || form.ubicacion);
      setPiletas(res.data ?? []);
    } catch {
      setPiletas([]);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (form.ubicacion) cargarPiletas(form.ubicacion);
  }, [form.ubicacion]);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await updateInsumo(editId, form);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createInsumo(form);
        showSnackbar("Registro guardado", "success");
      }
      setForm({
        ubicacion: form.ubicacion,
        fc_tipo_movimiento: form.fc_tipo_movimiento,
        fd_fecha: "",
        fc_cantidad_udm: "",
        fc_num_lote: "",
        fc_descripcion: "",
        fc_observaciones: "",
        fc_encargado_entrega: "",
        fc_encargado_recepcion: "",
        fi_usuario_id: usuarioId,
        pileta_id: form.pileta_id,
      });
      setEditId(null);
      cerrarFormulario();
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error guardando registro.";
      showSnackbar(msg, "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
      ubicacion: row.ubicacion || "",
      fc_tipo_movimiento: row.fc_tipo_movimiento || row.tipo_movimiento || "ingreso",
      fd_fecha: row.fd_fecha?.split("T")[0],
      fc_cantidad_udm: row.fc_cantidad_udm,
      fc_num_lote: row.fc_num_lote,
      fc_descripcion: row.fc_descripcion,
      fc_observaciones: row.fc_observaciones,
      fc_encargado_entrega: row.fc_encargado_entrega,
      fc_encargado_recepcion: row.fc_encargado_recepcion,
      fi_usuario_id: row.fi_usuario_id,
      pileta_id: row.pileta_id != null ? String(row.pileta_id) : "",
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeInsumo(id);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await removeAllInsumos();
    cargarDatos();
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = getLogo(form.ubicacion);

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {
      // Logo is optional for exported PDFs.
    }
    doc.setFontSize(14);
    doc.text(`Recepción de Insumos - ${getLabel(form.ubicacion)}`, 45, 20);
    doc.setFontSize(10);
    doc.text("Control de recepción, entrega y observaciones", 45, 26);

    const columnas = [
      "Tipo",
      "Fecha",
      "Cantidad UdM",
      "Lote",
      "Descripción",
      "Observaciones",
      "Entrega",
      "Recepción",
    ];

    const filas = data.map((r) => [
      labelTipoMovimiento(r.fc_tipo_movimiento || r.tipo_movimiento),
      formatFecha(r.fd_fecha),
      r.fc_cantidad_udm,
      r.fc_num_lote,
      r.fc_descripcion,
      r.fc_observaciones,
      r.fc_encargado_entrega,
      r.fc_encargado_recepcion,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: {
        fillColor: [56, 142, 60],
        textColor: 255,
        halign: "center",
      },
    });

    const fecha = formatFecha(new Date());
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Recepcion_Insumos_${getLabel(form.ubicacion)}_${fecha}.pdf`);
  };

  const gruposUbicacion = getGroups(data);

  const renderTablaInsumos = (rows) => {
    const filas = ordenarYNumerar(rows, ["fi_id"]);
    return (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth: 1040 }}>
        <TableHead sx={{ background: "#E8F5E9" }}>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Cantidad UdM</TableCell>
            <TableCell>Lote</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Observaciones</TableCell>
            <TableCell>Entrega</TableCell>
            <TableCell>Recepción</TableCell>
            <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filas.map((row) => (
            <TableRow key={row.fi_id}>
              <TableCell>{row._num}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={labelTipoMovimiento(row.fc_tipo_movimiento || row.tipo_movimiento)}
                  color={(row.fc_tipo_movimiento || row.tipo_movimiento) === "egreso" ? "warning" : "success"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{formatFecha(row.fd_fecha)}</TableCell>
              <TableCell>{row.fc_cantidad_udm}</TableCell>
              <TableCell>{row.fc_num_lote}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={row.fc_descripcion}>{truncar(row.fc_descripcion)}</span>
              </TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={row.fc_observaciones}>{truncar(row.fc_observaciones)}</span>
              </TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={row.fc_encargado_entrega}>{truncar(row.fc_encargado_entrega)}</span>
              </TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={row.fc_encargado_recepcion}>{truncar(row.fc_encargado_recepcion)}</span>
              </TableCell>
              <TableCell
                align="center"
                sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => editar(row)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => eliminar(row.fi_id)}
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
        Ingresos / Egresos de Insumos
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoTexto
                select
                label="Tipo de movimiento"
                name="fc_tipo_movimiento"
                value={form.fc_tipo_movimiento}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_tipo_movimiento}
                helperText={
                  errors.fc_tipo_movimiento
                    || (esEgreso
                      ? "Salida de insumo (ej. alimento entregado a pileta)"
                      : "Entrada de insumo al inventario")
                }
              >
                {TIPOS_MOVIMIENTO.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </CampoTexto>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoTexto
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
              </CampoTexto>
            </Grid>

            {esEgreso ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <CampoTexto
                  select
                  label="Pileta (egreso)"
                  name="pileta_id"
                  value={form.pileta_id}
                  onChange={handleChange}
                  fullWidth
                  helperText="Opcional: vincula el egreso para alimentacion interna"
                >
                  <MenuItem value="">Sin pileta</MenuItem>
                  {piletas.map((pl) => (
                    <MenuItem key={pl.fi_pileta_id} value={String(pl.fi_pileta_id)}>
                      {pl.nombre} ({pl.tipo})
                    </MenuItem>
                  ))}
                </CampoTexto>
              </Grid>
            ) : null}

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoTexto
                type="date"
                label="Fecha"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoTexto
                label="Cantidad UdM"
                name="fc_cantidad_udm"
                value={form.fc_cantidad_udm}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_cantidad_udm}
                helperText={errors.fc_cantidad_udm}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <CampoTexto
                label="No. Lote"
                name="fc_num_lote"
                value={form.fc_num_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_num_lote}
                helperText={errors.fc_num_lote}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={12}>
              <CampoTexto
                label="Descripción"
                name="fc_descripcion"
                value={form.fc_descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_descripcion}
                helperText={errors.fc_descripcion || `${form.fc_descripcion.length}/${MAX_FC_DESCRIPCION}`}
                inputProps={{ maxLength: MAX_FC_DESCRIPCION }}
              />
            </Grid>

            <Grid size={12}>
              <CampoTexto
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${form.fc_observaciones.length}/${MAX_FC_OBSERVACIONES}`}
                inputProps={{ maxLength: MAX_FC_OBSERVACIONES }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CampoTexto
                label="Encargado de Entrega"
                name="fc_encargado_entrega"
                value={form.fc_encargado_entrega}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado_entrega}
                helperText={errors.fc_encargado_entrega}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CampoTexto
                select
                label="Encargado de Recepción"
                name="fc_encargado_recepcion"
                value={form.fc_encargado_recepcion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado_recepcion}
                helperText={errors.fc_encargado_recepcion}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_encargado_recepcion && !empleados.some((e) => e.fc_nombre_completo === form.fc_encargado_recepcion) && (
                  <MenuItem value={form.fc_encargado_recepcion}>{form.fc_encargado_recepcion}</MenuItem>
                )}
              </CampoTexto>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
            <Button
              variant="outlined"
              color="success"
              sx={{ ml: 2 }}
              onClick={exportarPDF}
            >
               Exportar PDF
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ ml: 2 }}
              onClick={eliminarTodos}
            >
               Eliminar Todos
            </Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      {gruposUbicacion.map(({ value, label, rows }) => (
        <Accordion key={value} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{label}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            {renderTablaInsumos(rows)}
          </AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}

