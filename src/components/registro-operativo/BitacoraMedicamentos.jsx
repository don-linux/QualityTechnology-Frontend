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

function BitacoraMedicamentosContent() {
  const [form, setForm] = useState({
    fd_fecha_hora: "",
    fn_num_estanque: "",
    fc_diagnosis: "",
    fc_tratamiento: "",
    fc_dosis: "",
    fc_forma_aplicacion: "",
    fd_fecha_ultima_dosis: "",
    fc_responsable: "",
    fi_usuario_id: 1,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_URL}/medellin/medicamentos`);
      setData(res.data);
    } catch {
      alert("Error al cargar registros.");
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  //  Guardar / Actualizar
  const guardar = async () => {
    try {
      if (editId)
        await axios.put(`${API_URL}/medellin/medicamentos/${editId}`, form);
      else await axios.post(`${API_URL}/medellin/medicamentos`, form);

      setEditId(null);
      setForm({
        fd_fecha_hora: "",
        fn_num_estanque: "",
        fc_diagnosis: "",
        fc_tratamiento: "",
        fc_dosis: "",
        fc_forma_aplicacion: "",
        fd_fecha_ultima_dosis: "",
        fc_responsable: "",
        fi_usuario_id: 1,
      });
      cargarDatos();
    } catch {
      alert("Error al guardar registro.");
    }
  };

  //  Editar
  const editar = (r) => {
    setEditId(r.fi_id);
    setForm({
      ...r,
      fd_fecha_hora: r.fd_fecha_hora?.split("T")[0],
      fd_fecha_ultima_dosis: r.fd_fecha_ultima_dosis?.split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //  Eliminar uno
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/medellin/medicamentos/${id}`);
    cargarDatos();
  };

  //  Eliminar todos
  const eliminarTodos = async () => {
    if (!window.confirm(" ¿Eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await axios.delete(`${API_URL}/medellin/medicamentos`);
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
    doc.text("Bitácora de Medicamentos - Granja Acuícola Medellín", 45, 20);
    doc.setFontSize(10);
    doc.text("Registro de tratamientos, dosis y responsables", 45, 26);

    const columnas = [
      "Fecha",
      "Estanque",
      "Diagnóstico",
      "Tratamiento",
      "Dosis",
      "Forma Aplicación",
      "Última Dosis",
      "Responsable",
    ];

    const filas = data.map((r) => [
      r.fd_fecha_hora?.split("T")[0],
      r.fn_num_estanque,
      r.fc_diagnosis,
      r.fc_tratamiento,
      r.fc_dosis,
      r.fc_forma_aplicacion,
      r.fd_fecha_ultima_dosis?.split("T")[0],
      r.fc_responsable,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7, cellWidth: "wrap" },
      headStyles: {
        fillColor: [255, 167, 38], // naranja Medellín
        textColor: 255,
        halign: "center",
      },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Medicamentos_Medellin_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>​ Medellín — Medicamentos</Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Fecha" type="date" name="fd_fecha_hora" InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_hora} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Estanque" name="fn_num_estanque"
                value={form.fn_num_estanque} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField label="Diagnóstico" name="fc_diagnosis"
                value={form.fc_diagnosis} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={12}>
              <TextField label="Tratamiento" name="fc_tratamiento"
                value={form.fc_tratamiento} onChange={handleChange}
                multiline rows={2} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Dosis" name="fc_dosis"
                value={form.fc_dosis} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Forma Aplicación" name="fc_forma_aplicacion"
                value={form.fc_forma_aplicacion} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Última Dosis" type="date" name="fd_fecha_ultima_dosis"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_ultima_dosis} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Responsable" name="fc_responsable"
                value={form.fc_responsable} onChange={handleChange} fullWidth />
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
          <TableHead sx={{ background: "#FFF3E0" }}>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Estanque</TableCell>
              <TableCell>Diagnóstico</TableCell>
              <TableCell>Tratamiento</TableCell>
              <TableCell>Dosis</TableCell>
              <TableCell>Forma Aplicación</TableCell>
              <TableCell>Última Dosis</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fd_fecha_hora?.split("T")[0]}</TableCell>
                <TableCell>{r.fn_num_estanque}</TableCell>
                <TableCell>{r.fc_diagnosis}</TableCell>
                <TableCell>{r.fc_tratamiento}</TableCell>
                <TableCell>{r.fc_dosis}</TableCell>
                <TableCell>{r.fc_forma_aplicacion}</TableCell>
                <TableCell>{r.fd_fecha_ultima_dosis?.split("T")[0]}</TableCell>
                <TableCell>{r.fc_responsable}</TableCell>
                <TableCell>
                  <Button size="small" color="warning" variant="contained"
                    sx={{ mr: 1 }} onClick={() => editar(r)}>
                    Editar
                  </Button>
                  <Button size="small" color="error" variant="contained"
                    onClick={() => eliminar(r.fi_id)}>
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

export default function BitacoraMedicamentos() {
  return <BitacoraMedicamentosContent />;
}
