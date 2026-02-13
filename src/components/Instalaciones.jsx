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
  MenuItem,
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
    tipo_instalacion: "",
    estado: "vacia",
  });

  const [instalaciones, setInstalaciones] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [granja, setGranja] = useState("Medellin");
  const [tipo, setTipo] = useState("Alevinaje");

  // filtros
  const [filtroMaterial, setFiltroMaterial] = useState("");
  const [filtroUso, setFiltroUso] = useState("");

  /* =========================================================
     🔹 Obtener instalaciones por tipo y granja
  ========================================================= */
  const obtenerInstalaciones = async () => {
    try {
      const data = await apiFetch(`/instalaciones/granja/${granja}`);

      if (!Array.isArray(data)) {
        setInstalaciones([]);
        return;
      }

      const normalizar = (t) =>
        t
          ? t
              .toLowerCase()
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
          : "";

      const tipoNorm = normalizar(tipo);

      const filtradas = data.filter(
        (i) => normalizar(i.tipo_instalacion) === tipoNorm
      );

      setInstalaciones(filtradas);
      setMensaje(
        `✅ ${filtradas.length} instalaciones cargadas (${tipo} - ${granja})`
      );
    } catch (error) {
      console.error(error);
      setInstalaciones([]);
      setMensaje("Error al obtener instalaciones");
    }
  };

  useEffect(() => {
    obtenerInstalaciones();
  }, [tipo, granja]);

  /* =========================================================
     🔹 CRUD
  ========================================================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      nombre_instalacion: "",
      largo: "",
      ancho: "",
      altura: "",
      material: "",
      tipo_instalacion: tipo,
      estado: "vacia",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  const registrarInstalacion = async () => {
    try {
      await apiFetch("/instalaciones", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: granja,
        }),
      });

      setMensaje("✅ Instalación registrada");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error(error);
      setMensaje("Error al registrar instalación");
    }
  };

  const actualizarInstalacion = async () => {
    try {
      await apiFetch(`/instalaciones/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: granja,
        }),
      });

      setMensaje("✅ Actualizado correctamente");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error(error);
      setMensaje("Error al actualizar");
    }
  };

  const eliminarInstalacion = async () => {
    if (!window.confirm("¿Eliminar instalación?")) return;

    try {
      await apiFetch(`/instalaciones/${seleccionado}`, { method: "DELETE" });

      setMensaje("🗑️ Eliminado correctamente");
      limpiarFormulario();
      obtenerInstalaciones();
    } catch (error) {
      console.error(error);
      setMensaje("Error al eliminar");
    }
  };

  /* =========================================================
     🔹 Seleccionar instalación
  ========================================================= */
  const seleccionarInstalacion = (i) => {
    setSeleccionado(i.fi_instalacion_id);
    setForm({
      nombre_instalacion: i.nombre_instalacion,
      largo: i.largo,
      ancho: i.ancho,
      altura: i.altura,
      material: i.material,
      tipo_instalacion: i.tipo_instalacion,
      estado: i.estado,
    });
    setMostrarFormulario(true);
  };

  /* =========================================================
     🔹 Filtros funcionales
  ========================================================= */
  const instalacionesFiltradas = instalaciones
    // FILTRO MATERIAL (buscador parcial)
    .filter((i) =>
      i.material.toLowerCase().includes(filtroMaterial.toLowerCase())
    )
    // FILTRO USO
    .filter((i) => !filtroUso || i.estado === filtroUso);

  const totalM3 = instalacionesFiltradas.reduce(
    (acc, i) => acc + Number(i.metros_cubicos || 0),
    0
  );

  /* =========================================================
     🔹 Render
  ========================================================= */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3} color="#004C7D">
        🧱 Registro de Instalaciones
      </Typography>

      {/* Selección de granja */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
        <Button
          variant={granja === "Medellin" ? "contained" : "outlined"}
          onClick={() => setGranja("Medellin")}
        >
          🏠 Medellín
        </Button>
        <Button
          variant={granja === "Ceiba" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setGranja("Ceiba")}
        >
          🌿 La Ceiba
        </Button>
      </Box>

      {/* TIPOS */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant={tipo === "Alevinaje" ? "contained" : "outlined"}
          onClick={() => setTipo("Alevinaje")}
        >
          🐣 Alevinaje
        </Button>

        <Button
          variant={tipo === "Reproductores" ? "contained" : "outlined"}
          onClick={() => setTipo("Reproductores")}
        >
          🧬 Reproductores
        </Button>

        <Button
          variant={tipo === "Engorda" ? "contained" : "outlined"}
          onClick={() => setTipo("Engorda")}
        >
          🐟 Engorda
        </Button>
      </Box>

      {/* Botón principal */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 2 }}>
        <Button 
          variant="contained" 
          color="success"
          onClick={() => setMostrarFormulario(true)}
        >
          + Nueva Instalación ({tipo})
        </Button>
      </Box>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              
              <Grid item xs={12} md={3}>
                <TextField
                  label="Nombre"
                  name="nombre_instalacion"
                  value={form.nombre_instalacion}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  label="Largo"
                  name="largo"
                  type="number"
                  value={form.largo}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  label="Ancho"
                  name="ancho"
                  type="number"
                  value={form.ancho}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <TextField
                  label="Altura"
                  name="altura"
                  type="number"
                  value={form.altura}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Material"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>

              {/* ESTADO */}
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Estado"
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="vacia">Vacía</MenuItem>
                  <MenuItem value="ocupada">Ocupada</MenuItem>
                </TextField>
              </Grid>

              {/* TIPO */}
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Tipo"
                  name="tipo_instalacion"
                  value={form.tipo_instalacion}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="Alevinaje">Alevinaje</MenuItem>
                  <MenuItem value="Reproductores">Reproductores</MenuItem>
                  <MenuItem value="Engorda">Engorda</MenuItem>
                </TextField>
              </Grid>

            </Grid>

            {/* BOTONES */}
            <Box sx={{ mt: 3 }}>
              <Button variant="contained" color="success" onClick={registrarInstalacion}>
                REGISTRAR
              </Button>

              <Button
                variant="contained"
                color="primary"
                sx={{ ml: 2 }}
                disabled={!seleccionado}
                onClick={actualizarInstalacion}
              >
                ACTUALIZAR
              </Button>

              <Button
                variant="contained"
                color="error"
                sx={{ ml: 2 }}
                disabled={!seleccionado}
                onClick={eliminarInstalacion}
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

      {/* FILTROS */}
      <Box sx={{ display: "flex", gap: 3, mb: 2, mt: 3 }}>
        <TextField
          label="Material (buscar)"
          value={filtroMaterial}
          onChange={(e) => setFiltroMaterial(e.target.value)}
          sx={{ width: 200 }}
        />

        <TextField
          select
          label="Uso"
          value={filtroUso}
          onChange={(e) => setFiltroUso(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ocupada">Ocupada</MenuItem>
          <MenuItem value="vacia">Vacía</MenuItem>
        </TextField>
      </Box>

      {/* TABLA */}
      <Paper sx={{ mt: 3, borderRadius: 3, overflow: "hidden" }}>
        <Box
          sx={{
            background: "linear-gradient(90deg, #00BFA5, #00ACC1)",
            color: "white",
            py: 1.2,
            px: 2,
          }}
        >
          <Typography variant="h6">
            {tipo} — {granja}
          </Typography>
        </Box>

        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Largo</TableCell>
              <TableCell>Ancho</TableCell>
              <TableCell>Altura</TableCell>
              <TableCell>Material</TableCell>
              <TableCell>Uso</TableCell>
              <TableCell>Volumen (m³)</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {instalacionesFiltradas.map((inst) => (
              <TableRow key={inst.fi_instalacion_id} hover>
                <TableCell>{inst.nombre_instalacion}</TableCell>
                <TableCell>{inst.largo}</TableCell>
                <TableCell>{inst.ancho}</TableCell>
                <TableCell>{inst.altura}</TableCell>
                <TableCell>{inst.material}</TableCell>
                <TableCell>{inst.estado}</TableCell>
                <TableCell>
                  {inst.metros_cubicos
                    ? Number(inst.metros_cubicos).toFixed(2)
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

        {/* TOTALES */}
        <Typography sx={{ m: 2, fontWeight: "bold", fontSize: "16px" }}>
          Total instalaciones: {instalacionesFiltradas.length} — Total m³:{" "}
          {totalM3.toFixed(2)}
        </Typography>
      </Paper>
    </Box>
  );
}
