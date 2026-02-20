import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import {
  CleaningServices,
  Add,
  Delete,
  DeleteForever,
  EventAvailable,
} from "@mui/icons-material";
import axios from "axios";

const api = "http://localhost:5000/caja-ahorro";

export default function CajaAhorro() {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [granja, setGranja] = useState("Ceiba");

  /* =========================================================
     🟢 Obtener datos por granja
     ========================================================= */
  const obtenerDatos = useCallback(async () => {
    try {
      const res = await axios.get(`${api}/${granja}`);
      setRegistros(res.data);
    } catch (err) {
      console.error("❌ Error al cargar caja de ahorro:", err);
    }
  }, [granja]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  /* =========================================================
     🔍 Buscar categoría
     ========================================================= */
  const buscarCategoria = () => {
    if (busqueda.trim() === "") obtenerDatos();
    else {
      const filtrado = registros.filter((r) =>
        r.categoria.toLowerCase().includes(busqueda.toLowerCase())
      );
      setRegistros(filtrado);
    }
  };

  /* =========================================================
     ➕ Crear nueva categoría
     ========================================================= */
  const crearRegistro = async () => {
    const nombre = prompt("Nombre de la categoría:");
    if (!nombre) return;
    try {
      await axios.post(api, { categoria: nombre, granja });
      obtenerDatos();
    } catch (err) {
      alert("❌ Error al crear categoría.");
    }
  };

  /* =========================================================
     ✏️ Actualizar campo
     ========================================================= */
  const actualizarCampo = async (id, campo, valor) => {
    try {
      await axios.put(`${api}/${id}`, { [campo]: valor });
      obtenerDatos();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  /* =========================================================
     🗑️ Eliminar registro
     ========================================================= */
  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    await axios.delete(`${api}/${id}`);
    obtenerDatos();
  };

  /* =========================================================
     🧨 Eliminar todo por granja
     ========================================================= */
  const eliminarTodo = async () => {
    if (!window.confirm(`⚠️ Eliminar TODOS los registros de ${granja}?`)) return;
    await axios.delete(`${api}?granja=${granja}`);
    obtenerDatos();
  };

  /* =========================================================
     🧮 Meses
     ========================================================= */
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  /* =========================================================
     🧮 Calcular totales por mes y total general
     ========================================================= */
  const totales = {};
  let totalGeneral = 0;

  meses.forEach((mes) => {
    const suma = registros.reduce((acc, r) => acc + (parseFloat(r[mes]) || 0), 0);
    totales[mes] = suma;
    totalGeneral += suma;
  });

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
        Control de Caja de Ahorro (Mensual)
      </Typography>

      {/* 🔹 Selector de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant={granja === "Ceiba" ? "contained" : "outlined"}
          color="primary"
          onClick={() => setGranja("Ceiba")}
        >
          Ceiba
        </Button>
        <Button
          variant={granja === "Medellín" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setGranja("Medellín")}
        >
          Medellín
        </Button>
      </Box>

      {/* 🔹 Barra de acciones */}
      <Paper sx={{ p: 2, mb: 3, background: "#f8f9fa" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <TextField
              label="Buscar categoría"
              variant="outlined"
              size="small"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              sx={{ width: 250 }}
            />
          </Grid>
          <Grid>
            <Button variant="contained" onClick={buscarCategoria}>
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
              NUEVA CATEGORÍA
            </Button>
          </Grid>
          <Grid>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForever />}
              onClick={eliminarTodo}
            >
              ELIMINAR TODO
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 🔹 Tabla principal */}
         <TableContainer
          component={Paper}
          sx={{
            border: "1px solid #ccc",
            maxHeight: "70vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <Table size="small">
         <TableHead
            sx={{
              position: "sticky",
              top: 0,
              backgroundColor: "#1565c0",
              zIndex: 3,
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Categoría
              </TableCell>
              {meses.map((mes) => (
                <TableCell
                  key={mes}
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {mes.charAt(0).toUpperCase() + mes.slice(1)}
                </TableCell>
              ))}
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Total
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((r, i) => (
              <TableRow
                key={r.id}
                sx={{
                  backgroundColor: i % 2 === 0 ? "#f9f9f9" : "#ffffff",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <TableCell sx={{ fontWeight: "bold" }}>{r.categoria}</TableCell>

                {meses.map((mes) => (
                  <TableCell key={mes} align="center">
                    <TextField
                      type="number"
                      variant="standard"
                      value={r[mes] ?? 0}
                      onChange={(e) =>
                        actualizarCampo(r.id, mes, parseFloat(e.target.value) || 0)
                      }
                      inputProps={{
                        min: 0,
                        style: { textAlign: "center", width: 70 },
                      }}
                    />
                  </TableCell>
                ))}

                <TableCell
                  align="center"
                  sx={{
                    background: "#e8f0fe",
                    fontWeight: "bold",
                    color: "#0d47a1",
                  }}
                >
                  {r.total ?? 0}
                </TableCell>

                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => eliminarRegistro(r.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {/* 🔹 Fila de totales generales (sticky footer) */}
            <TableRow
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#0d47a1",
                color: "white",
                fontWeight: "bold",
                zIndex: 2,
              }}
            >
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                }}
              >
                TOTAL GENERAL
              </TableCell>

              {meses.map((mes) => (
                <TableCell
                  key={mes}
                  align="center"
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  {totales[mes].toFixed(2)}
                </TableCell>
              ))}

              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  backgroundColor: "#1565c0",
                }}
              >
                {totalGeneral.toFixed(2)}
              </TableCell>

              <TableCell sx={{ backgroundColor: "#0d47a1" }} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
