import React, { useEffect, useState } from "react";
import { API_URL } from "../utils/config.js";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import axios from "../utils/axiosInstance.js";
import Edit from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import useFormValidation from "../hooks/useFormValidation";

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

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  const requiredFields = [
    "fc_nombre_empleado",
    "fi_empleado_id",
    "fd_fecha_pago",
    "fn_total",
    "fn_bono",
    "fn_deuda",
    "fn_descuento",
    "fn_anticipo",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    const res = await axios.get(api);
    setData(res.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const prepararPayload = () => {
    const empleadoId = form.fi_empleado_id ? Number(form.fi_empleado_id) : null;
    if (form.fi_empleado_id && Number.isNaN(empleadoId)) {
      alert("El ID del empleado debe ser numérico.");
      return null;
    }

    const aNumero = (valor) => (valor === "" || valor === null ? 0 : Number(valor));

    return {
      fc_nombre_empleado: form.fc_nombre_empleado.trim(),
      fi_empleado_id: empleadoId,
      fd_fecha_pago: form.fd_fecha_pago,
      fn_total: aNumero(form.fn_total),
      fn_bono: aNumero(form.fn_bono),
      fn_deuda: aNumero(form.fn_deuda),
      fn_descuento: aNumero(form.fn_descuento),
      fn_anticipo: aNumero(form.fn_anticipo),
      fi_usuario_id: Number(form.fi_usuario_id) || 1,
    };
  };

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    const payload = prepararPayload();
    if (!payload) return;

    if (editId) {
      await axios.put(`${api}/${editId}`, payload);
    } else {
      await axios.post(api, payload);
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
    clearErrors();
  };

  const buscar = async () => {
    const params = new URLSearchParams();
    if (busqueda.nombre) params.append("nombre", busqueda.nombre);
    if (busqueda.fecha) params.append("fecha", busqueda.fecha);
    const res = await axios.get(`${api}?${params.toString()}`);
    setData(res.data);
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
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
      <Typography variant="h4" fontWeight="bold" mb={3}> Nómina</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Nombre del empleado" name="fc_nombre_empleado" value={form.fc_nombre_empleado} onChange={handleChange} fullWidth error={!!errors.fc_nombre_empleado} helperText={errors.fc_nombre_empleado} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="ID" type="number" name="fi_empleado_id" value={form.fi_empleado_id} onChange={handleChange} fullWidth error={!!errors.fi_empleado_id} helperText={errors.fi_empleado_id} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Fecha de Pago" type="date" name="fd_fecha_pago" InputLabelProps={{ shrink: true }} value={form.fd_fecha_pago} onChange={handleChange} fullWidth error={!!errors.fd_fecha_pago} helperText={errors.fd_fecha_pago} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Total" type="number" name="fn_total" value={form.fn_total} onChange={handleChange} fullWidth error={!!errors.fn_total} helperText={errors.fn_total} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Bono" type="number" name="fn_bono" value={form.fn_bono} onChange={handleChange} fullWidth error={!!errors.fn_bono} helperText={errors.fn_bono} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Deuda" type="number" name="fn_deuda" value={form.fn_deuda} onChange={handleChange} fullWidth error={!!errors.fn_deuda} helperText={errors.fn_deuda} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Descuento" type="number" name="fn_descuento" value={form.fn_descuento} onChange={handleChange} fullWidth error={!!errors.fn_descuento} helperText={errors.fn_descuento} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField label="Anticipo" type="number" name="fn_anticipo" value={form.fn_anticipo} onChange={handleChange} fullWidth error={!!errors.fn_anticipo} helperText={errors.fn_anticipo} />
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
                  <Button size="small" color="warning" variant="contained" onClick={() => { clearErrors(); setForm(r); }}>
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
