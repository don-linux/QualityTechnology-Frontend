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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuItem from "@mui/material/MenuItem";
import {
  listMedicamentos,
  listEmpleadosMedicamentos,
  createMedicamento,
  updateMedicamento,
  removeMedicamento,
  removeAllMedicamentos,
} from "../services/bitacorasService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import useAuth from "@app/providers/AuthProvider";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const MAX_FC_DIAGNOSIS = 500;
const MAX_FC_TRATAMIENTO = 500;
const MAX_FC_DOSIS = 100;

function BitacoraMedicamentosContent() {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion, getLabel, getLogo, getGroups } = useUbicacionesGranja();
  const [form, setForm] = useState({
    fd_fecha_hora: "",
    fn_num_estanque: "",
    fc_diagnosis: "",
    fc_tratamiento: "",
    fc_dosis: "",
    fc_forma_aplicacion: "",
    fd_fecha_ultima_dosis: "",
    fc_responsable: "",
    ubicacion: "",
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
    "fd_fecha_hora", "fn_num_estanque", "fc_diagnosis", "fc_tratamiento",
    "fc_dosis", "fc_forma_aplicacion", "fd_fecha_ultima_dosis", "fc_responsable",
  ];

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarDatos = async () => {
    try {
      const res = await listMedicamentos();
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    }
  };

  const cargarEmpleados = async () => {
    try {
      const res = await listEmpleadosMedicamentos();
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

  //  Guardar / Actualizar
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId)
        await updateMedicamento(editId, form);
      else await createMedicamento(form);

      setEditId(null);
      cerrarFormulario();
      setForm({
        fd_fecha_hora: "",
        fn_num_estanque: "",
        fc_diagnosis: "",
        fc_tratamiento: "",
        fc_dosis: "",
        fc_forma_aplicacion: "",
        fd_fecha_ultima_dosis: "",
        fc_responsable: "",
        ubicacion: form.ubicacion,
        fi_usuario_id: usuarioId,
      });
      cargarDatos();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al guardar registro.";
      showSnackbar(msg, "error");
    }
  };

  //  Editar
  const editar = (r) => {
    clearErrors();
    setEditId(r.fi_id);
    setForm({
      fd_fecha_hora: r.fd_fecha_hora?.split("T")[0],
      fn_num_estanque: r.fn_num_estanque ?? "",
      fc_diagnosis: r.fc_diagnosis || "",
      fc_tratamiento: r.fc_tratamiento || "",
      fc_dosis: r.fc_dosis || "",
      fc_forma_aplicacion: r.fc_forma_aplicacion || "",
      fd_fecha_ultima_dosis: r.fd_fecha_ultima_dosis?.split("T")[0],
      fc_responsable: r.fc_responsable || "",
      ubicacion: r.ubicacion || "",
      fi_usuario_id: r.fi_usuario_id || usuarioId,
    });
    
    window.scrollTo({ top: 0, behavior: "smooth" });
    abrirFormulario();
  };

  //  Eliminar uno
  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await removeMedicamento(id);
    cargarDatos();
  };

  //  Eliminar todos
  const eliminarTodos = async () => {
    if (!await confirm(" ¿Eliminar todos los registros? Esta acción no se puede deshacer.")) return;
    await removeAllMedicamentos();
    cargarDatos();
  };

  //  Exportar PDF
  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("l", "mm", "a4");
    const logo = getLogo(form.ubicacion);

    try {
      doc.addImage(logo, "PNG", 10, 8, 25, 25);
    } catch {
      // Logo is optional for exported PDFs.
    }
    doc.setFontSize(14);
    doc.text(`Bitácora de Medicamentos - ${getLabel(form.ubicacion)}`, 45, 20);
    doc.setFontSize(10);
    doc.text("Registro de tratamientos, dosis y responsables", 45, 26);

    const columnas = [
      "Fecha",
      "Estanque",
      "Diagnóstico",
      "Tratamiento",
      "Dosis",
      "Forma Aplicación",
      "Última Dosis",
      "Responsable",
    ];

    const filas = data.map((r) => [
      r.fd_fecha_hora?.split("T")[0],
      r.fn_num_estanque,
      r.fc_diagnosis,
      r.fc_tratamiento,
      r.fc_dosis,
      r.fc_forma_aplicacion,
      r.fd_fecha_ultima_dosis?.split("T")[0],
      r.fc_responsable,
    ]);

    autoTable(doc, {
      startY: 40,
      head: [columnas],
      body: filas,
      styles: { fontSize: 7, cellWidth: "wrap" },
      headStyles: {
        fillColor: [255, 167, 38], // naranja Medellín
        textColor: 255,
        halign: "center",
      },
    });

    const fecha = new Date().toLocaleDateString();
    doc.text(`Fecha de generación: ${fecha}`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`Bitacora_Medicamentos_${getLabel(form.ubicacion)}_${fecha}.pdf`);
  };

  const gruposUbicacion = getGroups(data);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>Aplicación de Medicamentos</Typography>

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
              <TextField label="Fecha" type="date" name="fd_fecha_hora" InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_hora} onChange={handleChange} fullWidth error={!!errors.fd_fecha_hora} helperText={errors.fd_fecha_hora} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Estanque" name="fn_num_estanque"
                type="number" inputProps={{ min: 0, step: 1 }}
                value={form.fn_num_estanque} onChange={handleChange} fullWidth error={!!errors.fn_num_estanque} helperText={errors.fn_num_estanque} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Diagnóstico"
                name="fc_diagnosis"
                value={form.fc_diagnosis}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_diagnosis}
                helperText={errors.fc_diagnosis || `${form.fc_diagnosis.length}/${MAX_FC_DIAGNOSIS}`}
                inputProps={{ maxLength: MAX_FC_DIAGNOSIS }}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label="Tratamiento"
                name="fc_tratamiento"
                value={form.fc_tratamiento}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
                error={!!errors.fc_tratamiento}
                helperText={errors.fc_tratamiento || `${form.fc_tratamiento.length}/${MAX_FC_TRATAMIENTO}`}
                inputProps={{ maxLength: MAX_FC_TRATAMIENTO }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Dosis"
                name="fc_dosis"
                value={form.fc_dosis}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_dosis}
                helperText={errors.fc_dosis || `${String(form.fc_dosis).length}/${MAX_FC_DOSIS}`}
                inputProps={{ maxLength: MAX_FC_DOSIS }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Forma Aplicación" name="fc_forma_aplicacion"
                value={form.fc_forma_aplicacion} onChange={handleChange} fullWidth error={!!errors.fc_forma_aplicacion} helperText={errors.fc_forma_aplicacion} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField label="Última Dosis" type="date" name="fd_fecha_ultima_dosis"
                InputLabelProps={{ shrink: true }}
                value={form.fd_fecha_ultima_dosis} onChange={handleChange} fullWidth error={!!errors.fd_fecha_ultima_dosis} helperText={errors.fd_fecha_ultima_dosis} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
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

          {/* BOTONES */}
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
        <Accordion key={value}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{label} ({rows.length})</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper sx={{ width: "100%" }}>
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1240 }}>
                <TableHead sx={{ background: "#FFF3E0" }}>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Estanque</TableCell>
                    <TableCell>Diagnóstico</TableCell>
                    <TableCell>Tratamiento</TableCell>
                    <TableCell>Dosis</TableCell>
                    <TableCell>Forma Aplicación</TableCell>
                    <TableCell>Última Dosis</TableCell>
                    <TableCell>Responsable</TableCell>
                    <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.fi_id}>
                      <TableCell>{r.fd_fecha_hora?.split("T")[0]}</TableCell>
                      <TableCell>{r.fn_num_estanque}</TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <span title={r.fc_diagnosis}>{truncar(r.fc_diagnosis)}</span>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <span title={r.fc_tratamiento}>{truncar(r.fc_tratamiento)}</span>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <span title={r.fc_dosis}>{truncar(r.fc_dosis)}</span>
                      </TableCell>
                      <TableCell>{r.fc_forma_aplicacion}</TableCell>
                      <TableCell>{r.fd_fecha_ultima_dosis?.split("T")[0]}</TableCell>
                      <TableCell sx={{ maxWidth: 160 }}>
                        <span title={r.fc_responsable}>{truncar(r.fc_responsable)}</span>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                      >
                        <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                          <Button size="small" color="warning" variant="contained" onClick={() => editar(r)}>
                            Editar
                          </Button>
                          <Button size="small" color="error" variant="contained" onClick={() => eliminar(r.fi_id)}>
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
          </AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}

export default function BitacoraMedicamentos() {
  return <BitacoraMedicamentosContent />;
}
