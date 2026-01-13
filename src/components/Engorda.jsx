import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Box,
} from "@mui/material";
import { Add, Edit, Delete, Clear } from "@mui/icons-material";
import { apiFetch } from "../utils/api";

export default function Engorda() {
  return <EngordaContent />;
}

function EngordaContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
    instalacion: "",
    cantidad: "",
    talla_gr: "",
    no_lote: "",
    observacion: "",
    fecha_siembra: "",
    fecha_biometria: "",
    particula_mm: "",
    fi_usuario_id: usuario_id,
  });

  const [engorda, setEngorda] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [accion, setAccion] = useState("");

  const obtenerEngorda = async () => {
    try {
      const data = await apiFetch(`/engorda/${usuario_id}`);
      setEngorda(data);
    } catch (error) {
      console.error("❌ Error al obtener engorda:", error);
      setMensaje("Error al obtener registros de engorda");
    }
  };

  useEffect(() => {
    if (usuario_id) obtenerEngorda();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      instalacion: "",
      cantidad: "",
      talla_gr: "",
      no_lote: "",
      observacion: "",
      fecha_siembra: "",
      fecha_biometria: "",
      particula_mm: "",
      fi_usuario_id: usuario_id,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    setAccion("");
  };

  const registrarEngorda = async () => {
    try {
      await apiFetch("/engorda", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMensaje("✅ Registro de engorda agregado correctamente");
      limpiarFormulario();
      obtenerEngorda();
    } catch (error) {
      console.error("❌ Error al registrar engorda:", error);
      setMensaje("Error al registrar engorda");
    }
  };

  const actualizarEngorda = async () => {
    if (!seleccionado) return alert("Selecciona un registro para actualizar");

    try {
      await apiFetch(`/engorda/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setMensaje("✅ Registro de engorda actualizado correctamente");
      limpiarFormulario();
      obtenerEngorda();
    } catch (error) {
      console.error("❌ Error al actualizar engorda:", error);
      setMensaje("Error al actualizar engorda");
    }
  };

  const eliminarEngorda = async () => {
    if (!seleccionado) return;
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;

    try {
      await apiFetch(`/engorda/${seleccionado}`, { method: "DELETE" });

      setMensaje("🗑️ Registro eliminado correctamente");
      limpiarFormulario();
      obtenerEngorda();
    } catch (error) {
      console.error("❌ Error al eliminar engorda:", error);
      setMensaje("Error al eliminar engorda");
    }
  };

  const seleccionarEngorda = (item) => {
    setSeleccionado(item.fi_engorda_id);

    setForm({
      instalacion: item.instalacion,
      cantidad: item.cantidad,
      talla_gr: item.talla_gr,
      no_lote: item.no_lote,
      observacion: item.observacion,
      fecha_siembra: item.fecha_siembra?.substring(0, 10) || "",
      fecha_biometria: item.fecha_biometria?.substring(0, 10) || "",
      particula_mm: item.particula_mm,
      fi_usuario_id: usuario_id,
    });
    setMostrarFormulario(true);
    setAccion("actualizar");
  };

  const totalCantidad = engorda.reduce(
    (sum, e) => sum + Number(e.cantidad || 0),
    0
  );

  // 🎨 Semáforo visual (verde, amarillo, rojo)
  const getBadgeStyle = (dias) => {
    if (dias <= 60) {
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
    <Container maxWidth="md" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        🐟 Módulo de Engorda
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

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <Card sx={{ borderRadius: 3, boxShadow: 3, marginBottom: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Instalación"
                  name="instalacion"
                  value={form.instalacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Cantidad"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Talla (gr)"
                  name="talla_gr"
                  value={form.talla_gr}
                  onChange={handleChange}
                  type="number"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="No. Lote"
                  name="no_lote"
                  value={form.no_lote}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Observación"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha de Siembra"
                  name="fecha_siembra"
                  type="date"
                  value={form.fecha_siembra}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Fecha Biometría"
                  name="fecha_biometria"
                  type="date"
                  value={form.fecha_biometria}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Partícula (mm)"
                  name="particula_mm"
                  value={form.particula_mm}
                  onChange={handleChange}
                  fullWidth
                  type="number"
                />
              </Grid>
            </Grid>
          </CardContent>

          <Stack direction="row" spacing={2} sx={{ padding: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={accion === "registrar" ? registrarEngorda : actualizarEngorda}
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
                onClick={eliminarEngorda}
                sx={{
                  backgroundColor: "#FF5733",
                  "&:hover": { backgroundColor: "#FF3D00" },
                }}
              >
                <Delete /> Eliminar
              </Button>
            )}

            <Button variant="outlined" onClick={limpiarFormulario}>
              <Clear /> Limpiar
            </Button>
          </Stack>
        </Card>
      )}

      {/* TABLA MEJORADA */}
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
            Registros de Engorda
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
              <TableCell>Talla (gr)</TableCell>
              <TableCell>No. Lote</TableCell>
              <TableCell>Partícula (mm)</TableCell>
              <TableCell>Días en Pila</TableCell>
              <TableCell>Días Transcurridos</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {engorda.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No hay registros
                </TableCell>
              </TableRow>
            ) : (
              engorda.map((item) => (
                <TableRow key={item.fi_engorda_id}>
                  <TableCell>{item.fi_engorda_id}</TableCell>
                  <TableCell>{item.instalacion}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{item.talla_gr}</TableCell>
                  <TableCell>{item.no_lote}</TableCell>
                  <TableCell>{item.particula_mm}</TableCell>
                  <TableCell>
                    <span style={getBadgeStyle(item.dias_en_pila)}>
                      {item.dias_en_pila}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span style={getBadgeStyle(item.dias_transcurridos)}>
                      {item.dias_transcurridos}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => seleccionarEngorda(item)}
                      sx={{
                        color: "#00695C",
                        borderColor: "#00695C",
                        "&:hover": { backgroundColor: "rgba(0,105,92,0.1)" },
                      }}
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}

            <TableRow sx={{ backgroundColor: "#E8F5E9" }}>
              <TableCell
                colSpan={2}
                align="right"
                sx={{ fontWeight: "bold" }}
              >
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
