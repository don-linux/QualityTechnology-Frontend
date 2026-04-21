import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  listAlimentacion,
  getOrigenes,
  createAlimentacion,
  updateAlimentacion,
  removeAlimentacion,
  removeAllAlimentacion,
} from "../services/biometriasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const MAX_FC_OBSERVACIONES = 500;

export default function BioAlimentacion() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({
    ubicacion: "Medellin",
    fc_mes: "",
    fn_num_instalacion: "",
    fn_peso_promedio_entrada: "",
    fd_fecha_siembra: "",
    fc_origen_alevines: "",
    fd_fecha: "",
    fn_total_alimento_kg: "",
    fn_mortalidad: "",
    fc_recambio_agua: "",
    fn_temp_agua: "",
    fn_amonio: "",
    fn_ph: "",
    fc_observaciones: "",
    fi_usuario_id: usuarioId,
  });

  const [data, setData] = useState([]);
  const [origenes, setOrigenes] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "ubicacion",
    "fc_mes", "fn_num_instalacion", "fn_peso_promedio_entrada",
    "fd_fecha_siembra", "fc_origen_alevines", "fd_fecha",
    "fn_total_alimento_kg", "fn_mortalidad", "fc_recambio_agua",
    "fn_temp_agua", "fn_amonio", "fn_ph", "fc_observaciones",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listAlimentacion();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarOrigenes = async () => {
    if (!form.ubicacion) { setOrigenes([]); return; }
    try {
      const granja = form.ubicacion === "La Ceiba"
        ? "Granja Acuicola La Ceiba"
        : "Granja Acuicola Medellin";
      const res = await getOrigenes(granja);
      setOrigenes(res.data || []);
    } catch {
      showSnackbar("Error al cargar orígenes.", "error");
    }
  };

  const handleOrigenChange = (e) => {
    const origenSeleccionado = origenes.find(
      (origen) => String(origen.fi_instalacion_id) === String(e.target.value)
    );

    clearFieldError("fc_origen_alevines");
    clearFieldError("fn_num_instalacion");

    setForm({
      ...form,
      fn_num_instalacion: origenSeleccionado?.fi_instalacion_id || "",
      fc_origen_alevines: origenSeleccionado?.nombre_instalacion || "",
    });
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarOrigenes();
  }, [form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await updateAlimentacion(editId, form);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createAlimentacion(form);
        showSnackbar("Registro guardado", "success");
      }

      setForm({
        ubicacion: form.ubicacion,
        fc_mes: "",
        fn_num_instalacion: "",
        fn_peso_promedio_entrada: "",
        fd_fecha_siembra: "",
        fc_origen_alevines: "",
        fd_fecha: "",
        fn_total_alimento_kg: "",
        fn_mortalidad: "",
        fc_recambio_agua: "",
        fn_temp_agua: "",
        fn_amonio: "",
        fn_ph: "",
        fc_observaciones: "",
        fi_usuario_id: usuarioId,
      });

      setEditId(null);
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
      ubicacion: row.ubicacion || "",
      fc_mes: row.fc_mes,
      fn_num_instalacion: row.fn_num_instalacion,
      fn_peso_promedio_entrada: row.fn_peso_promedio_entrada,
      fd_fecha_siembra: row.fd_fecha_siembra?.split("T")[0],
      fc_origen_alevines: row.fc_origen_alevines,
      fd_fecha: row.fd_fecha?.split("T")[0],
      fn_total_alimento_kg: row.fn_total_alimento_kg,
      fn_mortalidad: row.fn_mortalidad,
      fc_recambio_agua: row.fc_recambio_agua,
      fn_temp_agua: row.fn_temp_agua,
      fn_amonio: row.fn_amonio,
      fn_ph: row.fn_ph,
      fc_observaciones: row.fc_observaciones,
      fi_usuario_id: row.fi_usuario_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeAlimentacion(id);
    cargarDatos();
  };

  //  Exportar a PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logoCeiba = `${""}/images/ceiba.png`;

    doc.addImage(logoCeiba, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Alimentación - Granja Acuícola La Ceiba", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de alimentación, parámetros y observaciones", 45, 26);

    const columnas = [
      "Mes",
      "Instalación",
      "Peso Entrada",
      "Siembra",
      "Origen",
      "Fecha",
      "Alimento (Kg)",
      "Mortalidad",
      "Recambio",
      "Temp",
      "Amonio",
      "pH",
      "Observaciones",
    ];

    const filas = data.map((r) => [
      r.fc_mes,
      r.fn_num_instalacion,
      r.fn_peso_promedio_entrada,
      r.fd_fecha_siembra?.split("T")[0],
      r.fc_origen_alevines,
      r.fd_fecha?.split("T")[0],
      r.fn_total_alimento_kg,
      r.fn_mortalidad,
      r.fc_recambio_agua,
      r.fn_temp_agua,
      r.fn_amonio,
      r.fn_ph,
      r.fc_observaciones,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7, cellWidth: "wrap" },
      headStyles: {
        fillColor: [56, 142, 60],
        textColor: 255,
        halign: "center",
      },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Alimentacion_Ceiba_${fecha}.pdf`);
  };

  //  Eliminar todos los registros
  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await removeAllAlimentacion();
    cargarDatos();
  };

  const datosMedellin = data.filter(r => r.ubicacion === "Medellin");
  const datosCeiba = data.filter(r => r.ubicacion === "La Ceiba");

  const tablaAlimentacion = (rows) => (
    <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
      <Table sx={{ minWidth: 1350 }}>
        <TableHead sx={{ background: "#E8F5E9" }}>
          <TableRow>
            <TableCell>Mes</TableCell>
            <TableCell>Instalación</TableCell>
            <TableCell>Peso Entrada</TableCell>
            <TableCell>Siembra</TableCell>
            <TableCell>Origen</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Alimento (Kg)</TableCell>
            <TableCell>Mortalidad</TableCell>
            <TableCell>Recambio</TableCell>
            <TableCell>Temp</TableCell>
            <TableCell>Amonio</TableCell>
            <TableCell>pH</TableCell>
            <TableCell>Observaciones</TableCell>
            <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.fi_id}>
              <TableCell>{row.fc_mes}</TableCell>
              <TableCell>{row.fn_num_instalacion}</TableCell>
              <TableCell>{row.fn_peso_promedio_entrada}</TableCell>
              <TableCell>{row.fd_fecha_siembra?.split("T")[0]}</TableCell>
              <TableCell>{row.fc_origen_alevines}</TableCell>
              <TableCell>{row.fd_fecha?.split("T")[0]}</TableCell>
              <TableCell>{row.fn_total_alimento_kg}</TableCell>
              <TableCell>{row.fn_mortalidad}</TableCell>
              <TableCell>{row.fc_recambio_agua}</TableCell>
              <TableCell>{row.fn_temp_agua}</TableCell>
              <TableCell>{row.fn_amonio}</TableCell>
              <TableCell>{row.fn_ph}</TableCell>
              <TableCell sx={{ maxWidth: 160 }}>
                <span title={row.fc_observaciones}>{truncar(row.fc_observaciones)}</span>
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
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Alimentación
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={(e) => {
                  handleChange(e);
                  setForm(prev => ({ ...prev, ubicacion: e.target.value, fn_num_instalacion: "", fc_origen_alevines: "" }));
                }}
                fullWidth
                error={!!errors.ubicacion}
                helperText={errors.ubicacion}
              >
                <MenuItem value="Medellin">Medellín</MenuItem>
                <MenuItem value="La Ceiba">La Ceiba</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Mes"
                name="fc_mes"
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_mes}
                helperText={errors.fc_mes}
              >
                <MenuItem value="">Selecciona un mes</MenuItem>
                <MenuItem value="Enero">Enero</MenuItem>
                <MenuItem value="Febrero">Febrero</MenuItem>
                <MenuItem value="Marzo">Marzo</MenuItem>
                <MenuItem value="Abril">Abril</MenuItem>
                <MenuItem value="Mayo">Mayo</MenuItem>
                <MenuItem value="Junio">Junio</MenuItem>
                <MenuItem value="Julio">Julio</MenuItem>
                <MenuItem value="Agosto">Agosto</MenuItem>
                <MenuItem value="Septiembre">Septiembre</MenuItem>
                <MenuItem value="Octubre">Octubre</MenuItem>
                <MenuItem value="Noviembre">Noviembre</MenuItem>
                <MenuItem value="Diciembre">Diciembre</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Instalación"
                name="fn_num_instalacion"
                value={form.fn_num_instalacion}
                fullWidth
                InputProps={{ readOnly: true }}
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Peso Promedio Entrada"
                name="fn_peso_promedio_entrada"
                type="number"
                value={form.fn_peso_promedio_entrada}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_peso_promedio_entrada}
                helperText={errors.fn_peso_promedio_entrada}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
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
                select
                label="Origen Alevines"
                name="fc_origen_alevines"
                value={form.fn_num_instalacion || ""}
                onChange={handleOrigenChange}
                fullWidth
                error={!!errors.fc_origen_alevines}
                helperText={errors.fc_origen_alevines}
              >
                <MenuItem value="">Selecciona un origen</MenuItem>
                {origenes.map((origen) => (
                  <MenuItem
                    key={`${origen.fi_instalacion_id}-${origen.fi_lote_id || "sin-lote"}`}
                    value={origen.fi_instalacion_id}
                  >
                    {`${origen.nombre_instalacion} (Inst. ${origen.fi_instalacion_id})`}
                  </MenuItem>
                ))}
                {form.fc_origen_alevines && !origenes.some((origen) => origen.nombre_instalacion === form.fc_origen_alevines) && (
                  <MenuItem value={form.fn_num_instalacion}>{form.fc_origen_alevines}</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Total Alimento (Kg)"
                type="number"
                name="fn_total_alimento_kg"
                value={form.fn_total_alimento_kg}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_total_alimento_kg}
                helperText={errors.fn_total_alimento_kg}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Mortalidad"
                name="fn_mortalidad"
                type="number"
                value={form.fn_mortalidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_mortalidad}
                helperText={errors.fn_mortalidad}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Recambio Agua"
                name="fc_recambio_agua"
                value={form.fc_recambio_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_recambio_agua}
                helperText={errors.fc_recambio_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Temp. Agua"
                type="number"
                name="fn_temp_agua"
                value={form.fn_temp_agua}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_temp_agua}
                helperText={errors.fn_temp_agua}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Amonio"
                type="number"
                name="fn_amonio"
                value={form.fn_amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_amonio}
                helperText={errors.fn_amonio}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="pH"
                type="number"
                name="fn_ph"
                value={form.fn_ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_ph}
                helperText={errors.fn_ph}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                fullWidth
                value={form.fc_observaciones}
                onChange={handleChange}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones || `${form.fc_observaciones.length}/${MAX_FC_OBSERVACIONES}`}
                inputProps={{ maxLength: MAX_FC_OBSERVACIONES }}
              />
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

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="span" fontWeight="bold">Medellín</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {tablaAlimentacion(datosMedellin)}
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography component="span" fontWeight="bold">La Ceiba</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {tablaAlimentacion(datosCeiba)}
        </AccordionDetails>
      </Accordion>

      {ConfirmModal}
    </Box>
  );
}

