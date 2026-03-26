import React, { useEffect, useState, useCallback } from "react";
import { API_URL } from "../utils/api.js";
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Build from "@mui/icons-material/Build";
import Close from "@mui/icons-material/Close";
import axios from "../utils/axiosInstance.js";
import useFormValidation from "../hooks/useFormValidation";
import useConfirm from "../hooks/useConfirm";

function EquiposContent() {
  const usuario_id = localStorage.getItem("usuario_id");
  const nombreUsuario =
    localStorage.getItem("usuario_nombre")?.toLowerCase() || "";

  const [form, setForm] = useState({
    fc_nombre: "",
    fc_marca: "",
    fc_modelo: "",
    fc_tipo: "",
    fd_fecha_compra: "",
    fn_costo: "",
    fc_estado: "Operativo",
    fc_ubicacion: "",
    fc_responsable: "",
    fd_proximo_mantenimiento: "",
    fc_notas: "",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [mantenimientos, setMantenimientos] = useState([]);
  const [openMantenimiento, setOpenMantenimiento] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [nuevoMantenimiento, setNuevoMantenimiento] = useState({
    fd_fecha: "",
    fc_tipo: "Preventivo",
    fc_responsable: "",
    fc_descripcion: "",
    fn_costo: "",
    fc_estado_post: "",
    fd_proximo_mantenimiento: "",
  });

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const requiredFields = [
    "fc_nombre", "fc_marca", "fc_modelo", "fc_tipo",
    "fd_fecha_compra", "fn_costo", "fc_estado", "fc_ubicacion",
    "fc_responsable", "fd_proximo_mantenimiento", "fc_notas",
  ];

  const {
    errors: mantErrors,
    validate: validateMant,
    clearFieldError: clearMantFieldError,
    clearErrors: clearMantErrors,
  } = useFormValidation();
  const mantRequiredFields = [
    "fd_fecha", "fc_tipo", "fc_responsable", "fc_descripcion",
    "fn_costo", "fc_estado_post", "fd_proximo_mantenimiento",
  ];

  const api = `${API_URL}/equipos`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  //  Cargar equipos
  const cargarDatos = useCallback(async () => {
    if (!usuario_id) return;
    try {
      const res = await axios.get(`${api}/${usuario_id}`);
      setData(res.data);
    } catch {
      setSnackbar({
        open: true,
        message: "Error al cargar equipos",
        severity: "error",
      });
    }
  }, [usuario_id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  //  Guardar / actualizar
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await axios.put(`${api}/${editId}`, form);
        setSnackbar({
          open: true,
          message: " Equipo actualizado correctamente",
          severity: "success",
        });
      } else {
        await axios.post(api, { ...form, fi_usuario_id: usuario_id });
        setSnackbar({
          open: true,
          message: " Equipo registrado correctamente",
          severity: "success",
        });
      }
      limpiar();
      cargarDatos();
    } catch {
      setSnackbar({
        open: true,
        message: " Error al guardar el registro",
        severity: "error",
      });
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_equipo_id);
    setForm({
      fc_nombre: row.fc_nombre,
      fc_marca: row.fc_marca,
      fc_modelo: row.fc_modelo,
      fc_tipo: row.fc_tipo,
      fd_fecha_compra: row.fd_fecha_compra?.split("T")[0],
      fn_costo: row.fn_costo,
      fc_estado: row.fc_estado,
      fc_ubicacion: row.fc_ubicacion,
      fc_responsable: row.fc_responsable,
      fd_proximo_mantenimiento: row.fd_proximo_mantenimiento?.split("T")[0],
      fc_notas: row.fc_notas,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar este equipo?")) return;
    await axios.delete(`${api}/${id}`);
    cargarDatos();
    setSnackbar({
      open: true,
      message: " Equipo eliminado correctamente",
      severity: "info",
    });
  };

  const eliminarTodos = async () => {
    if (!await confirm(" ¿Eliminar todos los equipos?")) return;
    await Promise.all(data.map((r) => axios.delete(`${api}/${r.fi_equipo_id}`)));
    cargarDatos();
    setSnackbar({
      open: true,
      message: " Todos los equipos fueron eliminados",
      severity: "warning",
    });
  };

  const limpiar = () => {
    setForm({
      fc_nombre: "",
      fc_marca: "",
      fc_modelo: "",
      fc_tipo: "",
      fd_fecha_compra: "",
      fn_costo: "",
      fc_estado: "Operativo",
      fc_ubicacion: "",
      fc_responsable: "",
      fd_proximo_mantenimiento: "",
      fc_notas: "",
    });
    setEditId(null);
    clearErrors();
    setSnackbar({
      open: true,
      message: "Formulario limpiado correctamente",
      severity: "info",
    });
  };

  //  Mantenimientos
  const abrirMantenimientos = async (id) => {
    const res = await axios.get(`${api}/${id}/mantenimientos`);
    setMantenimientos(res.data);
    setOpenMantenimiento(true);
    setEditId(id);
  };

  const agregarMantenimiento = async () => {
    if (!validateMant(nuevoMantenimiento, mantRequiredFields)) return;
    try {
      await axios.post(`${api}/${editId}/mantenimientos`, nuevoMantenimiento);
      const res = await axios.get(`${api}/${editId}/mantenimientos`);
      setMantenimientos(res.data);
      setSnackbar({
        open: true,
        message: " Mantenimiento registrado correctamente",
        severity: "success",
      });
      clearMantErrors();
      setNuevoMantenimiento({
        fd_fecha: "",
        fc_tipo: "Preventivo",
        fc_responsable: "",
        fc_descripcion: "",
        fn_costo: "",
        fc_estado_post: "",
        fd_proximo_mantenimiento: "",
      });
    } catch {
      setSnackbar({
        open: true,
        message: " Error al guardar mantenimiento",
        severity: "error",
      });
    }
  };

  //  Exportar PDF con logo dinámico
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");

    // Logo según usuario
    let logo = `${""}/images/quality.png`;
    if (nombreUsuario.includes("ceiba"))
      logo = `${""}/images/ceiba.png`;
    if (nombreUsuario.includes("medellin"))
      logo = `${""}/images/medellin.png`;

    doc.addImage(logo, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Inventario de Equipos y Herramientas", 45, 20);
    doc.setFontSize(10);
    doc.text(
      "Control de estado, ubicación y mantenimiento preventivo",
      45,
      26
    );

    const columnas = [
      "Nombre",
      "Tipo",
      "Estado",
      "Responsable",
      "Ubicación",
      "Costo",
      "Próx. Mant.",
    ];

    const filas = data.map((r) => [
      r.fc_nombre,
      r.fc_tipo,
      r.fc_estado,
      r.fc_responsable,
      r.fc_ubicacion,
      `$${r.fn_costo}`,
      r.fd_proximo_mantenimiento?.split("T")[0] || "—",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Equipos_y_Herramientas_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Equipos y Herramientas
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Nombre"
                name="fc_nombre"
                value={form.fc_nombre}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_nombre}
                helperText={errors.fc_nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Marca"
                name="fc_marca"
                value={form.fc_marca}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_marca}
                helperText={errors.fc_marca}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Modelo"
                name="fc_modelo"
                value={form.fc_modelo}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_modelo}
                helperText={errors.fc_modelo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Tipo"
                name="fc_tipo"
                value={form.fc_tipo}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_tipo}
                helperText={errors.fc_tipo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Fecha Compra"
                name="fd_fecha_compra"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_compra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha_compra}
                helperText={errors.fd_fecha_compra}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Costo"
                type="number"
                name="fn_costo"
                value={form.fn_costo}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_costo}
                helperText={errors.fn_costo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Estado"
                name="fc_estado"
                value={form.fc_estado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_estado}
                helperText={errors.fc_estado}
              >
                <MenuItem value="Operativo">Operativo</MenuItem>
                <MenuItem value="En mantenimiento">En mantenimiento</MenuItem>
                <MenuItem value="Dañado">Dañado</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Ubicación"
                name="fc_ubicacion"
                value={form.fc_ubicacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_ubicacion}
                helperText={errors.fc_ubicacion}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_responsable}
                helperText={errors.fc_responsable}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                type="date"
                label="Próximo Mantenimiento"
                name="fd_proximo_mantenimiento"
                InputLabelProps={{ shrink: true }}
                value={form.fd_proximo_mantenimiento}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_proximo_mantenimiento}
                helperText={errors.fd_proximo_mantenimiento}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Notas"
                name="fc_notas"
                value={form.fc_notas}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_notas}
                helperText={errors.fc_notas}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: 2 }}
              onClick={limpiar}
            >
               Limpiar
            </Button>
            <Button
              variant="outlined"
              color="success"
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
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Próx. Mant.</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.fi_equipo_id}>
                <TableCell>{row.fc_nombre}</TableCell>
                <TableCell>{row.fc_tipo}</TableCell>
                <TableCell>{row.fc_estado}</TableCell>
                <TableCell>{row.fc_responsable}</TableCell>
                <TableCell>{row.fc_ubicacion}</TableCell>
                <TableCell>
                  {row.fd_proximo_mantenimiento?.split("T")[0]}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => editar(row)}
                  >
                    <Edit />
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => eliminar(row.fi_equipo_id)}
                  >
                    <Delete />
                  </Button>
                  <Button
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => abrirMantenimientos(row.fi_equipo_id)}
                  >
                    <Build />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* MODAL DE MANTENIMIENTOS */}
      <Dialog
        open={openMantenimiento}
        onClose={() => setOpenMantenimiento(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Mantenimientos del Equipo</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Fecha"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={nuevoMantenimiento.fd_fecha}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fd_fecha: e.target.value,
                  });
                  clearMantFieldError("fd_fecha");
                }}
                fullWidth
                error={!!mantErrors.fd_fecha}
                helperText={mantErrors.fd_fecha}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Tipo"
                name="fc_tipo"
                value={nuevoMantenimiento.fc_tipo}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fc_tipo: e.target.value,
                  });
                  clearMantFieldError("fc_tipo");
                }}
                fullWidth
                error={!!mantErrors.fc_tipo}
                helperText={mantErrors.fc_tipo}
              >
                <MenuItem value="Preventivo">Preventivo</MenuItem>
                <MenuItem value="Correctivo">Correctivo</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Responsable"
                name="fc_responsable"
                value={nuevoMantenimiento.fc_responsable}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fc_responsable: e.target.value,
                  });
                  clearMantFieldError("fc_responsable");
                }}
                fullWidth
                error={!!mantErrors.fc_responsable}
                helperText={mantErrors.fc_responsable}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Descripción"
                name="fc_descripcion"
                value={nuevoMantenimiento.fc_descripcion}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fc_descripcion: e.target.value,
                  });
                  clearMantFieldError("fc_descripcion");
                }}
                multiline
                rows={2}
                fullWidth
                error={!!mantErrors.fc_descripcion}
                helperText={mantErrors.fc_descripcion}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Costo"
                type="number"
                name="fn_costo"
                value={nuevoMantenimiento.fn_costo}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fn_costo: e.target.value,
                  });
                  clearMantFieldError("fn_costo");
                }}
                fullWidth
                error={!!mantErrors.fn_costo}
                helperText={mantErrors.fn_costo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Estado Posterior"
                name="fc_estado_post"
                value={nuevoMantenimiento.fc_estado_post}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fc_estado_post: e.target.value,
                  });
                  clearMantFieldError("fc_estado_post");
                }}
                fullWidth
                error={!!mantErrors.fc_estado_post}
                helperText={mantErrors.fc_estado_post}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Próximo Mantenimiento"
                name="fd_proximo_mantenimiento"
                InputLabelProps={{ shrink: true }}
                value={nuevoMantenimiento.fd_proximo_mantenimiento}
                onChange={(e) => {
                  setNuevoMantenimiento({
                    ...nuevoMantenimiento,
                    fd_proximo_mantenimiento: e.target.value,
                  });
                  clearMantFieldError("fd_proximo_mantenimiento");
                }}
                fullWidth
                error={!!mantErrors.fd_proximo_mantenimiento}
                helperText={mantErrors.fd_proximo_mantenimiento}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={agregarMantenimiento}
          >
            <Add /> Agregar
          </Button>

          <Table size="small" sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Responsable</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Costo</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mantenimientos.map((m) => (
                <TableRow key={m.fi_mantenimiento_id}>
                  <TableCell>{m.fd_fecha?.split("T")[0]}</TableCell>
                  <TableCell>{m.fc_tipo}</TableCell>
                  <TableCell>{m.fc_responsable}</TableCell>
                  <TableCell>{m.fc_descripcion}</TableCell>
                  <TableCell>${m.fn_costo}</TableCell>
                  <TableCell>{m.fc_estado_post}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenMantenimiento(false)}
            startIcon={<Close />}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {ConfirmModal}
    </Box>
  );
}

export default function Equipos() {
  return <EquiposContent />;
}
