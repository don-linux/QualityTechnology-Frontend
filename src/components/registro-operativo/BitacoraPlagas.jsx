import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../../utils/api.js";
import {
  Box, Card, CardContent, Grid, Typography, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Paper,
  InputAdornment, MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BitacoraPlagasContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fn_num_trampa: "",
    tipo_trampa: "",
    fc_hallazgo: "",
    fc_malla: "",
    fc_veneno: "",
    fc_observaciones: "",
    fc_verifico: "",
    unidad_produccion: "",
    fi_usuario_id: 1,
    ubicacion: "medellin",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  //  Opciones para selects
  const tiposTrampa = ["Adhesiva", "Cebadera", "Mecánica", "Luz UV", "Otro"];
  const tiposMalla = ["Buena", "Dañada", "Sin Malla"];
  const tiposVeneno = ["Rodenticida", "Gel", "Granulado", "Líquido", "Ninguno"];
  const unidadesProduccion = ["Engorda", "Alevinaje", "Reproductores"];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  //  Cargar y filtrar registros
  const cargarDatos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/plagas?ubicacion=${form.ubicacion}`);
      const filtrados = res.data.filter((r) => {
        if (!busqueda) return true;
        return (
          r.tipo_trampa?.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.fn_num_trampa?.toString().includes(busqueda)
        );
      });
      setData(filtrados);
    } catch (err) {
      console.error("Error al cargar datos:", err.message);
    }
  }, [form.ubicacion, busqueda]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  //  Guardar o actualizar
  const guardar = async () => {
    try {
      if (editId)
        await axios.put(`${API_URL}/plagas/${editId}`, form);
      else await axios.post(`${API_URL}/plagas`, form);

      setEditId(null);
      setForm({
        fd_fecha: "",
        fn_num_trampa: "",
        tipo_trampa: "",
        fc_hallazgo: "",
        fc_malla: "",
        fc_veneno: "",
        fc_observaciones: "",
        fc_verifico: "",
        unidad_produccion: "",
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
    await axios.delete(`${API_URL}/plagas/${id}`);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!window.confirm(" ¿Eliminar todos los registros de esta ubicación?")) return;
    await axios.delete(`${API_URL}/plagas?ubicacion=${form.ubicacion}`);
    cargarDatos();
  };

  //  Color PDF dinámico
  const getColorPorUbicacion = () => {
    switch (form.ubicacion) {
      case "ceiba":
        return [46, 125, 50]; // verde pasto
      case "quality":
        return [25, 118, 210]; // azul normal
      default:
        return [13, 71, 161]; // azul marino Medellín
    }
  };

  //  Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/${form.ubicacion}.png`;
    const color = getColorPorUbicacion();

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {}

    doc.setFontSize(14);
    doc.text(
      `Bitácora de Control de Plagas — ${form.ubicacion.toUpperCase()}`,
      45,
      20
    );
    doc.setFontSize(10);
    doc.text("Registro de trampas por unidad de producción", 45, 26);

    const columnas = [
      "Fecha",
      "Trampa",
      "Tipo",
      "Unidad",
      "Hallazgo",
      "Malla",
      "Veneno",
      "Verificó",
      "Observaciones",
    ];
    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
      r.fn_num_trampa,
      r.tipo_trampa,
      r.unidad_produccion,
      r.fc_hallazgo,
      r.fc_malla,
      r.fc_veneno,
      r.fc_verifico,
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
    doc.save(`Bitacora_Plagas_${form.ubicacion}_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>
         {form.ubicacion.charAt(0).toUpperCase() + form.ubicacion.slice(1)} — Control de Plagas
      </Typography>

      {/* Filtros compactos */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <TextField
          select
          label="Ubicación"
          name="ubicacion"
          value={form.ubicacion}
          onChange={handleChange}
          size="small"
          sx={{ width: 200 }}
        >
          <MenuItem value="medellin">Medellín</MenuItem>
          <MenuItem value="ceiba">La Ceiba</MenuItem>
          <MenuItem value="quality">Quality</MenuItem>
        </TextField>

        <TextField
          label="Buscar Trampa / Tipo"
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
          sx={{ width: 250 }}
        />
      </Box>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="No. Trampa"
                name="fn_num_trampa"
                value={form.fn_num_trampa}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Tipo de Trampa"
                name="tipo_trampa"
                value={form.tipo_trampa}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {tiposTrampa.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Unidad de Producción"
                name="unidad_produccion"
                value={form.unidad_produccion}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {unidadesProduccion.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Malla"
                name="fc_malla"
                value={form.fc_malla}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {tiposMalla.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Veneno"
                name="fc_veneno"
                value={form.fc_veneno}
                onChange={handleChange}
                fullWidth
                size="small"
              >
                {tiposVeneno.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Verificó"
                name="fc_verifico"
                value={form.fc_verifico}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Hallazgo"
                name="fc_hallazgo"
                value={form.fc_hallazgo}
                onChange={handleChange}
                fullWidth
                size="small"
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
                size="small"
              />
            </Grid>
          </Grid>

          {/* Botones */}
          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button variant="contained" size="small" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
            <Button variant="outlined" size="small" onClick={exportarPDF}>
               Exportar PDF
            </Button>
            <Button variant="contained" size="small" color="error" onClick={eliminarTodos}>
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
              <TableCell>Fecha</TableCell>
              <TableCell>Trampa</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Hallazgo</TableCell>
              <TableCell>Malla</TableCell>
              <TableCell>Veneno</TableCell>
              <TableCell>Verificó</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fd_fecha?.split("T")[0]}</TableCell>
                <TableCell>{r.fn_num_trampa}</TableCell>
                <TableCell>{r.tipo_trampa}</TableCell>
                <TableCell>{r.unidad_produccion}</TableCell>
                <TableCell>{r.fc_hallazgo}</TableCell>
                <TableCell>{r.fc_malla}</TableCell>
                <TableCell>{r.fc_veneno}</TableCell>
                <TableCell>{r.fc_verifico}</TableCell>
                <TableCell>{r.fc_observaciones}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
                    sx={{ mr: 0.5 }}
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

export default function BitacoraPlagas() {
  return <BitacoraPlagasContent />;
}
