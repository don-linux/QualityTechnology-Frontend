import React, { useState, useEffect } from "react";
import {
  Container, Card, CardContent, Grid, TextField, Button,
  Typography, TableContainer, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, Stack, Box,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { apiFetch } from "../utils/api";

export default function Reproductores() {
  return <ReproductoresContent />;
}

function ReproductoresContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
    fc_instalacion: "",
    fn_cantidad: "",
    fn_talla: "",
    fn_no_lote: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_biometria: "",
    fi_usuario_id: usuario_id,
    fi_reproductor_id: null,
  });

  const [reproductores, setReproductores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [accion, setAccion] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (!usuario_id) {
        setMensaje("⚠️ Debes iniciar sesión para ver los registros.");
        return;
      }
      const res = await apiFetch(`/reproductores/${usuario_id}`);
      setReproductores(res);
      setMensaje("");
    } catch (error) {
      console.error("Error al cargar datos de reproductores:", error);
      setMensaje("❌ Error al obtener datos del servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      fc_instalacion: "",
      fn_cantidad: "",
      fn_talla: "",
      fn_no_lote: "",
      fc_observacion: "",
      fd_fecha_siembra: "",
      fd_fecha_biometria: "",
      fi_usuario_id: usuario_id,
      fi_reproductor_id: null,
    });
    setMensaje("");
    setMostrarFormulario(false);
    setAccion("");
  };

  const registrarReproductor = async () => {
    try {
      await apiFetch("/reproductores", {
        method: "POST",
        body: JSON.stringify({ ...form, fi_usuario_id: usuario_id }),
      });
      setMensaje("✅ Reproductor registrado correctamente");
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al registrar reproductor");
    }
  };

  const actualizarReproductor = async () => {
    if (!form.fi_reproductor_id)
      return alert("Selecciona un reproductor para actualizar");
    try {
      await apiFetch(`/reproductores/${form.fi_reproductor_id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMensaje("✅ Reproductor actualizado correctamente");
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al actualizar reproductor");
    }
  };

  const eliminarReproductor = async () => {
    if (!form.fi_reproductor_id)
      return alert("Selecciona un reproductor para eliminar");
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await apiFetch(`/reproductores/${form.fi_reproductor_id}`, {
        method: "DELETE",
      });
      setMensaje("✅ Reproductor eliminado correctamente");
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al eliminar reproductor");
    }
  };

  const handleEdit = (item) => {
    setForm({
      fc_instalacion: item.fc_instalacion,
      fn_cantidad: item.fn_cantidad,
      fn_talla: item.fn_talla,
      fn_no_lote: item.fn_no_lote,
      fc_observacion: item.fc_observacion,
      fd_fecha_siembra: item.fd_fecha_siembra,
      fd_fecha_biometria: item.fd_fecha_biometria,
      fi_usuario_id: item.fi_usuario_id,
      fi_reproductor_id: item.fi_reproductor_id,
    });
    setMostrarFormulario(true);
    setAccion("actualizar");
  };

  const totalCantidad = reproductores.reduce(
    (sum, r) => sum + Number(r.fn_cantidad || 0),
    0
  );

  // 🟢🟡🔴 estilo tipo badge solo para "Días Transcurridos"
  const getBadgeStyle = (dias) => {
    if (dias <= 50) {
      return {
        backgroundColor: "#4CAF50",
        color: "white",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "6px 12px",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(76,175,80,0.4)",
      };
    } else if (dias <= 100) {
      return {
        backgroundColor: "#FFC107",
        color: "#333",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "6px 12px",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(255,193,7,0.4)",
      };
    } else {
      return {
        backgroundColor: "#F44336",
        color: "white",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "6px 12px",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(244,67,54,0.4)",
      };
    }
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Typography variant="h4" align="center" sx={{ fontWeight: "bold" }}>
            🐟 Control de Reproductores
          </Typography>

          <Button
            variant="contained"
            color="success"
            onClick={() => {
              setMostrarFormulario(true);
              setAccion("registrar");
            }}
            sx={{
              backgroundColor: "#32CD32",
              "&:hover": { backgroundColor: "#28A745" },
            }}
          >
            <Add /> Registrar
          </Button>

          {mostrarFormulario && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Instalación"
                      name="fc_instalacion"
                      value={form.fc_instalacion}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Cantidad"
                      name="fn_cantidad"
                      value={form.fn_cantidad}
                      onChange={handleChange}
                      fullWidth
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Talla"
                      name="fn_talla"
                      value={form.fn_talla}
                      onChange={handleChange}
                      fullWidth
                      type="number"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="No Lote"
                      name="fn_no_lote"
                      value={form.fn_no_lote}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Observación"
                      name="fc_observacion"
                      value={form.fc_observacion}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Fecha de Siembra"
                      name="fd_fecha_siembra"
                      type="date"
                      value={form.fd_fecha_siembra}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Fecha Última Biometría"
                      name="fd_fecha_biometria"
                      type="date"
                      value={form.fd_fecha_biometria}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>

              <Stack direction="row" spacing={2} sx={{ padding: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={
                    accion === "registrar"
                      ? registrarReproductor
                      : actualizarReproductor
                  }
                  sx={{
                    backgroundColor: "#32CD32",
                    "&:hover": { backgroundColor: "#28A745" },
                  }}
                >
                  {accion === "registrar" ? <Add /> : <Edit />}{" "}
                  {accion === "registrar" ? "Registrar" : "Actualizar"}
                </Button>

                {accion === "actualizar" && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={eliminarReproductor}
                    sx={{
                      backgroundColor: "#FF5733",
                      "&:hover": { backgroundColor: "#FF3D00" },
                    }}
                  >
                    <Delete /> Eliminar
                  </Button>
                )}

                <Button variant="outlined" onClick={limpiarFormulario}>
                  Limpiar
                </Button>
              </Stack>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* 🌊 TABLA CON DISEÑO MEJORADO */}
      <Paper
        sx={{
          mt: 4,
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(90deg, #00BFA5 0%, #00ACC1 100%)",
            color: "white",
            py: 1.2,
            px: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Lista de Reproductores
          </Typography>
        </Box>

        <Table
          stickyHeader
          sx={{
            "& th": {
              backgroundColor: "rgba(0,188,212,0.15)",
              color: "#004C7D",
              fontWeight: "bold",
              textAlign: "center",
            },
            "& td": { textAlign: "center", borderBottom: "1px solid #e0e0e0" },
            "& tr:hover": { backgroundColor: "rgba(0,188,212,0.05)" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Instalación</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>No Lote</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Días en Pila</TableCell>
              <TableCell>Días Transcurridos</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reproductores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay registros
                </TableCell>
              </TableRow>
            ) : (
              reproductores.map((item) => (
                <TableRow key={item.fi_reproductor_id}>
                  <TableCell>{item.fi_reproductor_id}</TableCell>
                  <TableCell>{item.fc_instalacion}</TableCell>
                  <TableCell>{item.fn_cantidad}</TableCell>
                  <TableCell>{item.fn_talla}</TableCell>
                  <TableCell>{item.fn_no_lote}</TableCell>
                  <TableCell>{item.fc_observacion}</TableCell>

                  <TableCell>{item.dias_en_pila}</TableCell>

                  <TableCell>
                    <span style={getBadgeStyle(item.dias_transcurridos)}>
                      {item.dias_transcurridos}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(item)}
                      sx={{
                        color: "#00695C",
                        borderColor: "#00695C",
                        "&:hover": { backgroundColor: "rgba(0,105,92,0.1)" },
                      }}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}

            <TableRow sx={{ backgroundColor: "#E8F5E9" }}>
              <TableCell colSpan={2} align="right" sx={{ fontWeight: "bold" }}>
                TOTAL
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                {totalCantidad.toLocaleString()}
              </TableCell>
              <TableCell colSpan={6}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
