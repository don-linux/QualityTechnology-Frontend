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

function BioInsumosContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_cantidad_udm: "",
    fc_num_lote: "",
    fc_descripcion: "",
    fc_observaciones: "",
    fc_encargado_entrega: "",
    fc_encargado_recepcion: "",
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const cargarDatos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/ceiba/insumos");
      setData(res.data);
    } catch {
      alert("Error cargando registros.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/ceiba/insumos/${editId}`, form);
        alert("Registro actualizado");
      } else {
        await axios.post("http://localhost:5000/ceiba/insumos", form);
        alert("Registro guardado");
      }
      setForm({
        fd_fecha: "",
        fc_cantidad_udm: "",
        fc_num_lote: "",
        fc_descripcion: "",
        fc_observaciones: "",
        fc_encargado_entrega: "",
        fc_encargado_recepcion: "",
        fi_usuario_id: 1,
      });
      setEditId(null);
      cargarDatos();
    } catch {
      alert("Error guardando registro.");
    }
  };

  const editar = (row) => {
    setEditId(row.fi_id);
    setForm({
      fd_fecha: row.fd_fecha?.split("T")[0],
      fc_cantidad_udm: row.fc_cantidad_udm,
      fc_num_lote: row.fc_num_lote,
      fc_descripcion: row.fc_descripcion,
      fc_observaciones: row.fc_observaciones,
      fc_encargado_entrega: row.fc_encargado_entrega,
      fc_encargado_recepcion: row.fc_encargado_recepcion,
      fi_usuario_id: row.fi_usuario_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`http://localhost:5000/ceiba/insumos/${id}`);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (
      window.confirm(
        "⚠️ ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer."
      )
    ) {
      await axios.delete("http://localhost:5000/ceiba/insumos");
      cargarDatos();
    }
  };

  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const logoCeiba = `${process.env.PUBLIC_URL}/images/ceiba.png`;

    doc.addImage(logoCeiba, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Recepción de Insumos - Granja Acuícola La Ceiba", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de recepción, entrega y observaciones", 45, 26);

    const columnas = [
      "Fecha",
      "Cantidad UdM",
      "Lote",
      "Descripción",
      "Observaciones",
      "Entrega",
      "Recepción",
    ];

    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
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

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Recepcion_Insumos_Ceiba_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        📥​ La Ceiba — Ingresos / Egresos de Insumos
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                label="Fecha"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="Cantidad UdM"
                name="fc_cantidad_udm"
                value={form.fc_cantidad_udm}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="No. Lote"
                name="fc_num_lote"
                value={form.fc_num_lote}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="fc_descripcion"
                value={form.fc_descripcion}
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

            <Grid item xs={12} md={6}>
              <TextField
                label="Encargado de Entrega"
                name="fc_encargado_entrega"
                value={form.fc_encargado_entrega}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Encargado de Recepción"
                name="fc_encargado_recepcion"
                value={form.fc_encargado_recepcion}
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
              <TableCell>Cantidad UdM</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Entrega</TableCell>
              <TableCell>Recepción</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.fi_id}>
                <TableCell>{row.fd_fecha?.split("T")[0]}</TableCell>
                <TableCell>{row.fc_cantidad_udm}</TableCell>
                <TableCell>{row.fc_num_lote}</TableCell>
                <TableCell>{row.fc_descripcion}</TableCell>
                <TableCell>{row.fc_observaciones}</TableCell>
                <TableCell>{row.fc_encargado_entrega}</TableCell>
                <TableCell>{row.fc_encargado_recepcion}</TableCell>
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

export default function BioInsumos() {
  return <BioInsumosContent />;
}
