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

function BitacoraParametrosContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fn_num_estanque: "",
    fn_oxigeno: "",
    fn_temperatura: "",
    fn_ph: "",
    fn_amonio: "",
    fn_nitritos: "",
    fn_nitratos: "",
    fc_responsable: "",
    fi_usuario_id: 1,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_URL}/medellin/parametros`);
      setData(res.data);
    } catch {
      alert("Error al cargar registros.");
    }
  };
  useEffect(() => { cargarDatos(); }, []);

  const guardar = async () => {
    try {
      if (editId)
        await axios.put(`${API_URL}/medellin/parametros/${editId}`, form);
      else await axios.post(`${API_URL}/medellin/parametros`, form);

      setEditId(null);
      setForm({
        fd_fecha: "",
        fn_num_estanque: "",
        fn_oxigeno: "",
        fn_temperatura: "",
        fn_ph: "",
        fn_amonio: "",
        fn_nitritos: "",
        fn_nitratos: "",
        fc_responsable: "",
        fi_usuario_id: 1,
      });
      cargarDatos();
    } catch {
      alert("Error al guardar registro.");
    }
  };

  const editar = (r) => {
    setEditId(r.fi_id);
    setForm({ ...r, fd_fecha: r.fd_fecha?.split("T")[0] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/medellin/parametros/${id}`);
    cargarDatos();
  };

  //  Eliminar todos los registros
  const eliminarTodos = async () => {
    if (!window.confirm(" ¿Eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await axios.delete(`${API_URL}/medellin/parametros`);
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

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Medellín — Parámetros
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Estanque"
                name="fn_num_estanque"
                value={form.fn_num_estanque}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Oxígeno"
                name="fn_oxigeno"
                value={form.fn_oxigeno}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Temperatura"
                name="fn_temperatura"
                value={form.fn_temperatura}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="pH"
                name="fn_ph"
                value={form.fn_ph}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Amonio"
                name="fn_amonio"
                value={form.fn_amonio}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Nitritos"
                name="fn_nitritos"
                value={form.fn_nitritos}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Nitratos"
                name="fn_nitratos"
                value={form.fn_nitratos}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
                onChange={handleChange}
                fullWidth
              />
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

      {/* TABLA */}
      <Paper>
        <Table>
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
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
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
                <TableCell>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default function BitacoraParametros() {
  return <BitacoraParametrosContent />;
}
