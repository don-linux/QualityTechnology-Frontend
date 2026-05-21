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
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  listRecambios,
  listEmpleadosRecambios,
  createRecambio,
  updateRecambio,
  removeRecambio,
  removeAllRecambios,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

function BitacoraRecambiosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    ubicacion: "",
    fc_mes: "",
    fn_num_instalacion: "",
    fd_fecha1: "",
    fc_tipo1: "",
    fd_fecha2: "",
    fc_tipo2: "",
    fd_fecha3: "",
    fc_tipo3: "",
    fd_fecha4: "",
    fc_tipo4: "",
    fd_fecha5: "",
    fc_tipo5: "",
    fd_fecha6: "",
    fc_tipo6: "",
    fc_responsable: "",
    fi_usuario_id: usuarioId,
  });
  const [data, setData] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const { visible: mostrarFormulario, abrir: abrirFormulario, cerrar: cerrarFormulario, toggle: toggleFormulario } = useFormularioVisible();

  const requiredFields = [
    "ubicacion",
    "fc_mes", "fn_num_instalacion",
    "fd_fecha1", "fc_tipo1", "fd_fecha2", "fc_tipo2",
    "fd_fecha3", "fc_tipo3", "fd_fecha4", "fc_tipo4",
    "fd_fecha5", "fc_tipo5", "fd_fecha6", "fc_tipo6",
    "fc_responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listRecambios();
      setData(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosRecambios();
      setEmpleados(res.data);
    } catch {
      showSnackbar("Error al cargar empleados.", "error");
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarEmpleados();
  }, []);

  useEffect(() => {
    if (!form.ubicacion && defaultUbicacion) {
      setForm((prev) => ({ ...prev, ubicacion: defaultUbicacion }));
    }
  }, [defaultUbicacion, form.ubicacion]);

  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateRecambio(editId, form);
      else await createRecambio(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        ubicacion: form.ubicacion,
        fc_mes: "",
        fn_num_instalacion: "",
        fd_fecha1: "",
        fc_tipo1: "",
        fd_fecha2: "",
        fc_tipo2: "",
        fd_fecha3: "",
        fc_tipo3: "",
        fd_fecha4: "",
        fc_tipo4: "",
        fd_fecha5: "",
        fc_tipo5: "",
        fd_fecha6: "",
        fc_tipo6: "",
        fc_responsable: "",
        fi_usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      showSnackbar("Error al guardar: " + err.message, "error");
    }
  };

  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      ubicacion: r.ubicacion || "",
      fc_mes: r.fc_mes || "",
      fn_num_instalacion: r.fn_num_instalacion || "",
      fd_fecha1: r.fd_fecha1?.split("T")[0],
      fc_tipo1: r.fc_tipo1 || "",
      fd_fecha2: r.fd_fecha2?.split("T")[0],
      fc_tipo2: r.fc_tipo2 || "",
      fd_fecha3: r.fd_fecha3?.split("T")[0],
      fc_tipo3: r.fc_tipo3 || "",
      fd_fecha4: r.fd_fecha4?.split("T")[0],
      fc_tipo4: r.fc_tipo4 || "",
      fd_fecha5: r.fd_fecha5?.split("T")[0],
      fc_tipo5: r.fc_tipo5 || "",
      fd_fecha6: r.fd_fecha6?.split("T")[0],
      fc_tipo6: r.fc_tipo6 || "",
      fc_responsable: r.fc_responsable || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeRecambio(id);
    cargarDatos();
  };

  const eliminarTodos = async () => {
    if (!await confirm(" ¿Deseas eliminar todos los registros?")) return;
    try {
      await removeAllRecambios();
      cargarDatos();
      showSnackbar("Todos los registros fueron eliminados correctamente.", "success");
    } catch (err) {
      showSnackbar("Error eliminando registros: " + err.message, "error");
    }
  };

