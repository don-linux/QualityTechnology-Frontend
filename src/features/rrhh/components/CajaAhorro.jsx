import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CleaningServices from "@mui/icons-material/CleaningServices";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import DeleteForever from "@mui/icons-material/DeleteForever";
import EventAvailable from "@mui/icons-material/EventAvailable";
import {
  listByGranja,
  createCategoria,
  updateCampo,
  removeRegistro,
  removeAllByGranja,
} from "../services/cajaAhorroService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useUbicacionesGranja from "@shared/hooks/useUbicacionesGranja";

export default function CajaAhorro() {
  const showSnackbar = useSnackbar();
  const { ubicacionesGranja, defaultUbicacion } = useUbicacionesGranja();
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [granja, setGranja] = useState("");
  const [openNuevo, setOpenNuevo] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");

  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = ["nuevaCategoria"];

  /* =========================================================
      Obtener datos por granja
     ========================================================= */
  const obtenerDatos = useCallback(async () => {
    if (!granja) return;
    try {
      const res = await listByGranja(granja);
      setRegistros(res.data);
    } catch (err) {
      console.error(" Error al cargar caja de ahorro:", err);
    }
  }, [granja]);

  useEffect(() => {
    if (!granja && defaultUbicacion) {
      setGranja(defaultUbicacion);
      return;
    }

    if (!granja) return;
    obtenerDatos();
  }, [defaultUbicacion, granja, obtenerDatos]);

  /* =========================================================
      Buscar categoría
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
      Crear nueva categoría
     ========================================================= */
  const crearRegistro = async () => {
    clearErrors();
    setNuevaCategoria("");
    setOpenNuevo(true);
  };

  const guardarNuevaCategoria = async () => {
    if (!validate({ nuevaCategoria }, requiredFields)) return;
    try {
      await createCategoria({ categoria: nuevaCategoria.trim(), granja });
      setOpenNuevo(false);
      obtenerDatos();
    } catch (err) {
      showSnackbar(" Error al crear categoría.", "error");
    }
  };

  /* =========================================================
      Actualizar campo
     ========================================================= */
  const actualizarCampo = async (id, campo, valor) => {
    try {
      await updateCampo(id, { [campo]: valor });
      obtenerDatos();
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  /* =========================================================
      Eliminar registro
     ========================================================= */
  const eliminarRegistro = async (id) => {
    if (!await confirm("¿Eliminar esta categoría?")) return;
    await removeRegistro(id);
    obtenerDatos();
  };

  /* =========================================================
      Eliminar todo por granja
     ========================================================= */
  const eliminarTodo = async () => {
    if (!await confirm(` Eliminar TODOS los registros de ${granja}?`)) return;
    await removeAllByGranja(granja);
    obtenerDatos();
  };

  /* =========================================================
      Meses
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
      Calcular totales por mes y total general
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

      {/*  Selector de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {ubicacionesGranja.map((op) => (
          <Button
            key={op.value}
            variant={granja === op.value ? "contained" : "outlined"}
            color="primary"
            onClick={() => setGranja(op.value)}
          >
            {op.label}
          </Button>
        ))}
      </Box>

      {/*  Barra de acciones */}
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

      <Dialog open={openNuevo} onClose={() => setOpenNuevo(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nueva categoría</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Nombre de la categoría"
            value={nuevaCategoria}
            onChange={(e) => {
              clearFieldError("nuevaCategoria");
              setNuevaCategoria(e.target.value);
            }}
            fullWidth
            error={!!errors.nuevaCategoria}
            helperText={errors.nuevaCategoria}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenNuevo(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarNuevaCategoria}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/*  Tabla principal */}
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
                      onChange={(e) => {
                        const valor = e.target.value;
                        setRegistros((prev) =>
                          prev.map((item) =>
                            item.id === r.id ? { ...item, [mes]: valor } : item
                          )
                        );
                      }}
                      onBlur={(e) =>
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

            {/*  Fila de totales generales (sticky footer) */}
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
      {ConfirmModal}
    </Box>
  );
}
