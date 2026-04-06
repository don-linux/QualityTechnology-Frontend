import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "../../utils/config.js";
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
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import SearchIcon from "@mui/icons-material/Search";
import axios from "../../utils/axiosInstance.js";
import useFormValidation from "../../hooks/useFormValidation";
import useConfirm from "../../hooks/useConfirm";

function RecepcionInsumosContent() {
  const [form, setForm] = useState({
    fd_fecha: "",
    fc_proveedor: "",
    fc_producto: "",
    fc_lote: "",
    fc_cantidad: "",
    fc_unidad_medida: "",
    fc_condiciones_entrega: "",
    fc_verifico: "",
    fc_observaciones: "",
    fi_usuario_id: 1,
    ubicacion: "medellin",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fd_fecha", "fc_proveedor", "fc_producto", "fc_lote",
    "fc_cantidad", "fc_unidad_medida", "fc_condiciones_entrega",
    "fc_verifico", "fc_observaciones",
  ];

  //  Opciones para selects
  const unidadesMedida = ["Kg", "Litros", "Piezas", "Bultos", "Otro"];
  const ubicaciones = ["medellin", "ceiba", "quality"]; // Opciones para la ubicación

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  Cargar y filtrar registros
  const cargarDatos = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/recepcion_insumos?ubicacion=${form.ubicacion}`);
      const filtrados = res.data.filter((r) => {
        if (!busqueda) return true;
        return (
          r.fc_producto?.toLowerCase().includes(busqueda.toLowerCase()) ||
          r.fc_lote?.toString().includes(busqueda)
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
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await axios.put(`${API_URL}/recepcion_insumos/${editId}`, form);
      else await axios.post(`${API_URL}/recepcion_insumos`, form);

      setEditId(null);
      setForm({
        fd_fecha: "",
        fc_proveedor: "",
        fc_producto: "",
        fc_lote: "",
        fc_cantidad: "",
        fc_unidad_medida: "",
        fc_condiciones_entrega: "",
        fc_verifico: "",
        fc_observaciones: "",
        fi_usuario_id: 1,
        ubicacion: form.ubicacion,
      });
      cargarDatos();
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({ ...r, fd_fecha: r.fd_fecha?.split("T")[0] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/recepcion_insumos/${id}`);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm("Advertencia: ¿Eliminar todos los registros de esta ubicación?")) return;
    await axios.delete(`${API_URL}/recepcion_insumos?ubicacion=${form.ubicacion}`);
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
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = `${""}/images/${form.ubicacion}.png`;
    const color = getColorPorUbicacion();

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {}

    doc.setFontSize(14);
    doc.text(
      `Bitácora de Recepción de Insumos — ${form.ubicacion.toUpperCase()}`,
      45,
      20
    );
    doc.setFontSize(10);
    doc.text("Registro de insumos recibidos en la granja", 45, 26);

    const columnas = [
      "Fecha",
      "Proveedor",
      "Producto",
      "Lote",
      "Cantidad",
      "Unidad",
      "Condiciones de entrega",
      "Verificó",
      "Observaciones",
    ];
    const filas = data.map((r) => [
      r.fd_fecha?.split("T")[0],
      r.fc_proveedor,
      r.fc_producto,
      r.fc_lote,
      r.fc_cantidad,
      r.fc_unidad_medida,
      r.fc_condiciones_entrega,
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
    doc.save(`Recepcion_Insumos_${form.ubicacion}_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" mb={2}>
         {form.ubicacion.charAt(0).toUpperCase() + form.ubicacion.slice(1)} — Recepción de Insumos
      </Typography>

      {/* Filtro compacto */}
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
          label="Buscar Producto / Lote"
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
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Proveedor"
                name="fc_proveedor"
                value={form.fc_proveedor}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_proveedor}
                helperText={errors.fc_proveedor}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Producto"
                name="fc_producto"
                value={form.fc_producto}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_producto}
                helperText={errors.fc_producto}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Lote"
                name="fc_lote"
                value={form.fc_lote}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_lote}
                helperText={errors.fc_lote}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Cantidad"
                name="fc_cantidad"
                value={form.fc_cantidad}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_cantidad}
                helperText={errors.fc_cantidad}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Unidad de Medida"
                name="fc_unidad_medida"
                value={form.fc_unidad_medida}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_unidad_medida}
                helperText={errors.fc_unidad_medida}
              >
                {unidadesMedida.map((op) => (
                  <MenuItem key={op} value={op}>{op}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Condiciones de entrega"
                name="fc_condiciones_entrega"
                value={form.fc_condiciones_entrega}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_condiciones_entrega}
                helperText={errors.fc_condiciones_entrega}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Verificó"
                name="fc_verifico"
                value={form.fc_verifico}
                onChange={handleChange}
                fullWidth
                size="small"
                error={!!errors.fc_verifico}
                helperText={errors.fc_verifico}
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
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones}
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
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Proveedor</TableCell>
              <TableCell>Producto</TableCell>
              <TableCell>Lote</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell>Condiciones de entrega</TableCell>
              <TableCell>Verificó</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((r) => (
              <TableRow key={r.fi_id}>
                <TableCell>{r.fd_fecha?.split("T")[0]}</TableCell>
                <TableCell>{r.fc_proveedor}</TableCell>
                <TableCell>{r.fc_producto}</TableCell>
                <TableCell>{r.fc_lote}</TableCell>
                <TableCell>{r.fc_cantidad}</TableCell>
                <TableCell>{r.fc_unidad_medida}</TableCell>
                <TableCell>{r.fc_condiciones_entrega}</TableCell>
                <TableCell>{r.fc_verifico}</TableCell>
                <TableCell>{r.fc_observaciones}</TableCell>
                <TableCell>
                  <Button size="small" variant="contained" color="warning" onClick={() => editar(r)}>
                    Editar
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => eliminar(r.fi_id)}>
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

export default function RecepcionInsumos() {
  return <RecepcionInsumosContent />;
}
