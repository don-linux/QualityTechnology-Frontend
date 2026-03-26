import React, { useEffect, useState } from "react";
import { API_URL } from "../../utils/api.js";
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
import Paper from "@mui/material/Paper";
import axios from "../../utils/axiosInstance.js";
import useFormValidation from "../../hooks/useFormValidation";
import useConfirm from "../../hooks/useConfirm";

function BioAlimentacionContent() {
  const [form, setForm] = useState({
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
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
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
      const res = await axios.get(`${API_URL}/ceiba/alimentacion`);
      setData(res.data);
    } catch {
      alert("Error al cargar registros.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await axios.put(
          `${API_URL}/ceiba/alimentacion/${editId}`,
          form
        );
        alert("Registro actualizado");
      } else {
        await axios.post(`${API_URL}/ceiba/alimentacion`, form);
        alert("Registro guardado");
      }

      setForm({
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
        fi_usuario_id: 1,
      });

      setEditId(null);
      cargarDatos();
    } catch {
      alert("Error al guardar registro.");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
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
    await axios.delete(`${API_URL}/ceiba/alimentacion/${id}`);
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
    await axios.delete(`${API_URL}/ceiba/alimentacion`);
    cargarDatos();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         La Ceiba — Alimentación
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Mes"
                name="fc_mes"
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_mes}
                helperText={errors.fc_mes}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Instalación"
                name="fn_num_instalacion"
                type="number"
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
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
                label="Origen Alevines"
                name="fc_origen_alevines"
                value={form.fc_origen_alevines}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_origen_alevines}
                helperText={errors.fc_origen_alevines}
              />
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
                helperText={errors.fc_observaciones}
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

      <Paper>
        <Table>
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
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
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
                <TableCell>{row.fc_observaciones}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {ConfirmModal}
    </Box>
  );
}

export default function BioAlimentacion() {
  return <BioAlimentacionContent />;
}
