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
  return <PiletaContent />;
}

function PiletaContent() {
  const usuario_id = localStorage.getItem("usuario_id");

  const [form, setForm] = useState({
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
  const [, setLotes] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
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
      const data = await apiFetch(`/piletas/inventario/${granja}`);
      setInventario(data || []);
    } catch (error) {
      console.error("❌ Error inventario:", error);
    }
  }, [granjaActiva]);

  const obtenerLotes = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const data = await apiFetch(`/piletas/lotes/${granja}`);
      setLotes(data || []);
    } catch (error) {
      console.error("❌ Error lotes:", error);
    }
  }, [granjaActiva]);

  const obtenerInstalaciones = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const data = await apiFetch(`/piletas/origen/${granja}`);
      setInstalaciones(data || []);
    } catch (error) {
      console.error("❌ Error instalaciones:", error);
    }
  }, [granjaActiva]);

  const obtenerRastreos = useCallback(async () => {
    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const data = await apiFetch(`/piletas/movimientos/${usuario_id}/${granja}`);
      setRastreos(data || []);
    } catch (error) {
      console.error("❌ Error trazabilidad:", error);
    }
  }, [granjaActiva, usuario_id]);

  const limpiarFormulario = useCallback(() => {
    setForm({
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
  }, [granjaActiva]);

  /* ============================================================
      CARGAR TODO CUANDO CAMBIA LA GRANJA
  ============================================================ */
  useEffect(() => {
    limpiarFormulario();
    obtenerInventario();
    obtenerLotes();
    obtenerInstalaciones();
    obtenerRastreos();
  }, [limpiarFormulario, obtenerInventario, obtenerLotes, obtenerInstalaciones, obtenerRastreos]);

  /* ============================================================
     ORIGEN = CARGAR LOTE REAL DESDE BACKEND
  ============================================================ */
  const handleOrigenLote = async (valor) => {
    if (!valor) {
      setForm({
        ...form,
        origen_instalacion: "",
        origen_externo: "",
        fi_lote_id: "",
        no_lote: "",
      });
      return;
    }

    try {
      const granja = encodeURIComponent(normalizarGranja(granjaActiva));
      const data = await apiFetch(`/piletas/lote-por-inst/${valor}/${granja}`);

      setForm({
        ...form,
        origen_instalacion: valor,
        origen_externo: "",
        fi_lote_id: data?.fi_lote_id || "",
        no_lote: data?.no_lote || "",
      });
    } catch (error) {
      console.error("❌ Error cargando lote:", error);
    }
  };

  /* ============================================================
     DESTINO = Instalación Alevinaje
  ============================================================ */
  const handleInstalacionDestino = (id) => {
    setForm({ ...form, fi_instalacion_id: id });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "origen_externo") {
      setForm({
        ...form,
        origen_externo: value,
        origen_instalacion: "",
        fi_lote_id: "",
        no_lote: "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };


  /* ============================================================
      REGISTRAR
  ============================================================ */
  const registrarPileta = async () => {
    try {
      const response = await apiFetch("/piletas/siembra", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_usuario_id: usuario_id,
          fc_granja: granjaActiva,
        }),
      });

      if (response.error) throw new Error(response.error);

      alert("✅ Siembra registrada correctamente");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ============================================================
      ACTUALIZAR
  ============================================================ */
  const actualizarPileta = async () => {
    if (!seleccionado) return alert("Seleccione un registro");

    try {
      const response = await apiFetch("/piletas/siembra", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fi_pileta_id: seleccionado,
          fi_usuario_id: usuario_id,
        }),
      });

      if (response.error) throw new Error(response.error);

      alert("✅ Registro actualizado");
      limpiarFormulario();
      obtenerInventario();
      obtenerRastreos();
    } catch (err) {
      alert(err.message);
    }
  };

  /* ============================================================
      ELIMINAR
  ============================================================ */
  const eliminarPileta = async () => {
    if (!seleccionado) return alert("Seleccione una pileta");

    try {
      await apiFetch(`/piletas/${seleccionado}`, { method: "DELETE" });
      alert("🗑️ Pileta eliminada");
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

      const data = await apiFetch(
        `/piletas/movimientos/filtro/${usuario_id}/${granja}?${params}`
      );

      setRastreos(data);
    } catch (error) {
      console.error("❌ Error filtrado:", error);
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
    } catch (err) {
      console.error(err);
    }
  };

  const eliminarTodos = async () => {
    if (!window.confirm(`Eliminar trazabilidad completa de ${granjaActiva}?`))
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
        🧬 Control de Alevinaje — Sistema
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

              {/* ORIGEN */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                select
                label="Origen"
                name="origen_instalacion"
                value={form.origen_instalacion}
                onChange={(e) => handleOrigenLote(String(e.target.value))}   
                fullWidth
              >
                <MenuItem value="">Seleccione origen</MenuItem>

                {instalaciones.map((i) => (
                  <MenuItem key={i.fi_instalacion_id} value={i.fi_instalacion_id}>
                    {i.nombre_instalacion}
                  </MenuItem>
                ))}
              </TextField>

                <TextField
                  label="Origen externo (texto manual)"
                  name="origen_externo"
                  value={form.origen_externo}
                  onChange={handleChange}
                  fullWidth
                  sx={{ mt: 2 }}
                />
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
                  value={form.no_lote}
                  fullWidth
                  slotProps={{ input: { readOnly: true } }}
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
        📋 Inventario
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: "hidden", mb: 4, p: 2 }}>
        <Table stickyHeader>
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
            {inventario.map((p) => (
              <TableRow key={p.fi_pileta_id} hover onClick={() => seleccionarPileta(p)}>
                <TableCell>{p.nombre_instalacion}</TableCell>
                <TableCell>{formatNumber(p.cantidad)}</TableCell>
                <TableCell>{formatNumber(p.talla_gr)}</TableCell>
                <TableCell>{p.no_lote}</TableCell>
                <TableCell>{p.observacion}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* TRAZABILIDAD */}
      <Typography variant="h6" mt={5} mb={2} color="#E65100">
        🔁 Trazabilidad
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

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Origen</TableCell>
              <TableCell>Destino</TableCell>
              <TableCell>Trasladados</TableCell>
              <TableCell>Fecha</TableCell>
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
