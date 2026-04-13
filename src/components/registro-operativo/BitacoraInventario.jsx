import React, { useEffect, useState } from "react";
import { API_URL } from "../../utils/config.js";
import Swal from "sweetalert2";
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
import useFormValidation from "../../hooks/useFormValidation";
import useConfirm from "../../hooks/useConfirm";

function BitacoraInventarioContent() {
  const [form, setForm] = useState({
    fn_num_instalacion: "",
    fn_cantidad: "",
    fn_talla: "",
    fc_lote: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_salida_hormonado: "",
    fi_usuario_id: 1,
  });
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fn_num_instalacion", "fn_cantidad", "fn_talla", "fc_lote",
    "fd_fecha_siembra", "fd_fecha_salida_hormonado", "fc_observacion",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_URL}/medellin/inventario`);
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar inventario:", err.message);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await axios.put(
          `${API_URL}/medellin/inventario/${editId}`,
          form
        );
      else
        await axios.post(`${API_URL}/medellin/inventario`, form);

      setEditId(null);
      setForm({
        fn_num_instalacion: "",
        fn_cantidad: "",
        fn_talla: "",
        fc_lote: "",
        fc_observacion: "",
        fd_fecha_siembra: "",
        fd_fecha_salida_hormonado: "",
        fi_usuario_id: 1,
      });
      cargarDatos();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error al guardar: " + err.message });
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      ...r,
      fd_fecha_siembra: r.fd_fecha_siembra?.split("T")[0],
      fd_fecha_salida_hormonado: r.fd_fecha_salida_hormonado?.split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/medellin/inventario/${id}`);
    cargarDatos();
  };

  //  Eliminar todos
  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    try {
      await axios.delete(`${API_URL}/medellin/inventario`);
      cargarDatos();
      Swal.fire({ icon: "success", title: "Listo", text: "Todos los registros fueron eliminados correctamente." });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Error eliminando todos los registros: " + err.message });
    }
  };

  //  Exportar PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/medellin.png`;

    doc.addImage(logo, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Bitácora de Inventario — Granja Acuícola Medellín", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de inventario de alevines, siembras y observaciones", 45, 26);

    const columnas = [
      "Instalación",
      "Cantidad",
      "Talla",
      "Lote",
      "Siembra",
      "Salida Hormonado",
      "Observación",
    ];
    const filas = data.map((r) => [
      r.fn_num_instalacion,
      r.fn_cantidad,
      r.fn_talla,
      r.fc_lote,
      r.fd_fecha_siembra?.split("T")[0],
      r.fd_fecha_salida_hormonado?.split("T")[0],
      r.fc_observacion,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7, cellWidth: "wrap" },
      headStyles: {
        fillColor: [21, 101, 192], // Azul institucional
        textColor: 255,
        halign: "center",
      },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Inventario_Medellin_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Medellín — Inventario de Alevines
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Instalación"
                name="fn_num_instalacion"
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Cantidad"
                name="fn_cantidad"
                type="number"
                value={form.fn_cantidad}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_cantidad}
                helperText={errors.fn_cantidad}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Talla"
                name="fn_talla"
                type="number"
                value={form.fn_talla}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_talla}
                helperText={errors.fn_talla}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Lote"
                name="fc_lote"
                value={form.fc_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_lote}
                helperText={errors.fc_lote}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Siembra"
                type="date"
                name="fd_fecha_siembra"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_siembra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_siembra}
                helperText={errors.fd_fecha_siembra}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Fecha Salida Hormonado"
                type="date"
                name="fd_fecha_salida_hormonado"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_salida_hormonado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_salida_hormonado}
                helperText={errors.fd_fecha_salida_hormonado}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Observación"
                name="fc_observacion"
                multiline
                rows={2}
                fullWidth
                value={form.fc_observacion}
                onChange={handleChange}
                error={!!errors.fc_observacion}
                helperText={errors.fc_observacion}
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
              <TableCell>Instalación</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Siembra</TableCell>
              <TableCell>Salida Hormonado</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fn_num_instalacion}</TableCell>
                <TableCell>{r.fn_cantidad}</TableCell>
                <TableCell>{r.fn_talla}</TableCell>
                <TableCell>{r.fc_lote}</TableCell>
                <TableCell>{r.fd_fecha_siembra?.split("T")[0]}</TableCell>
                <TableCell>{r.fd_fecha_salida_hormonado?.split("T")[0]}</TableCell>
                <TableCell>{r.fc_observacion}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="warning"
                    variant="contained"
                    sx={{ mr: 1 }}
                    onClick={() => editar(r)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
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
      {ConfirmModal}
    </Box>
  );
}

export default function BitacoraInventario() {
  return <BitacoraInventarioContent />;
}
