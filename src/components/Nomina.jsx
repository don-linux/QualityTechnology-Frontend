import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/api.js";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Edit, PictureAsPdf } from "@mui/icons-material";

export default function Nomina() {
  const [form, setForm] = useState({
    fc_nombre_empleado: "",
    fi_empleado_id: "",
    fd_fecha_pago: "",
    fn_total: "",
    fn_bono: "",
    fn_deuda: "",
    fn_descuento: "",
    fn_anticipo: "",
    fi_usuario_id: 1,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState({ nombre: "", fecha: "" });

  const api = `${API_URL}/nomina`;

  const cargarDatos = async () => {
    const res = await axios.get(api);
    setData(res.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardar = async () => {
    if (editId) {
      await axios.put(`${api}/${editId}`, form);
    } else {
      await axios.post(api, form);
    }
    limpiar();
    cargarDatos();
  };

  const limpiar = () => {
    setForm({
      fc_nombre_empleado: "",
      fi_empleado_id: "",
      fd_fecha_pago: "",
      fn_total: "",
      fn_bono: "",
      fn_deuda: "",
      fn_descuento: "",
      fn_anticipo: "",
      fi_usuario_id: 1,
    });
    setEditId(null);
  };

  const buscar = async () => {
    const params = new URLSearchParams();
    if (busqueda.nombre) params.append("nombre", busqueda.nombre);
    if (busqueda.fecha) params.append("fecha", busqueda.fecha);
    const res = await axios.get(`${api}?${params.toString()}`);
    setData(res.data);
  };

  const exportarPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.text("Reporte de Nómina", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Empleado", "Total", "Bono", "Deuda", "Descuento", "Anticipo"]],
      body: data.map((r) => [
        r.fc_nombre_empleado,
        `$${r.fn_total}`,
        `$${r.fn_bono}`,
        `$${r.fn_deuda}`,
        `$${r.fn_descuento}`,
        `$${r.fn_anticipo}`,
      ]),
    });
    doc.save("Nomina.pdf");
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>💵 Nómina</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Nombre del empleado" name="fc_nombre_empleado" value={form.fc_nombre_empleado} onChange={(e) => setForm({ ...form, fc_nombre_empleado: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="ID" name="fi_empleado_id" value={form.fi_empleado_id} onChange={(e) => setForm({ ...form, fi_empleado_id: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Fecha de Pago" type="date" name="fd_fecha_pago" InputLabelProps={{ shrink: true }} value={form.fd_fecha_pago} onChange={(e) => setForm({ ...form, fd_fecha_pago: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Total" type="number" name="fn_total" value={form.fn_total} onChange={(e) => setForm({ ...form, fn_total: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Bono" type="number" name="fn_bono" value={form.fn_bono} onChange={(e) => setForm({ ...form, fn_bono: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Deuda" type="number" name="fn_deuda" value={form.fn_deuda} onChange={(e) => setForm({ ...form, fn_deuda: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Descuento" type="number" name="fn_descuento" value={form.fn_descuento} onChange={(e) => setForm({ ...form, fn_descuento: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Anticipo" type="number" name="fn_anticipo" value={form.fn_anticipo} onChange={(e) => setForm({ ...form, fn_anticipo: e.target.value })} fullWidth />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={guardar}>{editId ? "Actualizar" : "Guardar"}</Button>
            <Button variant="outlined" sx={{ ml: 2 }} onClick={limpiar}>Limpiar</Button>
            <Button variant="outlined" color="success" sx={{ ml: 2 }} onClick={exportarPDF}><PictureAsPdf /> PDF</Button>
          </Box>
        </CardContent>
      </Card>

      {/* BUSCADOR */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Buscar por nombre" value={busqueda.nombre} onChange={(e) => setBusqueda({ ...busqueda, nombre: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Buscar por fecha" type="date" InputLabelProps={{ shrink: true }} value={busqueda.fecha} onChange={(e) => setBusqueda({ ...busqueda, fecha: e.target.value })} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="contained" sx={{ height: "100%" }} onClick={buscar}>Buscar</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Paper>
        <Table size="small">
          <TableHead sx={{ background: "#97dcfcff" }}>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Bono</TableCell>
              <TableCell>Deuda</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell>Anticipo</TableCell>
              <TableCell>Fecha Pago</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_nomina_id}>
                <TableCell>{r.fc_nombre_empleado}</TableCell>
                <TableCell>${r.fn_total}</TableCell>
                <TableCell>${r.fn_bono}</TableCell>
                <TableCell>${r.fn_deuda}</TableCell>
                <TableCell>${r.fn_descuento}</TableCell>
                <TableCell>${r.fn_anticipo}</TableCell>
                <TableCell>{r.fd_fecha_pago?.split("T")[0]}</TableCell>
                <TableCell>
                  <Button size="small" color="warning" variant="contained" onClick={() => setForm(r)}>
                    <Edit fontSize="small" />
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
