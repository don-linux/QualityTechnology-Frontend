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

export default function Reproductores() {
  return <ReproductoresContent />;
}

function ReproductoresContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  // 🔹 Estados principales
  const [form, setForm] = useState({
    fc_instalacion: "",
    fn_cantidad: "",
    fn_talla: "",
    fn_no_lote: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_biometria: "",
    fn_machos: "",
    fn_hembras: "",
    fc_linea: "",
    fc_familia: "",
    fc_granja: "Granja Acuícola Medellín",
  });

  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellín");
  const [reproductores, setReproductores] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // 🔹 Estados para trazabilidad
  const [trazabilidad, setTrazabilidad] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  /* =========================================================
     🔹 Cargar datos según granja
  ========================================================= */
  const obtenerReproductores = async () => {
    try {
      const data = await apiFetch(`/reproductores/${usuario_id}/${granjaActiva}`);
      setReproductores(data);
      setTrazabilidad(data);
    } catch (error) {
      console.error("❌ Error al obtener reproductores:", error);
    }
  };

  useEffect(() => {
    limpiarFormulario();
    obtenerReproductores();
  }, [granjaActiva]);

  /* =========================================================
     🔹 CRUD
  ========================================================= */
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
      fn_machos: "",
      fn_hembras: "",
      fc_linea: "",
      fc_familia: "",
      fc_granja: granjaActiva,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  const registrarReproductor = async () => {
    if (!form.fc_instalacion || !form.fn_cantidad)
      return alert("⚠️ Debes llenar los campos de instalación y cantidad.");

    try {
      await apiFetch("/reproductores", {
        method: "POST",
        body: JSON.stringify({ ...form, fi_usuario_id: usuario_id }),
      });
      alert("✅ Reproductor registrado correctamente");
      limpiarFormulario();
      obtenerReproductores();
    } catch (error) {
      console.error("❌ Error al registrar reproductor:", error);
      alert("Error al registrar reproductor");
    }
  };

  const actualizarReproductor = async () => {
    if (!seleccionado) return alert("Selecciona un registro para actualizar.");

    try {
      await apiFetch(`/reproductores/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, fc_granja: granjaActiva }),
      });
      alert("✅ Reproductor actualizado correctamente");
      limpiarFormulario();
      obtenerReproductores();
    } catch (error) {
      console.error("❌ Error al actualizar reproductor:", error);
    }
  };

  const eliminarReproductor = async () => {
    if (!seleccionado) return alert("Selecciona un registro para eliminar.");
    if (!window.confirm("¿Eliminar este registro definitivamente?")) return;

    try {
      await apiFetch(`/reproductores/${seleccionado}`, { method: "DELETE" });
      alert("🗑️ Registro eliminado correctamente");
      limpiarFormulario();
      obtenerReproductores();
    } catch (error) {
      console.error("❌ Error al eliminar reproductor:", error);
    }
  };

  const seleccionarReproductor = (r) => {
    setSeleccionado(r.fi_reproductor_id);
    setForm({
      fc_instalacion: r.fc_instalacion,
      fn_cantidad: r.fn_cantidad,
      fn_talla: r.fn_talla,
      fn_no_lote: r.fn_no_lote,
      fc_observacion: r.fc_observacion,
      fd_fecha_siembra: r.fd_fecha_siembra?.substring(0, 10) || "",
      fd_fecha_biometria: r.fd_fecha_biometria?.substring(0, 10) || "",
      fn_machos: r.fn_machos,
      fn_hembras: r.fn_hembras,
      fc_linea: r.fc_linea,
      fc_familia: r.fc_familia,
      fc_granja: r.fc_granja,
    });
    setMostrarFormulario(true);
  };

  /* =========================================================
     🔹 Trazabilidad
  ========================================================= */
  const filtrarTrazabilidad = async () => {
    try {
      const query = new URLSearchParams({
        buscar,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }).toString();

      const data = await apiFetch(
        `/reproductores/${usuario_id}/${granjaActiva}?${query}`
      );
      setTrazabilidad(data);
    } catch (error) {
      console.error("❌ Error al filtrar trazabilidad:", error);
    }
  };

  const eliminarUnoTrazabilidad = async (id) => {
    if (!window.confirm("¿Eliminar este registro de trazabilidad?")) return;
    try {
      await apiFetch(`/reproductores/${id}`, { method: "DELETE" });
      obtenerReproductores();
    } catch (error) {
      console.error("❌ Error al eliminar trazabilidad:", error);
    }
  };

  const eliminarTodosTrazabilidad = async () => {
    if (
      !window.confirm(
        `⚠️ Esto eliminará todos los registros de ${granjaActiva}. ¿Continuar?`
      )
    )
      return;
    try {
      await apiFetch(`/reproductores/eliminar/todos/${granjaActiva}`, {
        method: "DELETE",
      });
      setTrazabilidad([]);
    } catch (error) {
      console.error("❌ Error al eliminar todos:", error);
    }
  };

  /* =========================================================
     🔹 Totales
  ========================================================= */
  const totalOrganismos = reproductores.reduce(
    (acc, r) => acc + (r.fn_cantidad || 0),
    0
  );

  /* =========================================================
     🔹 Render principal
  ========================================================= */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        🧬 Control de Reproductores — Sistema
      </Typography>

      {/* Pestañas de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant={granjaActiva.includes("Medellín") ? "contained" : "outlined"}
          color="primary"
          onClick={() => setGranjaActiva("Granja Acuícola Medellín")}
        >
          MEDELLÍN
        </Button>
        <Button
          variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}
        >
          CEIBA
        </Button>
      </Box>

      {/* Resumen */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography>
          <b>Granja activa:</b> {granjaActiva.replace("Granja Acuícola ", "")}
        </Typography>
        <Typography>
          <b>Reproductores registrados:</b> {reproductores.length}
        </Typography>
        <Typography>
          <b>Total organismos:</b> {totalOrganismos.toLocaleString("es-MX")}
        </Typography>
      </Paper>

      {/* ================== INVENTARIO PRINCIPAL ================== */}
      <Typography variant="h6" color="#00796B" fontWeight="bold" mb={2}>
        📋 Inventario
      </Typography>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 4,
          p: 3,
          backgroundColor: "#FAFAFA",
          boxShadow: 3,
        }}
      >
        {/* Encabezado */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="h6" color="#00796B" fontWeight="bold">
            ✏️ Registro de Reproductores
          </Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            sx={{
              backgroundColor: "#32CD32",
              fontWeight: "bold",
              px: 3,
              py: 1,
              borderRadius: 2,
            }}
          >
            {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
          </Button>
        </Box>

        {/* Formulario */}
        {mostrarFormulario && (
          <Card sx={{ mb: 3, boxShadow: 1, border: "1px solid #e0e0e0" }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Instalación"
                    name="fc_instalacion"
                    value={form.fc_instalacion}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Cantidad"
                    name="fn_cantidad"
                    value={form.fn_cantidad}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Talla (Gr)"
                    name="fn_talla"
                    value={form.fn_talla}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="No. Lote"
                    name="fn_no_lote"
                    value={form.fn_no_lote}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Machos"
                    name="fn_machos"
                    value={form.fn_machos}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Hembras"
                    name="fn_hembras"
                    value={form.fn_hembras}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Línea"
                    name="fc_linea"
                    value={form.fc_linea}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Familia"
                    name="fc_familia"
                    value={form.fc_familia}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Observación"
                    name="fc_observacion"
                    value={form.fc_observacion}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Fecha Siembra"
                    name="fd_fecha_siembra"
                    InputLabelProps={{ shrink: true }}
                    value={form.fd_fecha_siembra}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    type="date"
                    label="Fecha Biometría"
                    name="fd_fecha_biometria"
                    InputLabelProps={{ shrink: true }}
                    value={form.fd_fecha_biometria}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 3,
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={registrarReproductor}
                  sx={{ backgroundColor: "#32CD32" }}
                >
                  REGISTRAR
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={actualizarReproductor}
                  disabled={!seleccionado}
                >
                  ACTUALIZAR
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={eliminarReproductor}
                  disabled={!seleccionado}
                >
                  ELIMINAR
                </Button>
                <Button variant="outlined" onClick={limpiarFormulario}>
                  CERRAR
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Instalación</TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Familia</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>No. Lote</TableCell>
              <TableCell>Machos</TableCell>
              <TableCell>Hembras</TableCell>
              <TableCell>Ratio</TableCell>
              <TableCell>Fecha Siembra</TableCell>
              <TableCell>Fecha Biometría</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reproductores.map((r) => (
              <TableRow
                key={r.fi_reproductor_id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => seleccionarReproductor(r)}
              >
                <TableCell>{r.fc_instalacion}</TableCell>
                <TableCell>{r.fc_linea}</TableCell>
                <TableCell>{r.fc_familia}</TableCell>
                <TableCell>{r.fn_cantidad}</TableCell>
                <TableCell>{r.fn_talla}</TableCell>
                <TableCell>{r.fn_no_lote}</TableCell>
                <TableCell>{r.fn_machos}</TableCell>
                <TableCell>{r.fn_hembras}</TableCell>
                <TableCell>{r.fc_ratio}</TableCell>
                <TableCell>
                  {r.fd_fecha_siembra
                    ? new Date(r.fd_fecha_siembra).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>
                  {r.fd_fecha_biometria
                    ? new Date(r.fd_fecha_biometria).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>{r.fc_observacion}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* =================== RASTREABILIDAD =================== */}
      <Typography variant="h6" mt={5} mb={2} color="#E65100">
        🔁 Trazabilidad
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={3}>
          <TextField
            label="Buscar por instalación o familia"
            fullWidth
            size="small"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Fecha inicio"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Fecha fin"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Button
            variant="contained"
            sx={{ backgroundColor: "#0288d1" }}
            onClick={filtrarTrazabilidad}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
            onClick={eliminarTodosTrazabilidad}
          >
            Eliminar Todos
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Instalación</TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Familia</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha Siembra</TableCell>
              <TableCell>Fecha Biometría</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trazabilidad.map((t) => (
              <TableRow key={t.fi_reproductor_id}>
                <TableCell>{t.fc_instalacion}</TableCell>
                <TableCell>{t.fc_linea}</TableCell>
                <TableCell>{t.fc_familia}</TableCell>
                <TableCell>{t.fn_cantidad}</TableCell>
                <TableCell>
                  {t.fd_fecha_siembra
                    ? new Date(t.fd_fecha_siembra).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>
                  {t.fd_fecha_biometria
                    ? new Date(t.fd_fecha_biometria).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>{t.fc_observacion}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => eliminarUnoTrazabilidad(t.fi_reproductor_id)}
                  >
                    Eliminar
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
