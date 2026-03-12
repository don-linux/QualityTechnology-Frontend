import React, { useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";
import {
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
} from "@mui/material";
import {
  CleaningServices,
  EventAvailable,
  Delete,
  Add,
  DeleteForever,
  Edit,
} from "@mui/icons-material";
import axios from "../utils/axiosInstance.js";

const api = `${API_URL}/vacaciones`;

export default function Vacaciones() {
  const [vacaciones, setVacaciones] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [tempData, setTempData] = useState({});

  const obtenerDatos = async () => {
    try {
      const res = await axios.get(api);
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

  const crearRegistro = async () => {
    const nombre = prompt("Nombre del empleado:");
    if (!nombre) return;
    const idEmpleado = parseInt(prompt("ID del empleado (número):"), 10);
    const depto = prompt("Departamento:") || "General";
    const inicio = prompt("Fecha inicio (YYYY-MM-DD):", "2025-01-01");
    const fin = prompt("Fecha fin (YYYY-MM-DD):", "2025-12-31");

    try {
      await axios.post(api, {
        fc_nombre_empleado: nombre,
        fi_empleado_id: idEmpleado,
        fc_departamento: depto,
        fd_inicio_periodo: inicio,
        fd_fin_periodo: fin,
      });
      obtenerDatos();
    } catch (err) {
      alert(" Error al crear registro.");
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    await axios.delete(`${api}/${id}`);
    obtenerDatos();
  };

  const eliminarTodos = async () => {
    if (!window.confirm(" Eliminar TODOS los registros?")) return;
    await axios.delete(api);
    obtenerDatos();
  };

  const handleChange = (campo, value) => {
    setTempData({ ...tempData, [campo]: parseFloat(value) || 0 });
  };

  const guardarCambios = async () => {
    try {
      await axios.put(`${api}/${editandoId}`, tempData);
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
          <Grid>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForever />}
              onClick={eliminarTodos}
            >
              ELIMINAR TODO
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ======= Tabla tipo Excel ======= */}
      <TableContainer component={Paper} sx={{ border: "1px solid #ccc" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1565c0" }}>
              {[
                "Nombre empleado",
                "ID",
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
              ].map((col, i) => (
                <TableCell
                  key={i}
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
            {vacaciones.map((v, i) => {
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
                  ].map((campo, idx) => (
                    <TableCell
                      key={idx}
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
                        <TextField
                          type="number"
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
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => eliminarRegistro(v.fi_vacacion_id)}
                        >
                          Eliminar
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
