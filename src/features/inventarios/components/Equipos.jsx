import React, { useEffect, useState, useCallback } from "react";
import {
  listEquipos,
  createEquipo,
  updateEquipo,
} from "../services/equiposService";
import { formatFecha, formatPrecio } from "@shared/utils/formatters";
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
import MenuItem from "@mui/material/MenuItem";
import Edit from "@mui/icons-material/Edit";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import CampoNumerico from "@shared/components/CampoNumerico";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import useUnidadesNegocioOptions from "@features/catalogos/hooks/useUnidadesNegocioOptions";

function EquiposContent() {
  const usuario_id = localStorage.getItem("usuario_id");
  const nombreUsuario =
    localStorage.getItem("usuario_nombre")?.toLowerCase() || "";
  const {
    ubicacionesGenericas,
    loading: ubicacionesLoading,
    error: ubicacionesError,
  } = useUnidadesNegocioOptions();

  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    tipo: "",
    fecha_compra: "",
    costo: "",
    estado: "Operativo",
    ubicacion: "",
    notas: "",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const showSnackbar = useSnackbar();

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();
  const requiredFields = [
    "nombre", "marca", "modelo", "tipo",
    "fecha_compra", "costo", "estado", "ubicacion",
    "notas",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const ubicacionEnCatalogo = ubicacionesGenericas.some(
    (op) => op.value === form.ubicacion
  );

  const cargarDatos = useCallback(async () => {
    if (!usuario_id) return;
    try {
      const res = await listEquipos(usuario_id);
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar equipos", "error");
    }
  }, [usuario_id, showSnackbar]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) {
        await updateEquipo(editId, form);
        showSnackbar(" Equipo actualizado correctamente", "success");
      } else {
        await createEquipo({ ...form, usuario_id });
        showSnackbar(" Equipo registrado correctamente", "success");
      }
      limpiar();
      cargarDatos();
    } catch {
      showSnackbar(" Error al guardar el registro", "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row.equipo_id);
    setForm({
      nombre: row.nombre,
      marca: row.marca,
      modelo: row.modelo,
      tipo: row.tipo,
      fecha_compra: row.fecha_compra?.split("T")[0],
      costo: row.costo,
      estado: row.estado,
      ubicacion: row.ubicacion,
      notas: row.notas,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const limpiar = () => {
    setForm({
      nombre: "",
      marca: "",
      modelo: "",
      tipo: "",
      fecha_compra: "",
      costo: "",
      estado: "Operativo",
      ubicacion: "",
      notas: "",
    });
    setEditId(null);
    clearErrors();
    cerrarFormulario();
    showSnackbar("Formulario limpiado correctamente", "info");
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");

    let logo = `${""}/images/quality.png`;
    if (nombreUsuario.includes("ceiba"))
      logo = `${""}/images/ceiba.png`;
    if (nombreUsuario.includes("medellin"))
      logo = `${""}/images/medellin.png`;

    doc.addImage(logo, "PNG", 10, 8, 25, 25);
    doc.setFontSize(14);
    doc.text("Inventario de Equipos y Herramientas", 45, 20);
    doc.setFontSize(10);
    doc.text("Control de estado y ubicación", 45, 26);

    const columnas = [
      "Nombre",
      "Tipo",
      "Estado",
      "Ubicación",
      "Costo",
    ];

    const filas = data.map((r) => [
      r.nombre,
      r.tipo,
      r.estado,
      r.ubicacion,
      formatPrecio(r.costo),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    });

    const fecha = formatFecha(new Date());
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Equipos_y_Herramientas_${fecha}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Equipos y Herramientas
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Marca"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                fullWidth
                error={!!errors.marca}
                helperText={errors.marca}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Modelo"
                name="modelo"
                value={form.modelo}
                onChange={handleChange}
                fullWidth
                error={!!errors.modelo}
                helperText={errors.modelo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Tipo"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                fullWidth
                error={!!errors.tipo}
                helperText={errors.tipo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Fecha Compra"
                name="fecha_compra"
                InputLabelProps={{ shrink: true }}
                value={form.fecha_compra}
                onChange={handleChange}
                fullWidth
                error={!!errors.fecha_compra}
                helperText={errors.fecha_compra}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <CampoNumerico
                label="Costo"
                prefix="$" decimalScale={2}
                name="costo"
                value={form.costo}
                onChange={handleChange}
                fullWidth
                error={!!errors.costo}
                helperText={errors.costo}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                fullWidth
                error={!!errors.estado}
                helperText={errors.estado}
              >
                <MenuItem value="Operativo">Operativo</MenuItem>
                <MenuItem value="En mantenimiento">En mantenimiento</MenuItem>
                <MenuItem value="Dañado">Dañado</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                fullWidth
                disabled={ubicacionesLoading}
                error={!!errors.ubicacion}
                helperText={
                  errors.ubicacion ||
                  (ubicacionesError ? "Error al cargar ubicaciones" : "")
                }
              >
                <MenuItem value="">Selecciona una ubicación</MenuItem>
                {ubicacionesGenericas.map((op) => (
                  <MenuItem key={op.id || op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
                {form.ubicacion && !ubicacionEnCatalogo && (
                  <MenuItem value={form.ubicacion}>{form.ubicacion}</MenuItem>
                )}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Notas"
                name="notas"
                value={form.notas}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.notas}
                helperText={errors.notas}
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
          </Box>
        </CardContent>
      </Card>
      </FormularioRegistroPanel>

      <Paper>
        <Table>
          <TableHead sx={{ background: "#E3F2FD" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordenarYNumerar(data, ["equipo_id"]).map((row) => (
              <TableRow key={row.equipo_id}>
                <TableCell>{row._num}</TableCell>
                <TableCell>{row.nombre}</TableCell>
                <TableCell>{row.tipo}</TableCell>
                <TableCell>{row.estado}</TableCell>
                <TableCell>{row.ubicacion}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={() => editar(row)}
                  >
                    <Edit />
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

export default function Equipos() {
  return <EquiposContent />;
}
