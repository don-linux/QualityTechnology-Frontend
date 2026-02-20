import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import axios from "axios";

const LotesRegistro = () => {
  const [granja, setGranja] = useState("Medellin");
  const [instalaciones, setInstalaciones] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [, setInstalacionSeleccionada] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    familia: "",
    fi_instalacion: "",
    huevos_ml: "",
    no_lote: "",
    observacion: "",
    mortalidad: "",
  });

  const validarNoLote = (value) => {
    const regex = /^[A-Za-z0-9-]*$/;
    return regex.test(value) ? value.toUpperCase() : "";
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "no_lote") {
      setFormData({ ...formData, no_lote: validarNoLote(value) });
      return;
    }

    if (name === "fi_instalacion") {
      setFormData({ ...formData, fi_instalacion: value });

      /** 🚀 Obtener familia automáticamente */
      try {
        const fam = await axios.get(
          `http://localhost:5000/lotes/familia-por-instalacion/${value}`
        );
        setFormData((prev) => ({ ...prev, familia: fam.data.fc_familia || "" }));
      } catch (err) {
        console.log("Error cargando familia:", err);
      }
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  /** --------------------------------------------------------
    Cargar instalaciones (desde REPRODUCTORES)
-------------------------------------------------------- */
useEffect(() => {
  axios
    .get(`http://localhost:5000/lotes/instalaciones/${granja}`)
    .then((res) => setInstalaciones(res.data))
    .catch((err) => console.log(err));
}, [granja]);

  /** --------------------------------------------------------
      Cargar lotes
  -------------------------------------------------------- */
  useEffect(() => {
    axios
      .get(`http://localhost:5000/lotes/granja/${granja}`)
      .then((res) => setLotes(res.data))
      .catch((err) => console.log(err));
  }, [granja]);

  /* --------------------------------------------------------
     Registrar lote
  -------------------------------------------------------- */
  const registrarLote = async () => {
    try {
      await axios.post("http://localhost:5000/lotes", {
        fecha: formData.fecha,
        familia: formData.familia,
        fi_instalacion_id: formData.fi_instalacion,
        huevos_ml: formData.huevos_ml,
        no_lote: formData.no_lote,
        observacion: formData.observacion,
        fc_granja: granja,
        mortalidad: Number(formData.mortalidad || 0),
      });

      alert("Lote registrado correctamente");
      resetFormulario();
      actualizarTabla();
    } catch (err) {
      console.error("❌ Error al registrar lote:", err);
      alert("Error al registrar el lote");
    }
  };

  /* --------------------------------------------------------
     Activar edición
  -------------------------------------------------------- */
  const activarEdicion = () => {
    if (!loteSeleccionado) return;

    setFormData({
      fecha: loteSeleccionado.fecha.split("T")[0],
      familia: loteSeleccionado.familia,
      fi_instalacion: loteSeleccionado.fi_instalacion_id,
      huevos_ml: loteSeleccionado.huevos_ml,
      no_lote: loteSeleccionado.no_lote,
      observacion: loteSeleccionado.observacion,
      mortalidad: loteSeleccionado.mortalidad || 0,
    });

    setModoEdicion(true);
  };

  /* --------------------------------------------------------
     Guardar cambios de edición
  -------------------------------------------------------- */
  const actualizarLote = async () => {
    try {
      await axios.put(
        `http://localhost:5000/lotes/${loteSeleccionado.fi_lote_id}`,
        {
          fecha: formData.fecha,
          familia: formData.familia,
          fi_instalacion_id: formData.fi_instalacion,
          huevos_ml: formData.huevos_ml,
          no_lote: formData.no_lote,
          observacion: formData.observacion,
          fc_granja: granja,
          mortalidad: Number(formData.mortalidad || 0),
        }
      );

      alert("Lote actualizado correctamente");

      resetEdicion();
      actualizarTabla();
    } catch (err) {
      console.error("❌ Error al actualizar lote:", err);
      alert("No se pudo actualizar el lote");
    }
  };

  /* --------------------------------------------------------
     Eliminar lote
  -------------------------------------------------------- */
  const eliminarLote = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este lote?")) return;

    try {
      await axios.delete(`http://localhost:5000/lotes/${id}`);
      alert("Lote eliminado correctamente");
      actualizarTabla();
      resetEdicion();
    } catch (err) {
      console.error("❌ Error al eliminar lote:", err);
      alert("No se pudo eliminar");
    }
  };

  /* --------------------------------------------------------
     Helpers
  -------------------------------------------------------- */
  const actualizarTabla = async () => {
    const update = await axios.get(
      `http://localhost:5000/lotes/granja/${granja}`
    );
    setLotes(update.data);
  };

  const resetFormulario = () => {
    setFormData({
      fecha: "",
      familia: "",
      fi_instalacion: "",
      huevos_ml: "",
      no_lote: "",
      observacion: "",
      mortalidad: "",
    });
  };

  const resetEdicion = () => {
    setModoEdicion(false);
    setLoteSeleccionado(null);
    resetFormulario();
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const d = new Date(fechaISO);
    return d.toLocaleDateString("es-MX");
  };

  const formatNumber = (num) =>
    new Intl.NumberFormat("en-US").format(num);

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
        🧬 Control Reproductivo — Lotes
      </Typography>

      {/* ----------------- BOTONES DE GRANJA ----------------- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item>
          <Button
            variant={granja === "Medellin" ? "contained" : "outlined"}
            onClick={() => setGranja("Medellin")}
            sx={{
              background: granja === "Medellin" ? "#0077b6" : "",
              color: granja === "Medellin" ? "white" : "#0077b6",
              borderColor: "#0077b6",
            }}
          >
            🏠 Medellín
          </Button>
        </Grid>

        <Grid item>
          <Button
            variant={granja === "La Ceiba" ? "contained" : "outlined"}
            onClick={() => setGranja("La Ceiba")}
            sx={{
              background: granja === "La Ceiba" ? "#2a9d8f" : "",
              color: granja === "La Ceiba" ? "white" : "#2a9d8f",
              borderColor: "#2a9d8f",
            }}
          >
            🌿 La Ceiba
          </Button>
        </Grid>
      </Grid>

      {/* ----------------- FORMULARIO ----------------- */}
      <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
            {modoEdicion ? "✏️ Editar Lote" : "Registrar Nuevo Lote"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>

            {/* FECHA */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* FAMILIA */}
            <Grid item xs={12} sm={3}>
              <TextField
              label="Familia"
              name="familia"
              value={formData.familia}
              onChange={handleChange}
              fullWidth
            />
            </Grid>

            {/* INSTALACION */}
            <Grid item xs={12} sm={3}>
              <TextField
              select
              label="Instalación"
              name="fi_instalacion"
              value={formData.fi_instalacion || ""}  
              onChange={async (e) => {
                const value = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  fi_instalacion: value,
                }));

                setInstalacionSeleccionada(value);

                try {
                  const res = await axios.get(
                    `http://localhost:5000/lotes/familia/${value}`
                  );

                  setFormData((prev) => ({
                    ...prev,
                    familia: res.data.fc_familia || "",
                  }));
                } catch (err) {
                  console.error("❌ Error obteniendo familia:", err);
                }
              }}
              fullWidth
            >
                {instalaciones.map((i) => (
                  <MenuItem key={i.nombre_instalacion} value={i.nombre_instalacion}>
                  {i.nombre_instalacion}
                </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* HUEVOS ML */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Huevos (ml)"
                name="huevos_ml"
                value={formData.huevos_ml}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* MORTALIDAD */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Mortalidad"
                name="mortalidad"
                type="number"
                value={formData.mortalidad}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* NO LOTE */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="No. Lote"
                name="no_lote"
                value={formData.no_lote}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* OBSERVACION */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Observación"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                fullWidth
                multiline
              />
            </Grid>

            {/* BOTÓN REGISTRAR / ACTUALIZAR */}
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<AddCircleIcon />}
                color="success"
                onClick={modoEdicion ? actualizarLote : registrarLote}
                sx={{ mt: 1, fontWeight: "bold" }}
              >
                {modoEdicion ? "Guardar Cambios" : "Registrar Lote"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ----------------- TABLA ----------------- */}
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: "#023047" }}>
        Lotes registrados — {granja}
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#006d77" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Fecha</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Familia</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Instalación</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Huevos (ml)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Alevines</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>No. Lote</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Observación</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mortalidad</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Mortalidad %</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {lotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay registros.
                </TableCell>
              </TableRow>
            ) : (
              lotes.map((l) => (
                <TableRow
                  key={l.fi_lote_id}
                  onClick={() => setLoteSeleccionado(l)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor:
                      loteSeleccionado?.fi_lote_id === l.fi_lote_id ? "#e0f7fa" : "transparent",
                  }}
                >
                  <TableCell>{formatearFecha(l.fecha)}</TableCell>
                  <TableCell>{l.familia}</TableCell>
                  <TableCell>{l.nombre_instalacion}</TableCell>
                  <TableCell>{l.huevos_ml}</TableCell>
                  <TableCell>{formatNumber(l.alevines_inicial)}</TableCell>
                  <TableCell>{l.no_lote}</TableCell>
                  <TableCell>{l.observacion}</TableCell>
                  <TableCell>{formatNumber(l.mortalidad || 0)}</TableCell>
                 <TableCell>{Number(l.mortalidad_porcentaje || 0).toFixed(2)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ----------------- BOTONES EDITAR / ELIMINAR ----------------- */}
      {loteSeleccionado && (
        <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
          <Button variant="contained" color="warning" onClick={activarEdicion}>
            ✏️ Editar Lote
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => eliminarLote(loteSeleccionado.fi_lote_id)}
          >
            🗑️ Eliminar Lote
          </Button>

          <Button variant="outlined" color="inherit" onClick={resetEdicion}>
            ❌ Cerrar
          </Button>
        </div>
      )}
    </div>
  );
};

export default LotesRegistro;
