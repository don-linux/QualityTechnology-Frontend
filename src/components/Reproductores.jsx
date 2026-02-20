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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

export default function Reproductores() {
  return <ReproductoresContent />;
}

function ReproductoresContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellin");
  const [reproductores, setReproductores] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [rastreos, setRastreos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const [form, setForm] = useState({
    origen_instalacion: "",
    origen_texto: "",
    fc_instalacion: "",
    fn_machos: "",
    fn_hembras: "",
    fn_cantidad: "",
    fn_talla: "",
    fc_linea: "",
    fc_familia: "",
    fc_ratio: "",
    fc_observacion: "",
    fd_fecha_siembra: "",
    fd_fecha_biometria: "",
  });

  /* ===================== HELPERS ===================== */

  const formatNumber = (num) => {
    if (!num && num !== 0) return "—";
    const n = Number(num);
    return Number.isInteger(n)
      ? n.toLocaleString("en-US")
      : n.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const f = new Date(fecha);
    return f.toLocaleDateString("es-MX");
  };

  const calcularDias = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date();
    const f = new Date(fecha);
    return Math.floor((hoy - f) / (1000 * 60 * 60 * 24));
  };

  const colorDias = (dias) => {
    if (dias === null) return "inherit";
    if (dias <= 10) return "#2e7d32";
    if (dias <= 15) return "#f9a825";
    return "#c62828";
  };

  /* ===================== CARGA DE DATOS ===================== */

  const obtenerReproductores = async () => {
    const data = await apiFetch(`/reproductores/${granjaActiva}`);
    setReproductores(data || []);
  };

  const obtenerInstalaciones = async () => {
  // Normalizar nombres tal como los usa tu backend
  const granjaNormalizada = granjaActiva.includes("Ceiba")
    ? "Granja Acuícola La Ceiba"
    : "Granja Acuícola Medellin";

  // Asegura encoding correcto
  const granja = encodeURIComponent(granjaNormalizada);

  // Llamada al backend que debe devolver TODAS las instalaciones de esa granja
 const data = await apiFetch(`/instalaciones/granja/${granja}`);

  setInstalaciones(data || []);
};

  const obtenerTrazabilidad = async () => {
    const data = await apiFetch(`/reproductores/movimientos/${granjaActiva}`);
    setRastreos(data || []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    obtenerReproductores();
    obtenerInstalaciones();
    obtenerTrazabilidad();
  }, [granjaActiva]);

  /* ===================== FORMULARIO ===================== */

  const limpiarFormulario = () => {
    setForm({
      origen_instalacion: "",
      origen_texto: "",
      fc_instalacion: "",
      fn_machos: "",
      fn_hembras: "",
      fn_cantidad: "",
      fn_talla: "",
      fc_linea: "",
      fc_familia: "",
      fc_ratio: "",
      fc_observacion: "",
      fd_fecha_siembra: "",
      fd_fecha_biometria: "",
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    let updated = { ...form, [name]: value };

    if (name === "fn_machos" || name === "fn_hembras") {
      const m = parseInt(updated.fn_machos || 0);
      const h = parseInt(updated.fn_hembras || 0);
      updated.fn_cantidad = m + h;
      updated.fc_ratio = m > 0 ? `1:${h}` : "";
    }

    setForm(updated);
  };

  /* ===================== ACCIONES ===================== */

  const registrarReproductor = async () => {
    if (!form.fc_instalacion || !form.fn_cantidad) {
      return alert("⚠️ Selecciona destino y cantidad");
    }

    await apiFetch("/reproductores", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        origen_texto: form.origen_instalacion || form.origen_texto,
        fi_usuario_id: usuario_id,
        fc_granja: granjaActiva,
      }),
    });

    limpiarFormulario();
    obtenerReproductores();
    obtenerTrazabilidad();
  };

  const editarReproductor = (r) => {
    setSeleccionado(r);

    setForm({
      origen_instalacion: r.origen_instalacion || "",
      origen_texto: r.origen_texto || "",
      fc_instalacion: r.fc_instalacion,
      fn_machos: r.fn_machos,
      fn_hembras: r.fn_hembras,
      fn_cantidad: r.fn_cantidad,
      fn_talla: r.fn_talla,
      fc_linea: r.fc_linea,
      fc_familia: r.fc_familia,
      fc_ratio: r.fc_ratio,
      fc_observacion: r.fc_observacion,
      fd_fecha_siembra: r.fd_fecha_siembra,
      fd_fecha_biometria: r.fd_fecha_biometria,
    });

    setMostrarFormulario(true);
  };

  const guardarEdicion = async () => {
    await apiFetch(`/reproductores/${seleccionado.fi_reproductor_id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...form,
        fi_usuario_id: usuario_id,
      }),
    });

    // Crear trazabilidad si cambia instalación
    if (form.fc_instalacion !== seleccionado.fc_instalacion) {
      await apiFetch(`/reproductores/movimiento`, {
        method: "POST",
        body: JSON.stringify({
          fi_repro_origen: seleccionado.fi_reproductor_id,
          origen_texto: seleccionado.fc_instalacion,
          fi_repro_destino: seleccionado.fi_reproductor_id,
          cantidad_trasladada: form.fn_cantidad,
          observacion: "Cambio de instalación",
          fi_usuario_id: usuario_id,
        }),
      });
    }

    limpiarFormulario();
    obtenerReproductores();
    obtenerTrazabilidad();
  };

  const eliminarReproductor = async (id) => {
    if (!window.confirm("¿Eliminar este reproductor?")) return;

    await apiFetch(`/reproductores/${id}`, { method: "DELETE" });

    obtenerReproductores();
    obtenerTrazabilidad();
  };

  const trazarReproductor = (r) => {
    alert(`Movimiento desde ${r.fc_instalacion}.  
Pronto conectaremos este botón con traspasos internos.`);
  };

  /* ===================== RENDER ===================== */

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
        🧬 Control de Reproductores
      </Typography>

      {/* Selector de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant={granjaActiva.includes("Medellin") ? "contained" : "outlined"}
          onClick={() => setGranjaActiva("Granja Acuícola Medellin")}
        >
          MEDELLÍN
        </Button>
        <Button
          variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"}
          onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}
        >
          LA CEIBA
        </Button>
      </Box>

      {/* FORMULARIO */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
        </Button>

        {mostrarFormulario && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {/* ORIGEN */}
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    size="small"
                    label="Origen (instalación)"
                    name="origen_instalacion"
                    value={form.origen_instalacion}
                    onChange={handleChange}
                    fullWidth
                    disabled={!!seleccionado && !!form.origen_texto}
                  >
                    <MenuItem value="">— Sin origen —</MenuItem>
                    {instalaciones.map((i) => (
                      <MenuItem
                        key={i.fi_instalacion_id}
                        value={i.nombre_instalacion}
                      >
                        {i.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    size="small"
                    label="Origen externo"
                    name="origen_texto"
                    value={form.origen_texto}
                    onChange={handleChange}
                    fullWidth
                    disabled={!!seleccionado && !!form.origen_instalacion}
                  />
                </Grid>

                {/* DESTINO */}
                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    size="small"
                    label="Destino"
                    name="fc_instalacion"
                    value={form.fc_instalacion}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">Seleccione</MenuItem>
                    {instalaciones.map((i) => (
                      <MenuItem
                        key={i.fi_instalacion_id}
                        value={i.nombre_instalacion}
                      >
                        {i.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* MACHOS, HEMBRAS, CANTIDAD */}
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Machos"
                    name="fn_machos"
                    value={form.fn_machos}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Hembras"
                    name="fn_hembras"
                    value={form.fn_hembras}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Cantidad"
                    value={formatNumber(form.fn_cantidad)}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>

                {/* TALLA */}
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Talla (gr)"
                    name="fn_talla"
                    value={form.fn_talla}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                {/* LINEA – FAMILIA – RATIO */}
                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Línea"
                    name="fc_linea"
                    value={form.fc_linea}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Familia"
                    name="fc_familia"
                    value={form.fc_familia}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={4}>
                  <TextField
                    size="small"
                    label="Ratio"
                    value={form.fc_ratio}
                    InputProps={{ readOnly: true }}
                    fullWidth
                  />
                </Grid>

                {/* FECHAS */}
                <Grid item xs={6}>
                  <TextField
                    type="date"
                    size="small"
                    label="Fecha siembra"
                    name="fd_fecha_siembra"
                    value={form.fd_fecha_siembra}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    type="date"
                    size="small"
                    label="Última biometría"
                    name="fd_fecha_biometria"
                    value={form.fd_fecha_biometria}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* OBSERVACIÓN */}
                <Grid item xs={12}>
                  <TextField
                    size="small"
                    label="Observación"
                    name="fc_observacion"
                    value={form.fc_observacion}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                {seleccionado ? (
                  <Button variant="contained" color="success" onClick={guardarEdicion}>
                    GUARDAR
                  </Button>
                ) : (
                  <Button variant="contained" color="success" onClick={registrarReproductor}>
                    REGISTRAR
                  </Button>
                )}

                <Button variant="outlined" onClick={limpiarFormulario}>
                  CANCELAR
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {/* TABLA PRINCIPAL */}
      <Paper sx={{ mb: 6, overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Instalación</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla</TableCell>
              <TableCell>Machos</TableCell>
              <TableCell>Hembras</TableCell>
              <TableCell>Ratio</TableCell>
              <TableCell>Línea</TableCell>
              <TableCell>Familia</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Fecha siembra</TableCell>
              <TableCell>Días en pila</TableCell>
              <TableCell>Últ. biometría</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reproductores.map((r) => {
              const dias = calcularDias(r.fd_fecha_siembra);

              return (
                <TableRow key={r.fi_reproductor_id}>
                  <TableCell>{r.fc_instalacion}</TableCell>
                  <TableCell>{formatNumber(r.fn_cantidad)}</TableCell>
                  <TableCell>{formatNumber(r.fn_talla)}</TableCell>
                  <TableCell>{formatNumber(r.fn_machos)}</TableCell>
                  <TableCell>{formatNumber(r.fn_hembras)}</TableCell>
                  <TableCell>{r.fc_ratio || "—"}</TableCell>
                  <TableCell>{r.fc_linea || "—"}</TableCell>
                  <TableCell>{r.fc_familia || "—"}</TableCell>
                  <TableCell>{r.fc_observacion || "—"}</TableCell>
                  <TableCell>{formatFecha(r.fd_fecha_siembra)}</TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: colorDias(dias),
                      textAlign: "center",
                    }}
                  >
                    {dias ?? "—"}
                  </TableCell>

                  <TableCell>{formatFecha(r.fd_fecha_biometria)}</TableCell>

                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton color="primary" onClick={() => editarReproductor(r)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Eliminar">
                      <IconButton color="error" onClick={() => eliminarReproductor(r.fi_reproductor_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Trazar movimiento">
                      <IconButton color="success" onClick={() => trazarReproductor(r)}>
                        <SyncAltIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* TRAZABILIDAD */}
      <Typography variant="h6" sx={{ color: "#E65100", mt: 5, mb: 2 }}>
        🔁 Trazabilidad de Movimientos
      </Typography>

      <Paper sx={{ mb: 6, overflowX: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Observación</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rastreos.map((r) => (
              <TableRow key={r.fi_movimiento_id}>
                <TableCell>{r.origen || "—"}</TableCell>
                <TableCell>{r.destino || "—"}</TableCell>
                <TableCell>{formatNumber(r.cantidad_trasladada)}</TableCell>
                <TableCell>{formatFecha(r.fecha_movimiento)}</TableCell>
                <TableCell>{r.observacion || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
