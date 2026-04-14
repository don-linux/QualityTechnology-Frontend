import React, { useEffect, useState } from "react";
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
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  listInsumos,
  createInsumo,
  updateInsumo,
  removeInsumo,
  removeAllInsumos,
} from "../services/biometriasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

export default function BioInsumos() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({
    ubicacion: "",
    fd_fecha: "",
    fc_cantidad_udm: "",
    fc_num_lote: "",
    fc_descripcion: "",
    fc_observaciones: "",
    fc_encargado_entrega: "",
    fc_encargado_recepcion: "",
    fi_usuario_id: usuarioId,
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "ubicacion",
    "fd_fecha", "fc_cantidad_udm", "fc_num_lote", "fc_descripcion",
    "fc_observaciones", "fc_encargado_entrega", "fc_encargado_recepcion",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listInsumos();
      setData(res.data);
    } catch {
      showSnackbar("Error cargando registros.", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await updateInsumo(editId, form);
        showSnackbar("Registro actualizado", "success");
      } else {
        await createInsumo(form);
        showSnackbar("Registro guardado", "success");
      }
      setForm({
        ubicacion: "",
        fd_fecha: "",
        fc_cantidad_udm: "",
        fc_num_lote: "",
        fc_descripcion: "",
        fc_observaciones: "",
        fc_encargado_entrega: "",
        fc_encargado_recepcion: "",
        fi_usuario_id: usuarioId,
      });
      setEditId(null);
      cargarDatos();
    } catch {
      showSnackbar("Error guardando registro.", "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);
    setForm({
      ubicacion: row.ubicacion || "",
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
    if (!await confirm("¿Eliminar registro?")) return;
    await removeInsumo(id);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await removeAllInsumos();
    cargarDatos();
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logoCeiba = `${""}/images/ceiba.png`;

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

  const datosMedellin = data.filter((r) => r.ubicacion === "Medellin");
  const datosCeiba = data.filter((r) => r.ubicacion === "La Ceiba");

  const renderTablaInsumos = (rows) => (
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
          {rows.map((row) => (
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
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Ingresos / Egresos de Insumos
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.ubicacion}
                helperText={errors.ubicacion}
              >
                <MenuItem value="Medellin">Medellín</MenuItem>
                <MenuItem value="La Ceiba">La Ceiba</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                type="date"
                label="Fecha"
                name="fd_fecha"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha}
                onChange={handleChange}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Cantidad UdM"
                name="fc_cantidad_udm"
                value={form.fc_cantidad_udm}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_cantidad_udm}
                helperText={errors.fc_cantidad_udm}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Lote"
                name="fc_num_lote"
                value={form.fc_num_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_num_lote}
                helperText={errors.fc_num_lote}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Descripción"
                name="fc_descripcion"
                value={form.fc_descripcion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_descripcion}
                helperText={errors.fc_descripcion}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                multiline
                rows={2}
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Encargado de Entrega"
                name="fc_encargado_entrega"
                value={form.fc_encargado_entrega}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado_entrega}
                helperText={errors.fc_encargado_entrega}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Encargado de Recepción"
                name="fc_encargado_recepcion"
                value={form.fc_encargado_recepcion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado_recepcion}
                helperText={errors.fc_encargado_recepcion}
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

      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Medellín</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          {renderTablaInsumos(datosMedellin)}
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">La Ceiba</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          {renderTablaInsumos(datosCeiba)}
        </AccordionDetails>
      </Accordion>
      {ConfirmModal}
    </Box>
  );
}

