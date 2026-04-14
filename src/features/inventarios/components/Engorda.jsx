import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Delete from "@mui/icons-material/Delete";
import Clear from "@mui/icons-material/Clear";
import axios from "../utils/axiosInstance.js";
import useFormValidation from "../hooks/useFormValidation";
import useConfirm from "../hooks/useConfirm";

const normalizarGranja = (g) => {
  if (!g) return "Granja Acu\u00EDcola Medellin";
  const txt = g.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (txt.includes("ceib")) return "Granja Acu\u00EDcola La Ceiba";
  return "Granja Acu\u00EDcola Medellin";
};

export default function Engorda() {
  return <EngordaContent />;
}

function EngordaContent() {
  const usuario_id = localStorage.getItem("usuario_id");
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "origen_instalacion", "fi_instalacion_id", "cantidad",
    "talla_gr", "no_lote", "observacion", "fecha_siembra",
    "fecha_biometria",
  ];

  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellín");
  const [engordas, setEngordas] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [lotes, setLotes] = useState([]); 
  const [form, setForm] = useState({});
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const formatNumber = (num) => {
    if (num === null || num === undefined || num === "") return "—";
    const n = Number(num);
    return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toString();
  };

  /* =========================================================
       OBTENER DATOS
  ========================================================= */
  const obtenerInstalaciones = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await axios.get(`/instalaciones/tipo/Engorda/${granja}`);
      setInstalaciones(data || []);
    } catch (err) {
      console.error(" Error al obtener instalaciones:", err);
    }
  }, [granjaActiva]);

  const obtenerLotes = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await axios.get(`/piletas/inventario/${granja}`);
      setLotes(data || []);
    } catch (err) {
      console.error(" Error al obtener lotes:", err);
    }
  }, [granjaActiva]);

  const obtenerEngordas = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await axios.get(`/engorda/granja/${granja}`);
      setEngordas(data || []);
    } catch (err) {
      console.error("Error al obtener engordas:", err);
    }
  }, [granjaActiva]);

  const obtenerMovimientos = useCallback(async () => {
    try {
      const { data } = await axios.get(`/engorda/movimientos/${usuario_id}`);
      setMovimientos(data || []);
    } catch (err) {
      console.error("Error al obtener movimientos:", err);
    }
  }, [usuario_id]);

  const limpiarFormulario = useCallback(() => {
    setForm({
      origen_instalacion: "",
      fi_instalacion_id: "",
      cantidad: "",
      talla_gr: "",
      no_lote: "",
      observacion: "",
      fecha_siembra: "",
      fecha_biometria: "",
      fc_granja: granjaActiva,
      fi_usuario_id: usuario_id,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    clearErrors();
  }, [granjaActiva, usuario_id, clearErrors]);

  useEffect(() => {
    limpiarFormulario();
    obtenerEngordas();
    obtenerMovimientos();
    obtenerInstalaciones();
    obtenerLotes();
  }, [limpiarFormulario, obtenerEngordas, obtenerMovimientos, obtenerInstalaciones, obtenerLotes]);

  /* =========================================================
       FORMULARIO Y CAMBIOS
  ========================================================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  //  Nueva función para manejar el cambio de origen (Lote)
  const handleOrigenLote = (loteId) => {
    const lote = lotes.find((l) => l.fi_lote_id === loteId);
    setForm({
      ...form,
      origen_instalacion: loteId,
      no_lote: lote?.no_lote || "",
      talla_gr: lote?.talla_gr || "",
      cantidad: "",
      fecha_siembra: lote?.fecha_siembra?.substring(0, 10) || "",
    });
  };

  /* =========================================================
       CRUD
  ========================================================= */
  const registrarEngorda = async () => {
    if (!validate(form, requiredFields)) return;

    try {
      await axios.post("/engorda", {
        ...form,
        origen_id: form.origen_instalacion,
        fi_instalacion_id: form.fi_instalacion_id,
      });

      alert(" Registro agregado correctamente");
      obtenerEngordas();
      obtenerLotes(); // Refrescar lotes por si cambió el inventario
      limpiarFormulario();
    } catch (err) {
      alert("Error al registrar engorda: " + (err.response?.data?.error || err.message));
    }
  };

  const actualizarEngorda = async () => {
    if (!seleccionado) return;
    if (!validate(form, requiredFields)) return;
    try {
      await axios.post("/engorda", {
        ...form,
        fi_engorda_id: seleccionado,
      });

      alert(" Registro actualizado");
      obtenerEngordas();
      limpiarFormulario();
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  const eliminarEngorda = async () => {
    if (!await confirm("¿Eliminar este registro?")) return;
    try {
      await axios.delete(`/engorda/${seleccionado}`);
      alert(" Eliminado");
      obtenerEngordas();
      limpiarFormulario();
    } catch (err) {
      console.error(err);
    }
  };

  const seleccionarRegistro = (e) => {
    clearErrors();
    setSeleccionado(e.fi_engorda_id);
    setForm({
      fi_instalacion_id: e.fi_instalacion_id,
      origen_instalacion: e.fi_lote_id,
      cantidad: e.cantidad,
      talla_gr: e.talla_gr,
      no_lote: e.no_lote,
      observacion: e.observacion,
      fecha_siembra: e.fecha_siembra?.substring(0, 10) || "",
      fecha_biometria: e.fecha_biometria?.substring(0, 10) || "",
      fc_granja: e.fc_granja,
    });
    setMostrarFormulario(true);
  };

  const eliminarMovimiento = async (id) => {
    if (!await confirm("¿Eliminar este movimiento?")) return;
    try {
      await axios.delete(`/engorda/movimientos/${id}`);
      obtenerMovimientos();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeStyle = (dias) => {
  if (dias <= 15)
    return { backgroundColor: "#4CAF50", color: "white", borderRadius: 12, padding: "6px 12px" };

  if (dias <= 25)
    return { backgroundColor: "#FFC107", color: "#333", borderRadius: 12, padding: "6px 12px" };

  return { backgroundColor: "#F44336", color: "white", borderRadius: 12, padding: "6px 12px" };
};

  const totalCantidad = engordas.reduce((acc, e) => acc + Number(e.cantidad || 0), 0);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
         Módulo de Engorda — Sistema
      </Typography>

      {/*  Selección de granja */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button variant={granjaActiva.includes("Medellín") ? "contained" : "outlined"} color="primary" onClick={() => setGranjaActiva("Granja Acuícola Medellín")}>
          MEDELLÍN
        </Button>
        <Button variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"} color="secondary" onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}>
          LA CEIBA
        </Button>
      </Box>

      {/*  Resumen */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD", boxShadow: 2 }}>
        <Typography><b>Granja activa:</b> {granjaActiva.replace("Granja Acuícola ", "")}</Typography>
        <Typography><b>Registros en tina:</b> {engordas.length}</Typography>
        <Typography><b>Total organismos en engorda:</b> {totalCantidad.toLocaleString("es-MX")}</Typography>
      </Paper>

      {/*  Formulario */}
      <Paper sx={{ borderRadius: 3, p: 3, backgroundColor: "#FAFAFA", boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" color="#00796B" fontWeight="bold"> Registro / Traslado de Engorda</Typography>
          <Button variant="contained" color="success" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
            {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
          </Button>
        </Box>

        {mostrarFormulario && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                {/* 1. ORIGEN */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="Origen"
                    name="origen_instalacion"
                    value={form.origen_instalacion || ""}
                    onChange={(e) => handleOrigenLote(e.target.value)}
                    fullWidth
                    error={!!errors.origen_instalacion}
                    helperText={errors.origen_instalacion}
                  >
                    <MenuItem value="">Seleccione Lote de Inventario</MenuItem>
                    {lotes.map((l) => (
                      <MenuItem key={l.fi_lote_id} value={l.fi_lote_id}>
                        {`${l.no_lote} — ${l.nombre_instalacion} (${l.cantidad} org)`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* 2.DESTINO */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    label="Destino"
                    name="fi_instalacion_id"
                    value={form.fi_instalacion_id || ""}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.fi_instalacion_id}
                    helperText={errors.fi_instalacion_id}
                  >
                    <MenuItem value="">Seleccione un destino</MenuItem>
                    {instalaciones.map((i) => (
                      <MenuItem key={i.fi_instalacion_id} value={i.fi_instalacion_id}>
                        {i.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Cantidad a Sembrar" name="cantidad" type="number" value={form.cantidad || ""} onChange={handleChange} fullWidth error={!!errors.cantidad} helperText={errors.cantidad} />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="Talla (Gr)" name="talla_gr" type="number" value={form.talla_gr || ""} onChange={handleChange} fullWidth error={!!errors.talla_gr} helperText={errors.talla_gr} />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField label="No. Lote" name="no_lote" value={form.no_lote || ""} fullWidth slotProps={{ input: { readOnly: true } }} error={!!errors.no_lote} helperText={errors.no_lote} />
                </Grid>

                <Grid size={12}>
                  <TextField label="Observación" name="observacion" value={form.observacion || ""} onChange={handleChange} fullWidth multiline rows={2} error={!!errors.observacion} helperText={errors.observacion} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField type="date" label="Fecha Siembra" name="fecha_siembra" InputLabelProps={{ shrink: true }} value={form.fecha_siembra || ""} onChange={handleChange} fullWidth error={!!errors.fecha_siembra} helperText={errors.fecha_siembra} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField type="date" label="Fecha Biometría" name="fecha_biometria" InputLabelProps={{ shrink: true }} value={form.fecha_biometria || ""} onChange={handleChange} fullWidth error={!!errors.fecha_biometria} helperText={errors.fecha_biometria} />
                </Grid>
              </Grid>

              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
                <Button variant="contained" color="success" onClick={seleccionado ? actualizarEngorda : registrarEngorda}>
                   {seleccionado ? "Actualizar" : "Registrar"}
                </Button>
                {seleccionado && <Button variant="contained" color="error" onClick={eliminarEngorda}><Delete /> Eliminar</Button>}
                <Button variant="outlined" onClick={limpiarFormulario}><Clear /> Limpiar</Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabla principal */}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Instalación</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Talla (Gr)</TableCell>
              <TableCell>No. Lote</TableCell>
              <TableCell>Fecha Siembra</TableCell>
              <TableCell>Días en Pila</TableCell>
              <TableCell>Fecha Biometría</TableCell>
              <TableCell>Días Transcurridos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engordas.map((e) => (
              <TableRow key={e.fi_engorda_id} hover onClick={() => seleccionarRegistro(e)} style={{ cursor: "pointer" }}>
                <TableCell>{e.destino_nombre}</TableCell>
                <TableCell>{formatNumber(e.cantidad)}</TableCell>
                <TableCell>{formatNumber(e.talla_gr)}</TableCell>
                <TableCell>{e.no_lote}</TableCell>
                <TableCell>{e.fecha_siembra ? new Date(e.fecha_siembra).toLocaleDateString("es-MX") : "—"}</TableCell>
                <TableCell>{e.dias_en_pila}</TableCell>
                <TableCell>{e.fecha_biometria ? new Date(e.fecha_biometria).toLocaleDateString("es-MX") : "—"}</TableCell>
                <TableCell><span style={getBadgeStyle(e.dias_transcurridos)}>{e.dias_transcurridos}</span></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/*  TRAZABILIDAD */}
      <Typography variant="h6" mt={5} mb={2} color="#E65100"> Historial de Movimientos de Engorda</Typography>
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Observación</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movimientos.map((m) => (
              <TableRow key={m.fi_movimiento_id}>
                <TableCell>{m.origen_nombre || "Siembra Lote"}</TableCell>
                <TableCell>{m.destino_nombre}</TableCell>
                <TableCell>{formatNumber(m.cantidad_trasladada)}</TableCell>
                <TableCell>{m.fecha_movimiento}</TableCell>
                <TableCell>{m.observacion}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="error" size="small" onClick={() => eliminarMovimiento(m.fi_movimiento_id)}>
                    <Delete />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      {ConfirmModal}
    </Box>
  );
}