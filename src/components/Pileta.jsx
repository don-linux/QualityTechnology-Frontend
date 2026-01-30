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
  FormControl,
} from "@mui/material";

export default function Pileta() {
  return <PiletaContent />;
}

function PiletaContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
    fi_instalacion_id: "",
    origen_instalacion: "",
    cantidad: "",
    talla_gr: "",
    no_lote: "",
    observacion: "",
    fecha_siembra: "",
    fecha_ultima_biometria: "",
    fc_granja: "Granja Acuícola Medellin",
  });

  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellin");
  const [inventario, setInventario] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [rastreos, setRastreos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  /* =========================================================
     🔹 Cargar datos según granja
  ========================================================= */
  const obtenerInventario = async () => {
    try {
      const data = await apiFetch(`/piletas/inventario/${granjaActiva}`);
      setInventario(data);
    } catch (error) {
      console.error("❌ Error al obtener inventario:", error);
    }
  };

  const obtenerPiletas = async () => {
    try {
      const data = await apiFetch(`/piletas/granja/${granjaActiva}`);
      setPiletas(data);
    } catch (error) {
      console.error("❌ Error al obtener piletas:", error);
    }
  };

  const obtenerInstalaciones = async () => {
    try {
      const data = await apiFetch(`/instalaciones/${usuario_id}`);
      const filtradas = data.filter((i) => i.fc_granja === granjaActiva);
      setInstalaciones(filtradas);
    } catch (error) {
      console.error("❌ Error al obtener instalaciones:", error);
    }
  };

  const obtenerRastreos = async () => {
    try {
      const data = await apiFetch(
        `/piletas/movimientos/${usuario_id}/${granjaActiva}`
      );
      setRastreos(data);
    } catch (error) {
      console.error("❌ Error al obtener rastreabilidad:", error);
    }
  };

  useEffect(() => {
    limpiarFormulario();
    obtenerInventario();
    obtenerPiletas();
    obtenerInstalaciones();
    obtenerRastreos();
  }, [granjaActiva]);

  /* =========================================================
     🔹 CRUD y filtros
  ========================================================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      fi_instalacion_id: "",
      origen_instalacion: "",
      cantidad: "",
      talla_gr: "",
      no_lote: "",
      observacion: "",
      fecha_siembra: "",
      fecha_ultima_biometria: "",
      fc_granja: granjaActiva,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  const registrarPileta = async () => {
    if (!form.cantidad || !form.fi_instalacion_id)
      return alert("⚠️ Es necesario especificar instalación destino y cantidad.");

    if (["venta", "mortalidad"].includes(form.observacion.toLowerCase())) {
      const ok = window.confirm(
        `⚠️ Este movimiento (${form.observacion}) restará ${form.cantidad} organismos del origen. ¿Continuar?`
      );
      if (!ok) return;
    }

    try {
      const res = await apiFetch("/piletas", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: granjaActiva,
        }),
      });

      if (res?.message?.includes("No se puede trasladar entre granjas")) {
        return alert("🚫 No se puede trasladar entre granjas distintas.");
      }

      alert("✅ Movimiento registrado correctamente");
      limpiarFormulario();
      obtenerPiletas();
      obtenerInventario();
      obtenerRastreos();
    } catch (error) {
      console.error("❌ Error al registrar la pileta:", error);
      alert("Error al registrar la pileta");
    }
  };

  const actualizarPileta = async () => {
    if (!seleccionado) return alert("Selecciona un registro para actualizar.");
    try {
      await apiFetch(`/piletas/${seleccionado}`, {
        method: "PUT",
        body: JSON.stringify({ ...form, fc_granja: granjaActiva }),
      });
      alert("✅ Pileta actualizada correctamente");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (error) {
      console.error("❌ Error al actualizar la pileta:", error);
    }
  };

  const eliminarPileta = async () => {
    if (!seleccionado) return alert("Selecciona una pileta para eliminar.");
    if (!window.confirm("¿Eliminar esta pileta definitivamente?")) return;
    try {
      await apiFetch(`/piletas/${seleccionado}`, { method: "DELETE" });
      alert("🗑️ Pileta eliminada correctamente");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (error) {
      console.error("❌ Error al eliminar la pileta:", error);
    }
  };

  const seleccionarPileta = (p) => {
    setSeleccionado(p.fi_pileta_id);
    setForm({
      fi_instalacion_id: p.fi_instalacion_id || "",
      origen_instalacion: p.origen_instalacion || "",
      cantidad: p.cantidad,
      talla_gr: p.talla_gr,
      no_lote: p.no_lote,
      observacion: p.observacion,
      fecha_siembra: p.fecha_siembra?.substring(0, 10) || "",
      fecha_ultima_biometria: p.fecha_ultima_biometria?.substring(0, 10) || "",
      fc_granja: p.fc_granja,
    });
    setMostrarFormulario(true);
  };

  const filtrarRastreabilidad = async () => {
    try {
      const query = new URLSearchParams({
        buscar,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }).toString();

      const data = await apiFetch(
        `/piletas/movimientos/filtro/${usuario_id}/${granjaActiva}?${query}`
      );
      setRastreos(data);
    } catch (error) {
      console.error("❌ Error al filtrar rastreabilidad:", error);
    }
  };

  const eliminarUno = async (id) => {
    if (!window.confirm("¿Eliminar este movimiento?")) return;
    try {
      await apiFetch("/piletas/movimientos/eliminar", {
        method: "DELETE",
        body: JSON.stringify({ movimiento_id: id }),
      });
      filtrarRastreabilidad();
    } catch (error) {
      console.error("❌ Error al eliminar movimiento:", error);
    }
  };

  const eliminarTodos = async () => {
    if (
      !window.confirm(
        `⚠️ Esto eliminará todos los movimientos de ${granjaActiva}. ¿Continuar?`
      )
    )
      return;
    try {
      await apiFetch("/piletas/movimientos/eliminar", {
        method: "DELETE",
        body: JSON.stringify({
          eliminar_todos: true,
          granja: granjaActiva,
        }),
      });
      setRastreos([]);
    } catch (error) {
      console.error("❌ Error al eliminar todos:", error);
    }
  };

  const getBadgeStyle = (dias) => {
    if (dias <= 60)
      return { backgroundColor: "#4CAF50", color: "white", borderRadius: 12, padding: "6px 12px" };
    if (dias <= 100)
      return { backgroundColor: "#FFC107", color: "#333", borderRadius: 12, padding: "6px 12px" };
    return { backgroundColor: "#F44336", color: "white", borderRadius: 12, padding: "6px 12px" };
  };

  const totalOrganismos = inventario.reduce((acc, p) => acc + (p.cantidad || 0), 0);

  /* =========================================================
     🔹 Render principal
  ========================================================= */
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        🧬 Control de Alevinaje — Sistema
      </Typography>

      {/* Pestañas de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant={granjaActiva.includes("Medellin") ? "contained" : "outlined"}
          color="primary"
          onClick={() => setGranjaActiva("Granja Acuícola Medellin")}
        >
          MEDELLÍN
        </Button>
        <Button
          variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}
        >
          LA CEIBA
        </Button>
      </Box>

      {/* Resumen */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Granja activa:</b> {granjaActiva.replace("Granja Acuícola ", "")}</Typography>
        <Typography><b>Piletas registradas:</b> {inventario.length}</Typography>
        <Typography><b>Total organismos:</b> {totalOrganismos.toLocaleString("es-MX")}</Typography>
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
        {/* Encabezado del bloque */}
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
            ✏️ Registro de Movimientos
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

        {/* Formulario dentro del bloque */}
        {mostrarFormulario && (
          <Card
            sx={{
              mb: 3,
              boxShadow: 1,
              border: "1px solid #e0e0e0",
              backgroundColor: "#ffffff",
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={4}>
                  <FormControl fullWidth>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "#555" }}>
                      Origen
                    </Typography>
                    <TextField
                      select
                      name="origen_instalacion"
                      value={form.origen_instalacion}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value="">Seleccione pila origen</MenuItem>
                      {piletas.map((p) => (
                        <MenuItem key={p.fi_pileta_id} value={p.fi_pileta_id}>
                          {`${p.destino_nombre || p.nombre_instalacion} — ${p.cantidad} organismos`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <FormControl fullWidth>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "#555" }}>
                      Destino
                    </Typography>
                    <TextField
                      select
                      name="fi_instalacion_id"
                      value={form.fi_instalacion_id}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value="">Seleccione instalación destino</MenuItem>
                      {instalaciones.map((inst) => (
                        <MenuItem
                          key={inst.fi_instalacion_id}
                          value={inst.fi_instalacion_id}
                        >
                          {inst.nombre_instalacion}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Cantidad"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="Talla (Gr)"
                    name="talla_gr"
                    value={form.talla_gr}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                  <TextField
                    label="No. Lote"
                    name="no_lote"
                    value={form.no_lote}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12} md={12} lg={4}>
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

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 3,
                  flexWrap: "wrap",
                }}
              >
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
                  onClick={actualizarPileta}
                  disabled={!seleccionado}
                >
                  ACTUALIZAR
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={eliminarPileta}
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
              <TableCell>Cantidad (organismos)</TableCell>
              <TableCell>Talla (Gr)</TableCell>
              <TableCell>No. Lote</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Fecha Siembra</TableCell>
              <TableCell>Días en Pila</TableCell>
              <TableCell>Fecha Última Biometría</TableCell>
              <TableCell>Días Transcurridos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventario.map((p) => (
              <TableRow
                key={p.fi_instalacion_id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => seleccionarPileta(p)}
              >
                <TableCell>{p.nombre_instalacion}</TableCell>
                <TableCell>{p.cantidad}</TableCell>
                <TableCell>{p.talla_gr}</TableCell>
                <TableCell>{p.no_lote}</TableCell>
                <TableCell>{p.observacion}</TableCell>
                <TableCell>
                  {p.fecha_siembra ? new Date(p.fecha_siembra).toLocaleDateString("es-MX") : "—"}
                </TableCell>
                <TableCell>{p.dias_en_pila || "—"}</TableCell>
                <TableCell>
                  {p.fecha_ultima_biometria
                    ? new Date(p.fecha_ultima_biometria).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>
                  {p.dias_transcurridos !== null ? (
                    <span style={getBadgeStyle(p.dias_transcurridos)}>
                      {p.dias_transcurridos}
                    </span>
                  ) : "—"}
                </TableCell>
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
            label="Buscar por pileta o instalación"
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
            onClick={filtrarRastreabilidad}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            color="error"
            sx={{ ml: 2 }}
            onClick={eliminarTodos}
          >
            Eliminar Todos
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Organismos Trasladados</TableCell>
              <TableCell>Fecha Movimiento</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rastreos.map((r) => (
              <TableRow key={r.fi_movimiento_id}>
                <TableCell>{r.origen_nombre || "—"}</TableCell>
                <TableCell>{r.destino_nombre || "—"}</TableCell>
                <TableCell>{r.cantidad_trasladada}</TableCell>
                <TableCell>
                  {r.fecha_movimiento
                    ? new Date(r.fecha_movimiento).toLocaleDateString("es-MX")
                    : "—"}
                </TableCell>
                <TableCell>{r.observacion}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => eliminarUno(r.fi_movimiento_id)}
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
