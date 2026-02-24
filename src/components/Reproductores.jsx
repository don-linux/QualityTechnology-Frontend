import React, { useEffect, useState, useCallback } from "react";
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
  const [filtroTexto, setFiltroTexto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalInstalaciones, setTotalInstalaciones] = useState(0);
  const [totalOrganismos, setTotalOrganismos] = useState(0);
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

const CirculoNumero = ({ color, value }) => (
  <Box
    component="span"
    sx={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      bgcolor: color,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: 14,
      m: "0 auto",
    }}
  >
    {value}
  </Box>
);
  /* ===================== CARGA DE DATOS ===================== */

  const obtenerReproductores = useCallback(async () => {
    const granja = encodeURIComponent(granjaActiva);
    const data = await apiFetch(`/reproductores/granja/${granja}`);
    setReproductores(data || []);
    setTotalOrganismos(
      data?.reduce(
        (acc, r) => acc + (Number(r.fn_cantidad) || 0),
        0
      ) || 0
    );
  }, [granjaActiva]);

  const obtenerInstalaciones = useCallback(async () => {
    const granjaNormalizada = granjaActiva.includes("Ceiba")
      ? "Granja Acuícola La Ceiba"
      : "Granja Acuícola Medellin";
    const granja = encodeURIComponent(granjaNormalizada);
    const data = await apiFetch(`/instalaciones/granja/${granja}`);
    setInstalaciones(data || []);
    setTotalInstalaciones(data?.length || 0);
  }, [granjaActiva]);

  const obtenerTrazabilidad = useCallback(async () => {
    const data = await apiFetch(`/reproductores/movimientos/${granjaActiva}`);
    setRastreos(data || []);
  }, [granjaActiva]);

  useEffect(() => {
    obtenerReproductores();
    obtenerInstalaciones();
    obtenerTrazabilidad();
  }, [obtenerReproductores, obtenerInstalaciones, obtenerTrazabilidad]);

  const rastreosFiltrados = rastreos.filter((r) => {
  const texto = filtroTexto.toLowerCase();

  const coincideTexto =
    r.origen?.toLowerCase().includes(texto) ||
    r.destino?.toLowerCase().includes(texto) ||
    r.observacion?.toLowerCase().includes(texto);

  const fechaMov = new Date(r.fecha_movimiento);
  const desde = fechaInicio ? new Date(fechaInicio) : null;
  const hasta = fechaFin ? new Date(fechaFin) : null;

  const coincideFecha =
    (!desde || fechaMov >= desde) && (!hasta || fechaMov <= hasta);

  return coincideTexto && coincideFecha;
});

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
      const m = Number(updated.fn_machos || 0);
      const h = Number(updated.fn_hembras || 0);

      updated.fn_cantidad = m + h;

      if (m > 0 && h > 0) {
        const ratio = h / m;
        const redondeado = Math.round(ratio * 100) / 100;
        updated.fc_ratio = `1:${redondeado}`;
      } else {
        updated.fc_ratio = "";
      }
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
      fd_fecha_siembra: r.fd_fecha_siembra?.split("T")[0] || "",
      fd_fecha_biometria: r.fd_fecha_biometria?.split("T")[0] || "",
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
      <Paper
          elevation={0}
          sx={{
            backgroundColor: "#E3F2FD",
            p: 2,
            mb: 3,
            borderRadius: 2,
            borderLeft: "6px solid #2196F3",
          }}
        >
        <Typography><strong>Granja activa:</strong> {granjaActiva}</Typography>
        <Typography><strong>Total instalaciones:</strong> {totalInstalaciones}</Typography>
        <Typography><strong>Total organismos:</strong> {totalOrganismos}</Typography>
      </Paper>
      
     {/* Selector de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          variant={granjaActiva.includes("Medellin") ? "contained" : "outlined"}
          color="primary"
          sx={{ width: 130, fontWeight: "bold" }}
          onClick={() => setGranjaActiva("Granja Acuícola Medellin")}
        >
          MEDELLÍN
        </Button>

        <Button
          variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"}
          color="primary"
          sx={{ width: 130, fontWeight: "bold" }}
          onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}
        >
          LA CEIBA
        </Button>
      </Box>

      {/* Botón para abrir formulario */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          sx={{ fontWeight: "bold", px: 4 }}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
        </Button>
      </Box>
      
      {/* FORMULARIO */}
      <Paper sx={{ p: 3, mb: 4 }}>
        {mostrarFormulario && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                
                {/* ORIGEN */}
                <Grid size={{ xs: 12, md: 3 }}>
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

                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={{ xs: 12, md: 3 }}>
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
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Machos"
                    name="fn_machos"
                    value={form.fn_machos}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Hembras"
                    name="fn_hembras"
                    value={form.fn_hembras}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Cantidad"
                    value={formatNumber(form.fn_cantidad)}
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                </Grid>

                {/* TALLA */}
                <Grid size={4}>
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
                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Línea"
                    name="fc_linea"
                    value={form.fc_linea}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Familia"
                    name="fc_familia"
                    value={form.fc_familia}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid size={4}>
                  <TextField
                    size="small"
                    label="Ratio"
                    value={form.fc_ratio}
                    slotProps={{ input: { readOnly: true } }}
                    fullWidth
                  />
                </Grid>

                {/* FECHAS */}
                <Grid size={6}>
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

                <Grid size={6}>
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
                <Grid size={12}>
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
      <Paper sx={{ mb: 6, overflowX: "auto", p: 1 }}>
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
              <TableCell>Días transcurridos</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reproductores.map((r) => {
              const diasPila = calcularDias(r.fd_fecha_siembra);
              const diasBiometria = calcularDias(r.fd_fecha_biometria);

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

                  {/* DÍAS EN PILA (SIN SEMÁFORO) */}
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {diasPila ?? "—"}
                  </TableCell>

                  {/* FECHA BIOMETRÍA */}
                  <TableCell>{formatFecha(r.fd_fecha_biometria)}</TableCell>

                  {/* DÍAS TRANSCURRIDOS (CON SEMÁFORO) */}
                  <TableCell sx={{ textAlign: "center" }}>
                  {diasBiometria !== null ? (
                    <CirculoNumero color={colorDias(diasBiometria)} value={diasBiometria} />
                  ) : "—"}
                </TableCell>

                  {/* ACCIONES */}
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

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        size="small"
        label="Buscar"
        fullWidth
        value={filtroTexto}
        onChange={(e) => setFiltroTexto(e.target.value)}
      />

      <TextField
        type="date"
        size="small"
        label="Fecha inicio"
        value={fechaInicio}
        onChange={(e) => setFechaInicio(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <TextField
        type="date"
        size="small"
        label="Fecha fin"
        value={fechaFin}
        onChange={(e) => setFechaFin(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Button
        variant="contained"
        onClick={() => obtenerTrazabilidad()}
        sx={{ height: "40px" }}
      >
        BUSCAR
      </Button>

      <Button
        variant="outlined"
        color="error"
        sx={{ height: "40px" }}
        onClick={() => {
          setFiltroTexto("");
          setFechaInicio("");
          setFechaFin("");
        }}
      >
        LIMPIAR
      </Button>
    </Box>
    <Paper sx={{ mb: 6, overflowX: "auto", boxShadow: 2 }}>
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
           {rastreosFiltrados.map((r) => (
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