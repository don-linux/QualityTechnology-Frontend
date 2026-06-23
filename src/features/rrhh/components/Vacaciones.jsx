import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CampoNumerico from "@shared/components/CampoNumerico";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CleaningServices from "@mui/icons-material/CleaningServices";
import EventAvailable from "@mui/icons-material/EventAvailable";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import {
  listVacaciones,
  createVacaciones,
  updateVacaciones,
} from "../services/vacacionesService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

export default function Vacaciones() {
  const showSnackbar = useSnackbar();
  const [vacaciones, setVacaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [tempData, setTempData] = useState({});
  const [openNuevo, setOpenNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({
    nombre: "",
    idEmpleado: "",
    departamento: "General",
    inicio: "2025-01-01",
    fin: "2025-12-31",
  });

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  const requiredFields = ["nombre", "idEmpleado", "departamento", "inicio", "fin"];

  const obtenerDatos = async () => {
    try {
      const res = await listVacaciones();
      setVacaciones(res.data);
    } catch (err) {
      console.error("Error al cargar vacaciones:", err);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, []);

  const buscarEmpleado = () => {
    if (busqueda.trim() === "") obtenerDatos();
    else {
      const filtrado = vacaciones.filter((v) =>
        v.fc_nombre_empleado.toLowerCase().includes(busqueda.toLowerCase())
      );
      setVacaciones(filtrado);
    }
  };

  const crearRegistro = () => {
    clearErrors();
    setNuevoForm({
      nombre: "",
      idEmpleado: "",
      departamento: "General",
      inicio: "2025-01-01",
      fin: "2025-12-31",
    });
    setOpenNuevo(true);
  };

  const guardarNuevo = async () => {
    if (!validate(nuevoForm, requiredFields)) return;
    const idEmpleado = Number(nuevoForm.idEmpleado);
    if (Number.isNaN(idEmpleado)) {
      showSnackbar("El ID del empleado debe ser numérico.", "success");
      return;
    }

    try {
      await createVacaciones({
        fc_nombre_empleado: nuevoForm.nombre.trim(),
        fi_empleado_id: idEmpleado,
        fc_departamento: nuevoForm.departamento || "General",
        fd_inicio_periodo: nuevoForm.inicio,
        fd_fin_periodo: nuevoForm.fin,
      });
      setOpenNuevo(false);
      obtenerDatos();
    } catch (err) {
      showSnackbar(" Error al crear registro.", "error");
    }
  };

  const handleChange = (campo, value) => {
    setTempData({ ...tempData, [campo]: parseFloat(value) || 0 });
  };

  const guardarCambios = async () => {
    try {
      await updateVacaciones(editandoId, tempData);
      setEditandoId(null);
      setTempData({});
      obtenerDatos();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTempData({});
  };

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          color: "#0d47a1",
        }}
      >
        <EventAvailable sx={{ mr: 1, color: "#1565c0" }} />
        Control de Vacaciones y Ausencias
      </Typography>

      <Paper sx={{ p: 2, mb: 3, background: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              label="Buscar por nombre"
              variant="outlined"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: 250 }}
            />
          </Grid>
          <Grid>
            <Button variant="contained" onClick={buscarEmpleado}>
              BUSCAR
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<CleaningServices />}
              onClick={() => {
                setBusqueda("");
                obtenerDatos();
              }}
            >
              LIMPIAR
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="success"
              startIcon={<Add />}
              onClick={crearRegistro}
            >
              NUEVO
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ======= Tabla tipo Excel ======= */}
      <Dialog open={openNuevo} onClose={() => setOpenNuevo(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo registro</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Nombre del empleado"
                value={nuevoForm.nombre}
                onChange={(e) => {
                  clearFieldError("nombre");
                  setNuevoForm({ ...nuevoForm, nombre: e.target.value });
                }}
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CampoNumerico
                label="ID del empleado"
                decimalScale={0}
                value={nuevoForm.idEmpleado}
                onChange={(e) => {
                  clearFieldError("idEmpleado");
                  setNuevoForm({ ...nuevoForm, idEmpleado: e.target.value });
                }}
                fullWidth
                error={!!errors.idEmpleado}
                helperText={errors.idEmpleado}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Departamento"
                value={nuevoForm.departamento}
                onChange={(e) => {
                  clearFieldError("departamento");
                  setNuevoForm({ ...nuevoForm, departamento: e.target.value });
                }}
                fullWidth
                error={!!errors.departamento}
                helperText={errors.departamento}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha inicio"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={nuevoForm.inicio}
                onChange={(e) => {
                  clearFieldError("inicio");
                  setNuevoForm({ ...nuevoForm, inicio: e.target.value });
                }}
                fullWidth
                error={!!errors.inicio}
                helperText={errors.inicio}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Fecha fin"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={nuevoForm.fin}
                onChange={(e) => {
                  clearFieldError("fin");
                  setNuevoForm({ ...nuevoForm, fin: e.target.value });
                }}
                fullWidth
                error={!!errors.fin}
                helperText={errors.fin}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenNuevo(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarNuevo}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1565c0" }}>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  borderRight: "1px solid #ffffff33",
                }}
              >
                ID
              </TableCell>
              {[
                "Nombre empleado",
                "ID Empleado",
                "Inicio",
                "Fin",
                "Departamento",
                "Días trabajados",
                "Vacaciones (V)",
                "Enfermedad (E)",
                "Maternidad (M)",
                "Permisos Parcial (PP)",
                "Permisos Total (PT)",
                "Inasistencias (I)",
                "Vac./Año",
                "Acumulados",
                "Disponibles",
                "Disfrutadas",
                "Acciones",
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    borderRight: "1px solid #ffffff33",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {ordenarYNumerar(vacaciones, ["fi_vacacion_id", "vacacion_id"]).map((v, i) => {
              const isEditing = editandoId === v.fi_vacacion_id;
              const data = isEditing ? tempData : v;

              const disponibles =
                (data.fn_vacaciones_anio || 0) +
                (data.fn_dias_previos || 0) -
                (data.fn_vacaciones_disfrutadas || 0);

              return (
                <TableRow
                  key={v.fi_vacacion_id}
                  sx={{
                    backgroundColor: isEditing
                      ? "#fff9c4"
                      : i % 2 === 0
                      ? "#f9f9f9"
                      : "#ffffff",
                    "&:hover": { backgroundColor: "#e3f2fd" },
                  }}
                >
                  {/* DATOS DEL EMPLEADO */}
                  <TableCell align="center">{v._num}</TableCell>
                  <TableCell sx={{ maxWidth: 180, whiteSpace: "normal" }}>
                    {v.fc_nombre_empleado}
                  </TableCell>
                  <TableCell align="center">{v.fi_empleado_id}</TableCell>
                  <TableCell align="center">
                    {v.fd_inicio_periodo?.slice(0, 10)}
                  </TableCell>
                  <TableCell align="center">
                    {v.fd_fin_periodo?.slice(0, 10)}
                  </TableCell>
                  <TableCell align="center">{v.fc_departamento}</TableCell>

                  {/* CAMPOS EDITABLES */}
                  {[
                    "fn_dias_trabajados",
                    "fn_vacaciones_v",
                    "fn_enfermedad_e",
                    "fn_maternidad_m",
                    "fn_permiso_parcial_pp",
                    "fn_permiso_total_pt",
                    "fn_inasistencias_i",
                    "fn_vacaciones_anio",
                    "fn_dias_previos",
                    "fn_vacaciones_disfrutadas",
                  ].map((campo) => (
                    <TableCell
                      key={campo}
                      align="center"
                      sx={
                        ["fn_vacaciones_anio", "fn_dias_previos"].includes(campo)
                          ? { background: "#e8f0fe", fontWeight: "bold" }
                          : ["fn_vacaciones_disfrutadas"].includes(campo)
                          ? {
                              background: "#ffcdd2",
                              color: "#b71c1c",
                              fontWeight: "bold",
                            }
                          : {}
                      }
                    >
                      {isEditing ? (
                        <CampoNumerico
                          decimalScale={0}
                          value={data[campo] ?? 0}
                          onChange={(e) =>
                            handleChange(campo, e.target.value)
                          }
                          inputProps={{
                            min: 0,
                            style: { textAlign: "center", width: 55 },
                          }}
                          variant="standard"
                        />
                      ) : (
                        data[campo]
                      )}
                    </TableCell>
                  ))}

                  {/* CÁLCULO AUTOMÁTICO */}
                  <TableCell
                    align="center"
                    sx={{
                      background: "#c8e6c9",
                      color: "#1b5e20",
                      fontWeight: "bold",
                    }}
                  >
                    {disponibles}
                  </TableCell>

                  {/* ACCIONES */}
                  <TableCell align="center">
                    {isEditing ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<Edit />}
                          onClick={guardarCambios}
                          sx={{ mr: 1 }}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          onClick={cancelarEdicion}
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => {
                            setEditandoId(v.fi_vacacion_id);
                            setTempData({ ...v });
                          }}
                          sx={{ mr: 1 }}
                        >
                          Editar
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
