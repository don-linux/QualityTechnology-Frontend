import React, { useEffect, useState, useCallback } from "react";
import {
  getInventario,
  getLotes,
  getDestinos,
  getOrigenes,
  getMovimientos,
  registrarMovimiento,
  registrarSiembra,
  removePileta,
  filtrarMovimientos,
  eliminarMovimiento,
  eliminarTodosMovimientos,
} from "../services/piletasService";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

const MAX_NUMERICO = 15;
const MAX_OBSERVACION = 500;
const TRUNCAR_MAX = 40;
const truncar = (texto) =>
  texto && texto.length > TRUNCAR_MAX ? texto.slice(0, TRUNCAR_MAX) + "…" : texto;

const soloEntero = (valor) => valor === "" || /^\d+$/.test(valor);
const soloDecimal = (valor) => valor === "" || /^\d*\.?\d*$/.test(valor);

/* ============================================================
   NORMALIZAR GRANJA PARA BACKEND (SIN ACENTOS Y CORRECTO)
 ============================================================ */
const normalizarGranja = (g) => {
  if (!g) return "Granja Acuícola Medellin";

  const txt = g
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (txt.includes("ceib")) return "Granja Acuícola La Ceiba";

  return "Granja Acuícola Medellin";
};


export default function Pileta() {
  const auth = useAuth();
  const usuario_id = auth.usuarioId;
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const getRequiredFields = (tipoOrigen) => {
    const base = [
      "tipo_origen", "fi_instalacion_id", "no_lote", "cantidad",
      "talla_gr", "observacion", "fecha_siembra", "fecha_ultima_biometria",
    ];
    if (tipoOrigen === "INTERNO") return [...base, "origen_instalacion", "fi_lote_id"];
    return [...base, "origen_externo"];
  };

  const [form, setForm] = useState({
    tipo_origen: "INTERNO",
    fi_instalacion_id: "",
    origen_instalacion: "",
    origen_externo: "",
    fi_lote_id: "",
    no_lote: "",
    cantidad: "",
    talla_gr: "",
    observacion: "",
    fecha_siembra: "",
    fecha_ultima_biometria: "",
    fc_granja: "Granja Acuícola Medellin",
  });

  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellin");
  const [inventario, setInventario] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [origenesDisponibles, setOrigenesDisponibles] = useState([]);
  const [rastreos, setRastreos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const formatNumber = (num) =>
    num || num === 0 ? Number(num).toLocaleString("en-US") : "—";

  const getBadgeStyle = (dias) => {
    if (dias <= 10)
      return { backgroundColor: "#4CAF50", color: "white", borderRadius: 12, padding: "6px 12px" };
    if (dias <= 15)
      return { backgroundColor: "#FFC107", color: "#333", borderRadius: 12, padding: "6px 12px" };
    return { backgroundColor: "#F44336", color: "white", borderRadius: 12, padding: "6px 12px" };
  };

  /* ============================================================
      PETICIONES API
  ============================================================ */
  const obtenerInventario = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await getInventario(granja);
      setInventario(data || []);
    } catch (error) {
      console.error(" Error inventario:", error);
    }
  }, [granjaActiva]);

  const obtenerLotes = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await getLotes(granja);
      setLotes(data || []);
    } catch (error) {
      console.error(" Error lotes:", error);
    }
  }, [granjaActiva]);

  const obtenerInstalaciones = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await getDestinos(granja);
      setInstalaciones(data || []);
    } catch (error) {
      console.error(" Error instalaciones:", error);
    }
  }, [granjaActiva]);

  const obtenerOrigenes = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await getOrigenes(granja);
      setOrigenesDisponibles(data || []);
    } catch (error) {
      console.error(" Error origenes:", error);
    }
  }, [granjaActiva]);

  const obtenerRastreos = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const { data } = await getMovimientos(usuario_id, granja);
      setRastreos(data || []);
    } catch (error) {
      console.error("Error trazabilidad:", error);
    }
  }, [granjaActiva, usuario_id]);

  const limpiarFormulario = useCallback(() => {
    setForm({
      tipo_origen: "INTERNO",
      fi_instalacion_id: "",
      origen_instalacion: "",
      origen_externo: "",
      fi_lote_id: "",
      no_lote: "",
      cantidad: "",
      talla_gr: "",
      observacion: "",
      fecha_siembra: "",
      fecha_ultima_biometria: "",
      fc_granja: granjaActiva,
    });
    setSeleccionado(null);
    setMostrarFormulario(false);
    clearErrors();
  }, [granjaActiva, clearErrors]);

  /* ============================================================
      CARGAR TODO CUANDO CAMBIA LA GRANJA
  ============================================================ */
  useEffect(() => {
    limpiarFormulario();
    obtenerInventario();
    obtenerLotes();
    obtenerInstalaciones();
    obtenerOrigenes();
    obtenerRastreos();
  }, [limpiarFormulario, obtenerInventario, obtenerLotes, obtenerInstalaciones, obtenerOrigenes, obtenerRastreos]);

  /* ============================================================
     ORIGEN = CARGAR LOTE REAL DESDE BACKEND
  ============================================================ */
  const handleOrigenLote = (valor) => {
    if (!valor) {
      setForm((prev) => ({
        ...prev,
        origen_instalacion: "",
        origen_externo: "",
        fi_lote_id: "",
        no_lote: "",
      }));
      return;
    }

    const instalacion = origenesDisponibles.find(i => i.fi_instalacion_id === Number(valor));
    
    if (instalacion) {
      setForm((prev) => ({
        ...prev,
        origen_instalacion: Number(valor),
        origen_externo: "",
        fi_lote_id: instalacion.fi_lote_id || "",
        no_lote: instalacion.no_lote || "",
      }));
    }
  };

  /* ============================================================
     DESTINO = Instalación Alevinaje
  ============================================================ */
  const handleInstalacionDestino = (id) => {
  setForm({ ...form, fi_instalacion_id: Number(id) });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cantidad") {
      if (!soloEntero(value)) return;
      setForm({ ...form, cantidad: value });
      clearFieldError(name);
      return;
    }

    if (name === "talla_gr") {
      if (!soloDecimal(value)) return;
      setForm({ ...form, talla_gr: value });
      clearFieldError(name);
      return;
    }

    if (name === "origen_externo") {
      setForm({
        ...form,
        origen_externo: value,
        origen_instalacion: "",
        fi_lote_id: "",
        no_lote: "",
      });
      clearFieldError(name);
      return;
    }

    setForm({ ...form, [name]: value });
    clearFieldError(name);
  };


  /* ============================================================
      REGISTRAR
  ============================================================ */
  const registrarPileta = async () => {
    if (!validate(form, getRequiredFields(form.tipo_origen))) return;
    try {
      const dataPayload = {
        ...form,
        tipo_movimiento: form.fi_instalacion_id ? "TRASLADO" : "MORTALIDAD",
        fi_usuario_id: usuario_id,
        fc_granja: granjaActiva,
      };

      const { data: response } = await registrarMovimiento(dataPayload);

      if (response.error) throw new Error(response.error);

      showSnackbar("Siembra registrada correctamente", "success");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (err) {
      showSnackbar("Error: " + err.message, "error");
    }
  };

  /* ============================================================
      ACTUALIZAR
  ============================================================ */
  const actualizarPileta = async () => {
    if (!seleccionado) return showSnackbar("Seleccione un registro", "warning");
    if (!validate(form, getRequiredFields(form.tipo_origen))) return;

    try {
      const dataPayload = {
        ...form,
        fi_pileta_id: seleccionado,
        fi_usuario_id: usuario_id,
      };

      const { data: response } = await registrarSiembra(dataPayload);

      if (response.error) throw new Error(response.error);

      showSnackbar("Registro actualizado", "success");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (err) {
      showSnackbar(err.message, "error");
    }
  };

  /* ============================================================
      ELIMINAR
  ============================================================ */
  const eliminarPileta = async () => {
    if (!seleccionado) return showSnackbar("Seleccione una pileta", "warning");

    try {
      await removePileta(seleccionado);
      showSnackbar("Pileta eliminada", "success");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================================================
      SELECCIÓN DE FILA EN TABLA
  ============================================================ */
  const seleccionarPileta = (p) => {
    clearErrors();
    setSeleccionado(p.fi_pileta_id);
    setForm({
      fi_instalacion_id: p.fi_instalacion_id,
      origen_instalacion: p.origen_instalacion,
      fi_lote_id: p.fi_lote_id,
      no_lote: p.no_lote,
      cantidad: p.cantidad,
      talla_gr: p.talla_gr,
      observacion: p.observacion,
      fecha_siembra: p.fecha_siembra?.substring(0, 10),
      fecha_ultima_biometria: p.fecha_ultima_biometria?.substring(0, 10),
      fc_granja: p.fc_granja,
    });
    setMostrarFormulario(true);
  };

  /* ============================================================
     FILTRADO TRAZABILIDAD
  ============================================================ */
  const filtrarRastreabilidad = async () => {
    try {
      const params = new URLSearchParams({
        buscar,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }).toString();

      const granja = encodeURIComponent(normalizarGranja(granjaActiva));

      const { data } = await filtrarMovimientos(usuario_id, granja, params);

      setRastreos(data);
    } catch (error) {
      console.error("Error filtrado:", error);
    }
  };

  const eliminarUno = async (id) => {
    if (!await confirm("¿Eliminar este movimiento?")) return;

    try {
      await eliminarMovimiento(id);
      filtrarRastreabilidad();
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarTodos = async () => {
    if (!await confirm(`Eliminar trazabilidad completa de ${granjaActiva}?`))
      return;

    try {
      await eliminarTodosMovimientos(granjaActiva);

      setRastreos([]);
    } catch (err) {
      console.error(err);
    }
  };

  /* ============================================================
      RENDER COMPLETO
  ============================================================ */

  const totalOrganismos = inventario.reduce(
    (acc, p) => acc + (p.cantidad || 0),
    0
  );

  return (
    <Box>

      <Typography variant="h4" fontWeight="bold" mb={2} color="#004C7D">
         Control de Alevinaje — Sistema
      </Typography>

      {/* BOTONES DE GRANJA */}
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

      {/* RESUMEN */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: "#E3F2FD" }}>
        <Typography><b>Granja activa:</b> {granjaActiva.replace("Granja Acuícola ", "")}</Typography>
        <Typography><b>Total instalaciones:</b> {inventario.length}</Typography>
        <Typography><b>Total organismos:</b> {totalOrganismos.toLocaleString("es-MX")}</Typography>
      </Paper>

      {/* BOTÓN AGREGAR */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "OCULTAR FORMULARIO" : "+ NUEVO REGISTRO"}
        </Button>
      </Box>

      {/* FORMULARIO */}
      {mostrarFormulario && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>

             {/* TIPO ORIGEN */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Tipo de origen"
                  name="tipo_origen"
                  value={form.tipo_origen}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.tipo_origen}
                  helperText={errors.tipo_origen}
                >
                  <MenuItem value="INTERNO">Interno</MenuItem>
                  <MenuItem value="EXTERNO">Externo</MenuItem>
                </TextField>

                {/* ORIGEN INTERNO */}
                {form.tipo_origen === "INTERNO" && (
                  <TextField
                    select
                    label="Instalación origen"
                    name="origen_instalacion"
                    value={form.origen_instalacion}
                    onChange={(e) => handleOrigenLote(e.target.value)}
                    fullWidth
                    sx={{ mt: 2 }}
                    error={!!errors.origen_instalacion}
                    helperText={errors.origen_instalacion}
                  >
                    <MenuItem value="">Seleccione origen</MenuItem>

                    {origenesDisponibles.map((i) => (
                      <MenuItem key={i.fi_instalacion_id} value={i.fi_instalacion_id}>
                        {i.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                {/* ORIGEN EXTERNO */}
                {form.tipo_origen === "EXTERNO" && (
                  <>
                  <TextField
                    label="Origen externo"
                    name="origen_externo"
                    value={form.origen_externo}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mt: 2 }}
                    error={!!errors.origen_externo}
                    helperText={errors.origen_externo}
                  />
                  </>
                )}
              </Grid>

              {/* DESTINO */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Destino"
                  name="fi_instalacion_id"
                  value={form.fi_instalacion_id}
                  onChange={(e) => handleInstalacionDestino(e.target.value)}
                  fullWidth
                  error={!!errors.fi_instalacion_id}
                  helperText={errors.fi_instalacion_id}
                >
                  <MenuItem value="">Seleccione instalación</MenuItem>

                  {instalaciones.map((inst) => (
                    <MenuItem key={inst.fi_instalacion_id} value={inst.fi_instalacion_id}>
                      {inst.nombre_instalacion}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* LOTE */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Lote asignado"
                  name="no_lote"
                  value={form.no_lote}
                  onChange={handleChange}
                  fullWidth
                  slotProps={{ input: { readOnly: form.tipo_origen === "INTERNO" } }}
                  error={!!errors.no_lote}
                  helperText={errors.no_lote}
                />
              </Grid>

              {/* CANTIDAD */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Cantidad"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_NUMERICO, inputMode: "numeric" }}
                  error={!!errors.cantidad}
                  helperText={
                    errors.cantidad ||
                    `${String(form.cantidad ?? "").length}/${MAX_NUMERICO}`
                  }
                />
              </Grid>

              {/* TALLA */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Talla (Gr)"
                  name="talla_gr"
                  value={form.talla_gr}
                  onChange={handleChange}
                  fullWidth
                  inputProps={{ maxLength: MAX_NUMERICO, inputMode: "decimal" }}
                  error={!!errors.talla_gr}
                  helperText={
                    errors.talla_gr ||
                    `${String(form.talla_gr ?? "").length}/${MAX_NUMERICO}`
                  }
                />
              </Grid>

              {/* OBSERVACIÓN */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Observación"
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  inputProps={{ maxLength: MAX_OBSERVACION }}
                  error={!!errors.observacion}
                  helperText={
                    errors.observacion ||
                    `${String(form.observacion ?? "").length}/${MAX_OBSERVACION}`
                  }
                />
              </Grid>

              {/* FECHAS */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  label="Fecha Siembra"
                  name="fecha_siembra"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_siembra}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fecha_siembra}
                  helperText={errors.fecha_siembra}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  type="date"
                  label="Última Biometría"
                  name="fecha_ultima_biometria"
                  InputLabelProps={{ shrink: true }}
                  value={form.fecha_ultima_biometria}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.fecha_ultima_biometria}
                  helperText={errors.fecha_ultima_biometria}
                />
              </Grid>
            </Grid>

            {/* BOTONES */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button variant="contained" color="success" onClick={registrarPileta}>
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

      {/* INVENTARIO */}
      <Typography variant="h6" color="#00796B" fontWeight="bold" mb={2}>
        Inventario
      </Typography>

      <Paper sx={{ width: "100%", mb: 4 }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell>Instalación</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Talla</TableCell>
                <TableCell>Lote</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell>Fecha Siembra</TableCell>
                <TableCell>Días en pila</TableCell>
                <TableCell>Última Biometría</TableCell>
                <TableCell>Días transcurridos</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {inventario.map((p) => {
                const textoObs = p.etapa_hormonal || p.observacion || "";
                return (
                  <TableRow key={p.fi_pileta_id} hover onClick={() => seleccionarPileta(p)}>
                    <TableCell>{p.nombre_instalacion}</TableCell>
                    <TableCell>{formatNumber(p.cantidad)}</TableCell>
                    <TableCell>{formatNumber(p.talla_gr)}</TableCell>
                    <TableCell>{p.no_lote}</TableCell>
                    <TableCell sx={{ maxWidth: 160 }}>
                      <span title={textoObs}>{truncar(textoObs)}</span>
                    </TableCell>
                    <TableCell>
                      {p.fecha_siembra
                        ? new Date(p.fecha_siembra).toLocaleDateString("es-MX")
                        : "—"}
                    </TableCell>
                    <TableCell>{p.dias_en_pila}</TableCell>
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
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* TRAZABILIDAD */}
      <Typography variant="h6" mt={5} mb={2} color="#E65100">
        Trazabilidad
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label="Buscar"
            fullWidth
            size="small"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            label="Fecha inicio"
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            label="Fecha fin"
            size="small"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
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

      <Paper sx={{ width: "100%" }}>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell>Origen</TableCell>
                <TableCell>Destino</TableCell>
                <TableCell>Trasladados</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell align="center" sx={{ minWidth: 180, whiteSpace: "nowrap" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rastreos.map((r) => (
                <TableRow key={r.fi_movimiento_id}>
                  <TableCell>{r.origen_nombre || "—"}</TableCell>
                  <TableCell>{r.destino_nombre || "—"}</TableCell>
                  <TableCell>{r.cantidad}</TableCell>
                  <TableCell>
                    {r.fecha_movimiento
                      ? new Date(r.fecha_movimiento).toLocaleDateString("es-MX")
                      : "—"}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 160 }}>
                    <span title={r.observacion}>{truncar(r.observacion)}</span>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ minWidth: 180, verticalAlign: "middle", whiteSpace: "nowrap" }}
                  >
                    <Box sx={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "nowrap" }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => eliminarUno(r.fi_movimiento_id)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {ConfirmModal}
    </Box>
  );
}
