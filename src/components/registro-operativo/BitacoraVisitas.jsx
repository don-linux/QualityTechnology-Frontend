import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../../utils/api.js";
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Paper,
  InputAdornment, MenuItem, FormControl, InputLabel, Select
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../utils/axiosInstance.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BitacoraVisitasContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_nombre_completo: "",
    fc_origen: "",
    fc_motivo: "",
    fc_observaciones: "",
    fc_foto_identificacion: "",
    fd_entrada: "",
    fd_salida: "",
    fi_usuario_id: 1,
    ubicacion: "medellin",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const ubicaciones = ["medellin", "ceiba", "quality"];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.files[0],
    });
  };

  const cargarDatos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/visitas?ubicacion=${form.ubicacion}&filtro=${busqueda}`);
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [form.ubicacion, busqueda]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardar = async () => {
    try {
      const formData = new FormData();
      formData.append("fd_fecha", form.fd_fecha);
      formData.append("fc_nombre_completo", form.fc_nombre_completo);
      formData.append("fc_origen", form.fc_origen);
      formData.append("fc_motivo", form.fc_motivo);
      formData.append("fc_observaciones", form.fc_observaciones);
      formData.append("fc_foto_identificacion", form.fc_foto_identificacion);
      formData.append("fd_entrada", form.fd_entrada);
      formData.append("fd_salida", form.fd_salida);
      formData.append("fi_usuario_id", form.fi_usuario_id);
      formData.append("ubicacion", form.ubicacion);

      if (editId) {
        await axios.put(`${API_URL}/visitas/${editId}`, formData);
      } else {
        await axios.post(`${API_URL}/visitas`, formData);
      }
      setEditId(null);
      setForm({
        fd_fecha: "",
        fc_nombre_completo: "",
        fc_origen: "",
        fc_motivo: "",
        fc_observaciones: "",
        fc_foto_identificacion: "",
        fd_entrada: "",
        fd_salida: "",
        fi_usuario_id: 1,
        ubicacion: form.ubicacion,
      });
      cargarDatos();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const editar = (r) => {
    setEditId(r.fi_id);
    setForm({ ...r, fd_fecha: r.fd_fecha?.split("T")[0] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/visitas/${id}`);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!window.confirm(" ¿Eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await axios.delete(`${API_URL}/visitas`);
    cargarDatos();
  };

  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/${form.ubicacion}.png`;
    const color = form.ubicacion === "ceiba" ? [46, 125, 50] : form.ubicacion === "quality" ? [25, 118, 210] : [13, 71, 161];

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {}

    doc.setFontSize(14);
    doc.text(`Bitácora de Visitas — ${form.ubicacion.charAt(0).toUpperCase() + form.ubicacion.slice(1)}`, 45, 20);
    doc.setFontSize(10);
    doc.text("Registro de visitas, motivos y observaciones", 45, 26);

    const columnas = ["Fecha", "Nombre", "Origen", "Motivo", "Foto ID", "Entrada", "Salida", "Observaciones"];
    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
      r.fc_nombre_completo,
      r.fc_origen,
      r.fc_motivo,
      r.fc_foto_identificacion,
      r.fd_entrada,
      r.fd_salida,
      r.fc_observaciones,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7 },
      headStyles: { fillColor: color, textColor: 255, halign: "center" },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Visitas_${form.ubicacion}_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Visitas — {form.ubicacion.charAt(0).toUpperCase() + form.ubicacion.slice(1)}
      </Typography>

      {/* Filtro superior */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FormControl size="small" sx={{ width: 250, mr: 2 }}>
          <InputLabel>Ubicación</InputLabel>
          <Select
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
          >
            {ubicaciones.map((op) => (
              <MenuItem key={op} value={op}>
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Buscar Nombre / Origen"
          variant="outlined"
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* FORMULARIO PRINCIPAL */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fd_fecha"
                value={form.fd_fecha}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Nombre Completo"
                name="fc_nombre_completo"
                value={form.fc_nombre_completo}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Origen"
                name="fc_origen"
                value={form.fc_origen}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Motivo"
                name="fc_motivo"
                value={form.fc_motivo}
                onChange={handleChange}
                fullWidth
                multiline
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            {/*  Fila final con carga de archivo y horas alineadas */}
            <Grid size={12}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{
                        textTransform: "none",
                        borderColor: "#1976d2",
                        color: "#1976d2",
                        "&:hover": { backgroundColor: "rgba(25,118,210,0.08)" },
                      }}
                    >
                       Subir identificación
                      <input
                        type="file"
                        hidden
                        name="fc_foto_identificacion"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </Button>
                    {form.fc_foto_identificacion && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.8rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "120px",
                        }}
                      >
                        {form.fc_foto_identificacion.name ||
                          String(form.fc_foto_identificacion).slice(0, 20)}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Hora de Entrada"
                    type="time"
                    name="fd_entrada"
                    value={form.fd_entrada}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Hora de Salida"
                    type="time"
                    name="fd_salida"
                    value={form.fd_salida}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Botones */}
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

      {/* TABLA DE REGISTROS */}
      <Paper>
        <Table>
          <TableHead sx={{ background: "#FFF9C4" }}>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Origen</TableCell>
              <TableCell>Motivo</TableCell>
              <TableCell>Foto ID</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Salida</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fd_fecha?.split("T")[0]}</TableCell>
                <TableCell>{r.fc_nombre_completo}</TableCell>
                <TableCell>{r.fc_origen}</TableCell>
                <TableCell>{r.fc_motivo}</TableCell>
                <TableCell>{r.fc_foto_identificacion}</TableCell>
                <TableCell>{r.fd_entrada}</TableCell>
                <TableCell>{r.fd_salida}</TableCell>
                <TableCell>{r.fc_observaciones}</TableCell>
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

export default function BitacoraVisitas() {
  return <BitacoraVisitasContent />;
}
