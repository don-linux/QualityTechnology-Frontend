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

export default function Instalaciones() {
  return <InstalacionesContent />;
}

function InstalacionesContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
    nombre_instalacion: "",
    largo: "",
    ancho: "",
    altura: "",
    material: "",
  });

  const [instalaciones, setInstalaciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [granja, setGranja] = useState("Medellin"); // 🌿 por defecto Medellín

  // 🔹 Obtener listado desde el backend (filtrado por granja)
  const obtenerInstalaciones = async (granjaSeleccionada = granja) => {
    try {
      const data = await apiFetch(`/instalaciones/granja/${granjaSeleccionada}`);
      setInstalaciones(data);
      setMensaje(`✅ Instalaciones de ${granjaSeleccionada} cargadas correctamente.`);
    } catch (error) {
      console.error("❌ Error al obtener instalaciones:", error);
      setMensaje("Error al obtener instalaciones del servidor");
      setInstalaciones([]);
    }
  };

  useEffect(() => {
    obtenerInstalaciones();
  }, [granja]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      nombre_instalacion: "",
      largo: "",
      ancho: "",
      altura: "",
      material: "",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  // 🔹 Registrar instalación (con granja activa)
  const registrarInstalacion = async () => {
    try {
      await apiFetch("/instalaciones", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: `Granja Acuícola ${granja}`,
        }),
      });
      setMensaje("✅ Instalación registrada correctamente");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error("❌ Error al registrar instalación:", error);
      setMensaje("Error al registrar instalación");
    }
  };

  // 🔹 Actualizar instalación
  const actualizarInstalacion = async () => {
    if (!seleccionado) return;
    try {
      await apiFetch(`/instalaciones/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: `Granja Acuícola ${granja}`,
        }),
      });
      setMensaje("✅ Instalación actualizada correctamente");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error("❌ Error al actualizar instalación:", error);
      setMensaje("Error al actualizar instalación");
    }
  };

  // 🔹 Eliminar instalación
  const eliminarInstalacion = async () => {
    if (!seleccionado) return;
    try {
      await apiFetch(`/instalaciones/${seleccionado}`, { method: "DELETE" });
      setMensaje("🗑️ Instalación eliminada correctamente");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error("❌ Error al eliminar instalación:", error);
      setMensaje("Error al eliminar instalación");
    }
  };

  // 🔹 Seleccionar fila (para editar)
  const seleccionarInstalacion = (inst) => {
    setSeleccionado(inst.fi_instalacion_id);
    setForm({
      nombre_instalacion: inst.nombre_instalacion || "",
      largo: inst.largo ?? "",
      ancho: inst.ancho ?? "",
      altura: inst.altura ?? "",
      material: inst.material || "",
    });
    setMostrarFormulario(true);
  };

  // 🔹 Cambiar granja
  const cambiarGranja = (nuevaGranja) => {
    setGranja(nuevaGranja);
    setSeleccionado(null);
    limpiarFormulario();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#004C7D">
        🧱 Registro de Instalaciones
      </Typography>

      {/* 🌿 Tabs de Granja */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mb: 3,
          borderBottom: "2px solid #ddd",
          pb: 1,
        }}
      >
        <Button
          variant={granja === "Medellin" ? "contained" : "outlined"}
          color="primary"
          onClick={() => cambiarGranja("Medellin")}
        >
          Medellín
        </Button>
        <Button
          variant={granja === "Ceiba" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => cambiarGranja("Ceiba")}
        >
          La Ceiba
        </Button>
      </Box>

      <Button
        variant="contained"
        color="success"
        onClick={() => setMostrarFormulario(true)}
        sx={{ backgroundColor: "#32CD32" }}
      >
        Nueva Instalación
      </Button>

      {mostrarFormulario && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Nombre de Instalación"
                  name="nombre_instalacion"
                  value={form.nombre_instalacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Largo (m)"
                  name="largo"
                  type="number"
                  value={form.largo}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Ancho (m)"
                  name="ancho"
                  type="number"
                  value={form.ancho}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Altura (m)"
                  name="altura"
                  type="number"
                  value={form.altura}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField
                  label="Material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="success"
                onClick={registrarInstalacion}
                sx={{ backgroundColor: "#32CD32" }}
              >
                REGISTRAR
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                onClick={actualizarInstalacion}
                disabled={!seleccionado}
              >
                ACTUALIZAR
              </Button>
              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                onClick={eliminarInstalacion}
                disabled={!seleccionado}
              >
                ELIMINAR
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} onClick={limpiarFormulario}>
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
            Instalaciones — {granja}
          </Typography>
        </Box>

        <Table stickyHeader sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Largo (m)</TableCell>
              <TableCell>Ancho (m)</TableCell>
              <TableCell>Altura (m)</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Volumen (m³)</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instalaciones.map((inst) => (
              <TableRow key={inst.fi_instalacion_id}>
                <TableCell>{inst.nombre_instalacion}</TableCell>
                <TableCell>{inst.largo}</TableCell>
                <TableCell>{inst.ancho}</TableCell>
                <TableCell>{inst.altura}</TableCell>
                <TableCell>{inst.material}</TableCell>
                <TableCell>
                  {inst.metros_cubicos && !isNaN(inst.metros_cubicos)
                    ? `${Number(inst.metros_cubicos).toFixed(2)} m³`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => seleccionarInstalacion(inst)}
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
