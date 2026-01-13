import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";

export default function Pileta() {
  return <PiletaContent />;
}

function PiletaContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
    nombre_instalacion: "",
    cantidad: "",
    talla_gr: "",
    no_lote: "",
    observacion: "",
    fecha_siembra: "",
    fecha_ultima_biometria: "",
  });

  const [piletas, setPiletas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const obtenerPiletas = async () => {
    if (!usuario_id) {
      setMensaje("⚠️ Debes iniciar sesión nuevamente.");
      return;
    }
    try {
      const data = await apiFetch(`/piletas/${usuario_id}`);
      setPiletas(data);
      setMensaje("✅ Piletas cargadas correctamente.");
    } catch (error) {
      console.error("❌ Error al obtener piletas:", error);
      setMensaje("Error al obtener piletas del servidor");
    }
  };

  useEffect(() => {
    obtenerPiletas();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      nombre_instalacion: "",
      cantidad: "",
      talla_gr: "",
      no_lote: "",
      observacion: "",
      fecha_siembra: "",
      fecha_ultima_biometria: "",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  const registrarPileta = async () => {
    try {
      await apiFetch("/piletas", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
        }),
      });

      setMensaje("✅ Pileta registrada correctamente");
      limpiarFormulario();
      obtenerPiletas();
    } catch (error) {
      console.error("❌ Error al registrar la pileta:", error);
      setMensaje("Error al registrar la pileta");
    }
  };

  const actualizarPileta = async () => {
    if (!seleccionado) return;

    try {
      await apiFetch(`/piletas/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setMensaje("✅ Pileta actualizada correctamente");
      limpiarFormulario();
      obtenerPiletas();
    } catch (error) {
      console.error("❌ Error al actualizar la pileta:", error);
      setMensaje("Error al actualizar la pileta");
    }
  };

  const eliminarPileta = async () => {
    if (!seleccionado) return;

    try {
      await apiFetch(`/piletas/${seleccionado}`, { method: "DELETE" });

      setMensaje("🗑️ Pileta eliminada correctamente");
      limpiarFormulario();
      obtenerPiletas();
    } catch (error) {
      console.error("❌ Error al eliminar la pileta:", error);
      setMensaje("Error al eliminar la pileta");
    }
  };

  const seleccionarPileta = (p) => {
    setSeleccionado(p.fi_pileta_id);
    setForm({
      nombre_instalacion: p.nombre_instalacion,
      cantidad: p.cantidad,
      talla_gr: p.talla_gr,
      no_lote: p.no_lote,
      observacion: p.observacion,
      fecha_siembra: p.fecha_siembra ? p.fecha_siembra.substring(0, 10) : "",
      fecha_ultima_biometria: p.fecha_ultima_biometria
        ? p.fecha_ultima_biometria.substring(0, 10)
        : "",
    });
    setMostrarFormulario(true);
  };

  // 🎨 Lógica de color según la observación
  const getRowColor = (observacion) => {
    if (observacion.toLowerCase().includes("hormonado")) {
      return { backgroundColor: "#FFEB3B" }; // Color amarillo
    } else if (observacion.toLowerCase().includes("tratamiento")) {
      return { backgroundColor: "#f07ea0", color: "white" }; // Color marino
    }
    return {};
  };

  // 🎨 Semáforo clásico solo para "Días Transcurridos": verde, amarillo, rojo
  const getBadgeStyle = (dias) => {
    if (dias <= 60) {
      return {
        backgroundColor: "#4CAF50", // verde
        color: "white",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "6px 12px",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(76,175,80,0.5)",
      };
    } else if (dias <= 100) {
      return {
        backgroundColor: "#FFC107", // amarillo
        color: "#333",
        fontWeight: "bold",
        borderRadius: "12px",
        padding: "6px 12px",
        display: "inline-block",
        boxShadow: "0 0 6px rgba(255,193,7,0.4)",
      };
    } else {
      return {
        backgroundColor: "#F44336", // rojo
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
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#004C7D">
        🐟 Control de Alevinaje
      </Typography>

      <Button
        variant="contained"
        color="success"
        onClick={() => setMostrarFormulario(true)}
        sx={{ backgroundColor: "#32CD32" }}
      >
        Registrar Nueva Pileta
      </Button>

      {mostrarFormulario && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Instalación"
                  name="nombre_instalacion"
                  value={form.nombre_instalacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Cantidad"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="Talla (Gr)"
                  name="talla_gr"
                  value={form.talla_gr}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label="No. Lote"
                  name="no_lote"
                  value={form.no_lote}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label="Observación"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Fecha Siembra"
                  name="fecha_siembra"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_siembra}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  type="date"
                  label="Fecha Última Biometría"
                  name="fecha_ultima_biometria"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_ultima_biometria}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={registrarPileta}
                sx={{ backgroundColor: "#32CD32" }}
              >
                REGISTRAR
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={actualizarPileta}
                disabled={!seleccionado}
              >
                ACTUALIZAR
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                onClick={eliminarPileta}
                disabled={!seleccionado}
              >
                ELIMINAR
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={limpiarFormulario}
              >
                CERRAR
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {mensaje && (
        <Typography color={mensaje.includes("Error") ? "error" : "green"} mb={2}>
          {mensaje}
        </Typography>
      )}

      <Paper
        sx={{
          mt: 3,
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
            Lista de Piletas
          </Typography>
        </Box>

        <Table
          stickyHeader
          sx={{
            minWidth: 1100,
            "& th": {
              backgroundColor: "rgba(0, 188, 212, 0.15)",
              color: "#004C7D",
              fontWeight: "bold",
              textAlign: "center",
            },
            "& td": {
              textAlign: "center",
              borderBottom: "1px solid #e0e0e0",
            },
            "& tr:hover": {
              backgroundColor: "rgba(0, 188, 212, 0.05)",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Instalación</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>No. Lote</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Fecha Siembra</TableCell>
              <TableCell>Fecha Última Biometría</TableCell>
              <TableCell>Días en Pila</TableCell>
              <TableCell>Días Transcurridos</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {piletas.map((p) => (
              <TableRow key={p.fi_pileta_id} style={getRowColor(p.observacion)}>
                <TableCell>{p.fi_pileta_id}</TableCell>
                <TableCell>{p.nombre_instalacion}</TableCell>
                <TableCell>{p.cantidad}</TableCell>
                <TableCell>{p.talla_gr}</TableCell>
                <TableCell>{p.no_lote}</TableCell>
                <TableCell>{p.observacion}</TableCell>
                <TableCell>{p.fecha_siembra}</TableCell>
                <TableCell>{p.fecha_ultima_biometria}</TableCell>
                <TableCell>{p.dias_en_pila}</TableCell>

                <TableCell>
                  <span style={getBadgeStyle(p.dias_transcurridos)}>{p.dias_transcurridos}</span>
                </TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => seleccionarPileta(p)}
                  >
                    Seleccionar
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