//  Exportar PDF (formato institucional limpio)
const exportarPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF("l", "mm", "a4");
  const logo = getLogo(form.ubicacion);

  // Logo superior
  try {
    doc.addImage(logo, "PNG", 10, 8, 25, 25);
  } catch {
    // Logo is optional for exported PDFs.
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Registro de Recambios", 140, 20, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(getLabel(form.ubicacion), 140, 27, { align: "center" });

  // Línea para mes
  doc.setFontSize(10);
  doc.text("Mes:", 250, 35);
  doc.line(260, 35, 285, 35);

  //  Mostrar el mes actual sobre la línea
  if (form.fc_mes) {
    doc.text(form.fc_mes, 262, 35);
  }

  // Encabezados
  const columnas = [
    "No. Instalación",
    "Fecha 1",
    "Tipo 1",
    "Fecha 2",
    "Tipo 2",
    "Fecha 3",
    "Tipo 3",
    "Fecha 4",
    "Tipo 4",
    "Fecha 5",
    "Tipo 5",
    "Fecha 6",
    "Tipo 6",
    "Responsable",
  ];

  const filas = data.map((r) => [
    r.fn_num_instalacion || "",
    r.fd_fecha1?.split("T")[0] || "",
    r.fc_tipo1 || "",
    r.fd_fecha2?.split("T")[0] || "",
    r.fc_tipo2 || "",
    r.fd_fecha3?.split("T")[0] || "",
    r.fc_tipo3 || "",
    r.fd_fecha4?.split("T")[0] || "",
    r.fc_tipo4 || "",
    r.fd_fecha5?.split("T")[0] || "",
    r.fc_tipo5 || "",
    r.fd_fecha6?.split("T")[0] || "",
    r.fc_tipo6 || "",
    r.fc_responsable || "",
  ]);

  autoTable(doc, {
    startY: 40,
    head: [columnas],
    body: filas,
    styles: {
      fontSize: 8,
      halign: "center",
      valign: "middle",
      cellPadding: 1.5,
    },
    headStyles: {
      fillColor: [0, 82, 155],
      textColor: 255,
      fontStyle: "bold",
    },
    theme: "grid",
  });

  let y = doc.lastAutoTable.finalY + 8;

  // Pie de página
  doc.setFontSize(8);
  doc.setTextColor(255, 0, 0);
  doc.text(
    "IMPORTANTE: No. Instalación (Estanque, Pila, Liner y su número), Fecha (DD/MM/AAAA), Tipo: (Total, Parcial o Recirculación)",
    10,
    y
  );

  doc.setTextColor(0);
  y += 10;
  doc.text("Departamento: Operaciones", 10, y);
  doc.text("Aprobó: Juan Carlos Jiménez Ara", 70, y);
  y += 8;
  doc.text("Rev. 07/08/2024", 10, y);
  doc.text("Page 1 of 1", 270, y, { align: "right" });

  // Guardar
  const fecha = new Date().toLocaleDateString("es-MX");
  doc.save(`Registro_Recambios_${getLabel(form.ubicacion)}_${fecha}.pdf`);
};

  const gruposUbicacion = getGroups(data);

  const renderTablaRecambios = (rows) => (
    <Paper sx={{ width: "100%" }}>
      <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
        <Table sx={{ minWidth: 920 }}>
        <TableHead sx={{ background: "#E3F2FD" }}>
          <TableRow>
            <TableCell>Mes</TableCell>
            <TableCell>Instalación</TableCell>
            <TableCell>Fechas y Tipos</TableCell>
            <TableCell>Responsable</TableCell>
            <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.fi_id}>
              <TableCell>{r.fc_mes}</TableCell>
              <TableCell>{r.fn_num_instalacion}</TableCell>
              <TableCell>
                {[1, 2, 3, 4, 5, 6]
                  .map((n) =>
                    r[`fd_fecha${n}`]
                      ? `${r[`fd_fecha${n}`]?.split("T")[0]} (${r[`fc_tipo${n}`]})`
                      : null
                  )
                  .filter(Boolean)
                  .join(", ")}
              </TableCell>
              <TableCell>{r.fc_responsable}</TableCell>
              <TableCell
                align="center"
                sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
              >
                <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="warning"
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
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Recambios de Trampas
      </Typography>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
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
                {ubicacionesGranja.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Mes"
                type="month"
                name="fc_mes"
                InputLabelProps={{ shrink: true }}
                value={form.fc_mes}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_mes}
                helperText={errors.fc_mes}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="No. Instalación"
                name="fn_num_instalacion"
                type="number"
                value={form.fn_num_instalacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_num_instalacion}
                helperText={errors.fn_num_instalacion}
              />
            </Grid>

            {[1, 2, 3, 4, 5, 6].map((n) => (
              <React.Fragment key={n}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Fecha ${n}`}
                    type="date"
                    name={`fd_fecha${n}`}
                    InputLabelProps={{ shrink: true }}
                    value={form[`fd_fecha${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`fd_fecha${n}`]}
                    helperText={errors[`fd_fecha${n}`]}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    label={`Tipo ${n}`}
                    name={`fc_tipo${n}`}
                    value={form[`fc_tipo${n}`] || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors[`fc_tipo${n}`]}
                    helperText={errors[`fc_tipo${n}`]}
                  />
                </Grid>
              </React.Fragment>
            ))}

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Responsable"
                name="fc_responsable"
                value={form.fc_responsable}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_responsable}
                helperText={errors.fc_responsable}
              >
                <MenuItem value="">Selecciona un empleado</MenuItem>
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.fi_empleado_id} value={empleado.fc_nombre_completo}>
                    {empleado.fc_nombre_completo}
                  </MenuItem>
                ))}
                {form.fc_responsable && !empleados.some((e) => e.fc_nombre_completo === form.fc_responsable) && (
                  <MenuItem value={form.fc_responsable}>{form.fc_responsable}</MenuItem>
                )}
              </TextField>
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
      </FormularioRegistroPanel>

      {/* TABLAS POR UBICACIÓN */}
      {gruposUbicacion.map(({ value, label, rows }) => (
        <Accordion key={value} sx={{ mt: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{label}</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderTablaRecambios(rows)}</AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}

export default function BitacoraRecambios() {
  return <BitacoraRecambiosContent />;
}
