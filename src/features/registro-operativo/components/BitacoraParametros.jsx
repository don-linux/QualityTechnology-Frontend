import React, { useEffect, useState } from "react";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import {
  listParametros,
  listEmpleadosParametros,
  createParametro,
  updateParametro,
  removeParametro,
  removeAllParametros,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

function BitacoraParametrosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({
    ubicacion: "Medellin",
    fd_fecha: "",
    fn_num_estanque: "",
    fn_oxigeno: "",
    fn_temperatura: "",
    fn_ph: "",
    fn_amonio: "",
    fn_nitritos: "",
    fn_nitratos: "",
    fc_responsable: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "ubicacion", "fd_fecha", "fn_num_estanque", "fn_oxigeno", "fn_temperatura",
    "fn_ph", "fn_amonio", "fn_nitritos", "fn_nitratos", "fc_responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listParametros();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosParametros();
      setEmpleados(res.data);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEmpleados();
  }, []);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateParametro(editId, form);
      else await createParametro(form);

      setEditId(null);
      setForm({
        ubicacion: form.ubicacion,
        fd_fecha: "",
        fn_num_estanque: "",
        fn_oxigeno: "",
        fn_temperatura: "",
        fn_ph: "",
        fn_amonio: "",
        fn_nitritos: "",
        fn_nitratos: "",
        fc_responsable: "",
        fi_usuario_id: usuarioId,
      });
      cargarDatos();
    } catch {
      showSnackbar("Error al guardar registro.", "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      ubicacion: r.ubicacion || "",
      fd_fecha: r.fd_fecha?.split("T")[0] || "",
      fn_num_estanque: r.fn_num_estanque ?? "",
      fn_oxigeno: r.fn_oxigeno ?? "",
      fn_temperatura: r.fn_temperatura ?? "",
      fn_ph: r.fn_ph ?? "",
      fn_amonio: r.fn_amonio ?? "",
      fn_nitritos: r.fn_nitritos ?? "",
      fn_nitratos: r.fn_nitratos ?? "",
      fc_responsable: r.fc_responsable || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeParametro(id);
    cargarDatos();
  };

  //  Eliminar todos los registros
  const eliminarTodos = async () => {
    if (!await confirm(" ¿Eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await removeAllParametros();
    cargarDatos();
  };

  //  Exportar PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logoMedellin = `${""}/images/medellin.png`;

    doc.addImage(logoMedellin, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Parámetros - Granja Acuícola Medellín", 45, 20);
    doc.setFontSize(10);
    doc.text("Registro de oxígeno, pH, temperatura y otros indicadores", 45, 26);

    const columnas = [
      "Fecha",
      "Estanque",
      "Oxígeno",
      "Temp (°C)",
      "pH",
      "Amonio",
      "Nitritos",
      "Nitratos",
      "Responsable",
    ];

    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
      r.fn_num_estanque,
      r.fn_oxigeno,
      r.fn_temperatura,
      r.fn_ph,
      r.fn_amonio,
      r.fn_nitritos,
      r.fn_nitratos,
      r.fc_responsable,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: {
        fillColor: [255, 235, 59], // Amarillo claro Medellín
        textColor: 0,
        halign: "center",
      },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Parametros_Medellin_${fecha}.pdf`);
  };

  const datosMedellin = data.filter((r) => r.ubicacion === "Medellin");
  const datosCeiba = data.filter((r) => r.ubicacion === "La Ceiba");

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Parámetros Fisico-Quimicos
      </Typography>

      {/* FORMULARIO */}
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
                <MenuItem value="Medellin">Medellín</MenuItem>
                <MenuItem value="La Ceiba">La Ceiba</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Estanque"
                name="fn_num_estanque"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={form.fn_num_estanque}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_estanque}
                helperText={errors.fn_num_estanque}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Oxígeno"
                name="fn_oxigeno"
                type="number"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_oxigeno}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_oxigeno}
                helperText={errors.fn_oxigeno}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Temperatura"
                name="fn_temperatura"
                type="number"
                inputProps={{ step: "any" }}
                value={form.fn_temperatura}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_temperatura}
                helperText={errors.fn_temperatura}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="pH"
                name="fn_ph"
                type="number"
                inputProps={{ min: 0, max: 14, step: "any" }}
                value={form.fn_ph}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_ph}
                helperText={errors.fn_ph}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Amonio"
                name="fn_amonio"
                type="number"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_amonio}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_amonio}
                helperText={errors.fn_amonio}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Nitritos"
                name="fn_nitritos"
                type="number"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_nitritos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_nitritos}
                helperText={errors.fn_nitritos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Nitratos"
                name="fn_nitratos"
                type="number"
                inputProps={{ min: 0, step: "any" }}
                value={form.fn_nitratos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_nitratos}
                helperText={errors.fn_nitratos}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_responsable}
                helperText={errors.fc_responsable}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_responsable && !empleados.some((e) => e.fc_nombre_completo === form.fc_responsable) && (
                  <MenuItem value={form.fc_responsable}>{form.fc_responsable}</MenuItem>
                )}
              </TextField>
            </Grid>
          </Grid>

          {/* BOTONES */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
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

      {/* TABLAS POR UBICACIÓN */}
      {[
        { label: "Medellín", rows: datosMedellin },
        { label: "La Ceiba", rows: datosCeiba },
      ].map(({ label, rows }) => (
        <Accordion key={label} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{label} ({rows.length})</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper sx={{ width: "100%" }}>
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1100 }}>
                <TableHead sx={{ background: "#FFFDE7" }}>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estanque</TableCell>
                    <TableCell>Oxígeno</TableCell>
                    <TableCell>Temperatura</TableCell>
                    <TableCell>pH</TableCell>
                    <TableCell>Amonio</TableCell>
                    <TableCell>Nitritos</TableCell>
                    <TableCell>Nitratos</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.fi_id}>
                      <TableCell>{r.fd_fecha?.split("T")[0]}</TableCell>
                      <TableCell>{r.fn_num_estanque}</TableCell>
                      <TableCell>{r.fn_oxigeno}</TableCell>
                      <TableCell>{r.fn_temperatura}</TableCell>
                      <TableCell>{r.fn_ph}</TableCell>
                      <TableCell>{r.fn_amonio}</TableCell>
                      <TableCell>{r.fn_nitritos}</TableCell>
                      <TableCell>{r.fn_nitratos}</TableCell>
                      <TableCell>{r.fc_responsable}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                      >
                        <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                          <Button
                            size="small"
                            color="warning"
                            variant="contained"
                            onClick={() => editar(r)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="contained"
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
          </AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}

export default function BitacoraParametros() {
  return <BitacoraParametrosContent />;
}
