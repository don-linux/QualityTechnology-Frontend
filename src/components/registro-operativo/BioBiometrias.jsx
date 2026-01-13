import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BioBiometriasContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fn_peso_total_gramos: "",
    fn_organismos_muestreados: "",
    fn_peso_promedio: "",
    fc_observaciones: "",
    fc_encargado: "",
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const cargarDatos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/ceiba/biometrias");
      setData(res.data);
    } catch (error) {
      alert("Error al cargar biometrias.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/ceiba/biometrias/${editId}`,
          form
        );
        alert("Registro actualizado");
      } else {
        await axios.post("http://localhost:5000/ceiba/biometrias", form);
        alert("Registro guardado");
      }

      setForm({
        fd_fecha: "",
        fn_peso_total_gramos: "",
        fn_organismos_muestreados: "",
        fn_peso_promedio: "",
        fc_observaciones: "",
        fc_encargado: "",
        fi_usuario_id: 1,
      });

      setEditId(null);
      cargarDatos();
    } catch (err) {
      alert("Error al guardar registro.");
    }
  };

  const editar = (row) => {
    setEditId(row.fi_id);
    setForm({
      fd_fecha: row.fd_fecha?.split("T")[0],
      fn_peso_total_gramos: row.fn_peso_total_gramos,
      fn_organismos_muestreados: row.fn_organismos_muestreados,
      fn_peso_promedio: row.fn_peso_promedio,
      fc_observaciones: row.fc_observaciones,
      fc_encargado: row.fc_encargado,
      fi_usuario_id: row.fi_usuario_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    try {
      await axios.delete(`http://localhost:5000/ceiba/biometrias/${id}`);
      cargarDatos();
    } catch {
      alert("Error eliminando registro.");
    }
  };

  // 🧾 Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const logoCeiba = `${process.env.PUBLIC_URL}/images/ceiba.png`;

    doc.addImage(logoCeiba, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Biometrías - Granja Acuícola La Ceiba", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de peso, muestreos y observaciones", 45, 26);

    const columnas = [
      "Fecha",
      "Peso Total (g)",
      "Organismos Muestreados",
      "Peso Promedio (g)",
      "Encargado",
      "Observaciones",
    ];

    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
      r.fn_peso_total_gramos,
      r.fn_organismos_muestreados,
      r.fn_peso_promedio,
      r.fc_encargado,
      r.fc_observaciones,
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

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Biometrias_Ceiba_${fecha}.pdf`);
  };

  // 🗑️ Eliminar todos los registros
  const eliminarTodos = async () => {
    if (
      window.confirm(
        "⚠️ ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer."
      )
    ) {
      await axios.delete("http://localhost:5000/ceiba/biometrias");
      cargarDatos();
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🟩 La Ceiba — Biometrías
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="Fecha"
                name="fd_fecha"
                value={form.fd_fecha}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Peso Total (g)"
                name="fn_peso_total_gramos"
                type="number"
                value={form.fn_peso_total_gramos}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Organismos Muestreados"
                name="fn_organismos_muestreados"
                type="number"
                value={form.fn_organismos_muestreados}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Peso Promedio (g)"
                name="fn_peso_promedio"
                type="number"
                value={form.fn_peso_promedio}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                label="Encargado"
                name="fc_encargado"
                value={form.fc_encargado}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
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
              📄 Exportar PDF
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ ml: 2 }}
              onClick={eliminarTodos}
            >
              🗑️ Eliminar Todos
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Paper>
        <Table>
          <TableHead sx={{ background: "#E8F5E9" }}>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Peso Total</TableCell>
              <TableCell>Organismos</TableCell>
              <TableCell>Peso Promedio</TableCell>
              <TableCell>Encargado</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.fi_id}>
                <TableCell>{row.fd_fecha?.split("T")[0]}</TableCell>
                <TableCell>{row.fn_peso_total_gramos}</TableCell>
                <TableCell>{row.fn_organismos_muestreados}</TableCell>
                <TableCell>{row.fn_peso_promedio}</TableCell>
                <TableCell>{row.fc_encargado}</TableCell>
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
    </Box>
  );
}

export default function BioBiometrias() {
  return <BioBiometriasContent />;
}
