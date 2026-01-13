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

function BitacoraRecambiosContent() {
  const [form, setForm] = useState({
    fc_mes: "",
    fn_num_instalacion: "",
    fd_fecha1: "",
    fc_tipo1: "",
    fd_fecha2: "",
    fc_tipo2: "",
    fd_fecha3: "",
    fc_tipo3: "",
    fd_fecha4: "",
    fc_tipo4: "",
    fd_fecha5: "",
    fc_tipo5: "",
    fd_fecha6: "",
    fc_tipo6: "",
    fc_responsable: "",
    fi_usuario_id: 1,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const cargarDatos = async () => {
    try {
      const res = await axios.get("http://localhost:5000/medellin/recambios");
      setData(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    try {
      if (editId)
        await axios.put(
          `http://localhost:5000/medellin/recambios/${editId}`,
          form
        );
      else await axios.post("http://localhost:5000/medellin/recambios", form);

      setEditId(null);
      setForm({
        fc_mes: "",
        fn_num_instalacion: "",
        fd_fecha1: "",
        fc_tipo1: "",
        fd_fecha2: "",
        fc_tipo2: "",
        fd_fecha3: "",
        fc_tipo3: "",
        fd_fecha4: "",
        fc_tipo4: "",
        fd_fecha5: "",
        fc_tipo5: "",
        fd_fecha6: "",
        fc_tipo6: "",
        fc_responsable: "",
        fi_usuario_id: 1,
      });
      cargarDatos();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const editar = (r) => {
    setEditId(r.fi_id);
    setForm({
      ...r,
      fd_fecha1: r.fd_fecha1?.split("T")[0],
      fd_fecha2: r.fd_fecha2?.split("T")[0],
      fd_fecha3: r.fd_fecha3?.split("T")[0],
      fd_fecha4: r.fd_fecha4?.split("T")[0],
      fd_fecha5: r.fd_fecha5?.split("T")[0],
      fd_fecha6: r.fd_fecha6?.split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`http://localhost:5000/medellin/recambios/${id}`);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!window.confirm("⚠️ ¿Deseas eliminar todos los registros?")) return;
    try {
      await axios.delete("http://localhost:5000/medellin/recambios");
      cargarDatos();
      alert("Todos los registros fueron eliminados correctamente.");
    } catch (err) {
      alert("Error eliminando registros: " + err.message);
    }
  };

// 📄 Exportar PDF (formato institucional limpio)
const exportarPDF = () => {
  const doc = new jsPDF("l", "mm", "a4");
  const logo = `${process.env.PUBLIC_URL}/images/medellin.png`;

  // Logo superior
  doc.addImage(logo, "PNG", 10, 8, 25, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Registro de Recambios", 140, 20, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Granja Acuícola Medellín", 140, 27, { align: "center" });

  // Línea para mes
  doc.setFontSize(10);
  doc.text("Mes:", 250, 35);
  doc.line(260, 35, 285, 35);

  // 🟡 Mostrar el mes actual sobre la línea
  if (form.fc_mes) {
    doc.text(form.fc_mes, 262, 35);
  }

  // Encabezados
  const columnas = [
    "No. Instalación",
    "Fecha 1",
    "Tipo 1",
    "Fecha 2",
    "Tipo 2",
    "Fecha 3",
    "Tipo 3",
    "Fecha 4",
    "Tipo 4",
    "Fecha 5",
    "Tipo 5",
    "Fecha 6",
    "Tipo 6",
    "Responsable",
  ];

  const filas = data.map((r) => [
    r.fn_num_instalacion || "",
    r.fd_fecha1?.split("T")[0] || "",
    r.fc_tipo1 || "",
    r.fd_fecha2?.split("T")[0] || "",
    r.fc_tipo2 || "",
    r.fd_fecha3?.split("T")[0] || "",
    r.fc_tipo3 || "",
    r.fd_fecha4?.split("T")[0] || "",
    r.fc_tipo4 || "",
    r.fd_fecha5?.split("T")[0] || "",
    r.fc_tipo5 || "",
    r.fd_fecha6?.split("T")[0] || "",
    r.fc_tipo6 || "",
    r.fc_responsable || "",
  ]);

  autoTable(doc, {
    startY: 40,
    head: [columnas],
    body: filas,
    styles: {
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [0, 82, 155],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  let y = doc.lastAutoTable.finalY + 8;

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(255, 0, 0);
  doc.text(
    "IMPORTANTE: No. Instalación (Estanque, Pila, Liner y su número), Fecha (DD/MM/AAAA), Tipo: (Total, Parcial o Recirculación)",
    10,
    y
  );

  doc.setTextColor(0);
  y += 10;
  doc.text("Departamento: Operaciones", 10, y);
  doc.text("Aprobó: Juan Carlos Jiménez Ara", 70, y);
  y += 8;
  doc.text("Rev. 07/08/2024", 10, y);
  doc.text("Page 1 of 1", 270, y, { align: "right" });

  // Guardar
  const fecha = new Date().toLocaleDateString("es-MX");
  doc.save(`Registro_Recambios_Medellin_${fecha}.pdf`);
};

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        🔄 Medellín — Recambios de Trampas
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label="Mes"
                name="fc_mes"
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="No. Instalación"
                name="fn_num_instalacion"
                type="number"
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {[1, 2, 3, 4, 5, 6].map((n) => (
              <React.Fragment key={n}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label={`Fecha ${n}`}
                    type="date"
                    name={`fd_fecha${n}`}
                    InputLabelProps={{ shrink: true }}
                    value={form[`fd_fecha${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label={`Tipo ${n}`}
                    name={`fc_tipo${n}`}
                    value={form[`fc_tipo${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </React.Fragment>
            ))}

            <Grid item xs={12} md={4}>
              <TextField
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
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
              color="primary"
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

      {/* TABLA */}
      <Paper>
        <Table>
          <TableHead sx={{ background: "#E3F2FD" }}>
            <TableRow>
              <TableCell>Mes</TableCell>
              <TableCell>Instalación</TableCell>
              <TableCell>Fechas y Tipos</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fc_mes}</TableCell>
                <TableCell>{r.fn_num_instalacion}</TableCell>
                <TableCell>
                  {[1, 2, 3, 4, 5, 6]
                    .map((n) =>
                      r[`fd_fecha${n}`]
                        ? `${r[`fd_fecha${n}`]?.split("T")[0]} (${r[`fc_tipo${n}`]})`
                        : null
                    )
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>
                <TableCell>{r.fc_responsable}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default function BitacoraRecambios() {
  return <BitacoraRecambiosContent />;
}
