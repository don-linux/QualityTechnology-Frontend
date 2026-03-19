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
import axios from "../../utils/axiosInstance.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BitacoraBanosContent() {
  const [form, setForm] = useState({
    fc_mes: "",
    fc_dia: "",
    fc_banio_hombres: "",
    fc_banio_mujeres: "",
    fc_regadera: "",
    fc_realizo: "",
    fc_firma: "",
    fc_observaciones: "",
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  //  Cargar datos
  const cargarDatos = async () => {
    try {
      const res = await axios.get("/medellin/banos");
      setData(res.data);
    } catch {
      alert("Error al cargar registros.");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  //  Guardar / Actualizar
  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(`/medellin/banos/${editId}`, form);
        alert("Registro actualizado");
      } else {
        await axios.post("/medellin/banos", form);
        alert("Registro guardado");
      }

      setForm({
        fc_mes: "",
        fc_dia: "",
        fc_banio_hombres: "",
        fc_banio_mujeres: "",
        fc_regadera: "",
        fc_realizo: "",
        fc_firma: "",
        fc_observaciones: "",
        fi_usuario_id: 1,
      });
      setEditId(null);
      cargarDatos();
    } catch {
      alert("Error al guardar registro.");
    }
  };

  //  Editar
  const editar = (row) => {
    setEditId(row.fi_id);
    setForm({
      fc_mes: row.fc_mes,
      fc_dia: row.fc_dia,
      fc_banio_hombres: row.fc_banio_hombres,
      fc_banio_mujeres: row.fc_banio_mujeres,
      fc_regadera: row.fc_regadera,
      fc_realizo: row.fc_realizo,
      fc_firma: row.fc_firma,
      fc_observaciones: row.fc_observaciones,
      fi_usuario_id: row.fi_usuario_id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //  Eliminar uno
  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/medellin/banos/${id}`);
    cargarDatos();
  };

  //  Eliminar todos
  const eliminarTodos = async () => {
    if (
      !window.confirm(
        " ¿Deseas eliminar TODOS los registros? Esta acción no se puede deshacer."
      )
    )
      return;
    await axios.delete(`${API_URL}/medellin/banos`);
    cargarDatos();
  };

  //  Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const logoMedellin = `${""}/images/medellin.png`;

    // Encabezado
    doc.addImage(logoMedellin, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Baños - Granja Acuícola Medellín", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de limpieza y mantenimiento de baños y regaderas", 45, 26);

    const columnas = [
      "Mes",
      "Día",
      "Baño Hombres",
      "Baño Mujeres",
      "Regadera",
      "Realizó",
      "Firma",
      "Observaciones",
    ];

    const filas = data.map((r) => [
      r.fc_mes,
      r.fc_dia,
      r.fc_banio_hombres,
      r.fc_banio_mujeres,
      r.fc_regadera,
      r.fc_realizo,
      r.fc_firma,
      r.fc_observaciones,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: {
        fillColor: [33, 150, 243], // Azul Medellín
        textColor: 255,
        halign: "center",
      },
      bodyStyles: { valign: "middle" },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Banos_Medellin_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Medellín — Baños
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Mes" name="fc_mes" value={form.fc_mes} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Día" name="fc_dia" value={form.fc_dia} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Baño Hombres" name="fc_banio_hombres" value={form.fc_banio_hombres} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Baño Mujeres" name="fc_banio_mujeres" value={form.fc_banio_mujeres} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Regadera" name="fc_regadera" value={form.fc_regadera} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Realizó" name="fc_realizo" value={form.fc_realizo} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Firma" name="fc_firma" value={form.fc_firma} onChange={handleChange} fullWidth />
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
          <TableHead sx={{ background: "#E3F2FD" }}>
            <TableRow>
              <TableCell>Mes</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Baño Hombres</TableCell>
              <TableCell>Baño Mujeres</TableCell>
              <TableCell>Regadera</TableCell>
              <TableCell>Realizó</TableCell>
              <TableCell>Firma</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fc_mes}</TableCell>
                <TableCell>{r.fc_dia}</TableCell>
                <TableCell>{r.fc_banio_hombres}</TableCell>
                <TableCell>{r.fc_banio_mujeres}</TableCell>
                <TableCell>{r.fc_regadera}</TableCell>
                <TableCell>{r.fc_realizo}</TableCell>
                <TableCell>{r.fc_firma}</TableCell>
                <TableCell>{r.fc_observaciones}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    onClick={() => editar(r)}
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default function BitacoraBanos() {
  return <BitacoraBanosContent />;
}
