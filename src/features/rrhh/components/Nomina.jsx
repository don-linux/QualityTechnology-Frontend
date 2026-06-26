import React, { useEffect, useState } from "react";
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
import {
  listNomina,
  createNomina,
  updateNomina,
  buscarNomina,
} from "../services/nominaService";
import Edit from "@mui/icons-material/Edit";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import { formatFecha, formatPrecio } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import CampoNumerico from "@shared/components/CampoNumerico";

export default function Nomina() {
  const showSnackbar = useSnackbar();
  const { usuarioId } = useAuth();
  const [form, setForm] = useState({
    nombre_empleado: "",
    empleado_id: "",
    fecha_pago: "",
    total: "",
    bono: "",
    deuda: "",
    descuento: "",
    anticipo: "",
    usuario_id: usuarioId,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState({ nombre: "", fecha: "" });

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "nombre_empleado",
    "empleado_id",
    "fecha_pago",
    "total",
    "bono",
    "deuda",
    "descuento",
    "anticipo",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    const res = await listNomina();
    setData(res.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  const prepararPayload = () => {
    const empleadoId = form.empleado_id ? Number(form.empleado_id) : null;
    if (form.empleado_id && Number.isNaN(empleadoId)) {
      showSnackbar("El ID del empleado debe ser numérico.", "success");
      return null;
    }

    const aNumero = (valor) => (valor === "" || valor === null ? 0 : Number(valor));

    return {
      nombre_empleado: form.nombre_empleado.trim(),
      empleado_id: empleadoId,
      fecha_pago: form.fecha_pago,
      total: aNumero(form.total),
      bono: aNumero(form.bono),
      deuda: aNumero(form.deuda),
      descuento: aNumero(form.descuento),
      anticipo: aNumero(form.anticipo),
      usuario_id: Number(form.usuario_id) || 1,
    };
  };

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    const payload = prepararPayload();
    if (!payload) return;

    if (editId) {
      await updateNomina(editId, payload);
    } else {
      await createNomina(payload);
    }
    limpiar();
    cargarDatos();
  };

  const limpiar = () => {
    setForm({
      nombre_empleado: "",
      empleado_id: "",
      fecha_pago: "",
      total: "",
      bono: "",
      deuda: "",
      descuento: "",
      anticipo: "",
      usuario_id: usuarioId,
    });
    setEditId(null);
    clearErrors();
    cerrarFormulario();
  };

  const editarNomina = (r) => {
    clearErrors();
    setEditId(r.nomina_id);
    setForm({
      nombre_empleado: r.nombre_empleado ?? "",
      empleado_id: r.empleado_id ?? "",
      fecha_pago: r.fecha_pago?.split("T")[0] ?? "",
      total: r.total ?? "",
      bono: r.bono ?? "",
      deuda: r.deuda ?? "",
      descuento: r.descuento ?? "",
      anticipo: r.anticipo ?? "",
      usuario_id: usuarioId,
    });
    abrirFormulario();
  };

  const buscar = async () => {
    const res = await buscarNomina({ nombre: busqueda.nombre, fecha: busqueda.fecha });
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
        r.nombre_empleado,
        formatPrecio(r.total),
        formatPrecio(r.bono),
        formatPrecio(r.deuda),
        formatPrecio(r.descuento),
        formatPrecio(r.anticipo),
      ]),
    });
    doc.save("Nomina.pdf");
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}> Nómina</Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Nombre del empleado" name="nombre_empleado" value={form.nombre_empleado} onChange={handleChange} fullWidth error={!!errors.nombre_empleado} helperText={errors.nombre_empleado} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CampoNumerico label="ID" decimalScale={0} name="empleado_id" value={form.empleado_id} onChange={handleChange} fullWidth error={!!errors.empleado_id} helperText={errors.empleado_id} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Fecha de Pago" type="date" name="fecha_pago" InputLabelProps={{ shrink: true }} value={form.fecha_pago} onChange={handleChange} fullWidth error={!!errors.fecha_pago} helperText={errors.fecha_pago} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <CampoNumerico label="Total" prefix="$" decimalScale={2} name="total" value={form.total} onChange={handleChange} fullWidth error={!!errors.total} helperText={errors.total} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CampoNumerico label="Bono" prefix="$" decimalScale={2} name="bono" value={form.bono} onChange={handleChange} fullWidth error={!!errors.bono} helperText={errors.bono} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CampoNumerico label="Deuda" prefix="$" decimalScale={2} name="deuda" value={form.deuda} onChange={handleChange} fullWidth error={!!errors.deuda} helperText={errors.deuda} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CampoNumerico label="Descuento" prefix="$" decimalScale={2} name="descuento" value={form.descuento} onChange={handleChange} fullWidth error={!!errors.descuento} helperText={errors.descuento} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <CampoNumerico label="Anticipo" prefix="$" decimalScale={2} name="anticipo" value={form.anticipo} onChange={handleChange} fullWidth error={!!errors.anticipo} helperText={errors.anticipo} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={guardar}>{editId ? "Actualizar" : "Guardar"}</Button>
            <Button variant="outlined" sx={{ ml: 2 }} onClick={limpiar}>Limpiar</Button>
            <Button variant="outlined" color="success" sx={{ ml: 2 }} onClick={exportarPDF}><PictureAsPdf /> PDF</Button>
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

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
              <TableCell>ID</TableCell>
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
            {ordenarYNumerar(data, ["nomina_id", "id"]).map((r) => (
              <TableRow key={r.nomina_id}>
                <TableCell>{r._num}</TableCell>
                <TableCell>{r.nombre_empleado}</TableCell>
                <TableCell>{formatPrecio(r.total)}</TableCell>
                <TableCell>{formatPrecio(r.bono)}</TableCell>
                <TableCell>{formatPrecio(r.deuda)}</TableCell>
                <TableCell>{formatPrecio(r.descuento)}</TableCell>
                <TableCell>{formatPrecio(r.anticipo)}</TableCell>
                <TableCell>{formatFecha(r.fecha_pago)}</TableCell>
                <TableCell>
                  <Button size="small" color="warning" variant="contained" onClick={() => editarNomina(r)}>
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
