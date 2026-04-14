import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "@shared/lib/config";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import AddCircleIcon from "@mui/icons-material/AddCircle";

// *** IMPORTANTE: USAR AXIOS INSTANCE CON TOKEN ***
import axios from "@shared/lib/axiosInstance";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";

const LotesRegistro = () => {
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "fecha", "familia", "fi_instalacion_id", "huevos_ml",
    "ovadas", "no_lote", "observacion", "mortalidad",
    "alevines_inicial",
  ];

  const [granja, setGranja] = useState("Medellin");
  const [instalaciones, setInstalaciones] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [, setInstalacionSeleccionada] = useState("");
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formData, setFormData] = useState({
    fecha: "",
    familia: "",
    fi_instalacion_id: "",
    huevos_ml: "",
    ovadas: "",
    no_lote: "",
    observacion: "",
    mortalidad: 0,
    alevines_inicial: 0,
  });

  const validarNoLote = (value) => {
    const regex = /^[A-Za-z0-9-]*$/;
    return regex.test(value) ? value.toUpperCase() : "";
  };

  const handleChange = async (e) => {

  const { name, value } = e.target;

  if (name === "no_lote") {
    setFormData({ ...formData, no_lote: validarNoLote(value) });
    clearFieldError(name);
    return;
  }

  if (name === "fi_instalacion_id") {

    setFormData({ ...formData, fi_instalacion_id: value });

    setInstalacionSeleccionada(value);
    clearFieldError(name);

    try {

      const fam = await axios.get(`/lotes/familia-por-instalacion/${value}`);

      if (fam.data) {

       setFormData((prev) => ({
        ...prev,
        familia: fam.data?.familia || ""
      }));
      }

    } catch (err) {

      console.log("Error cargando familia:", err);

    }

    return;
  }

  setFormData({ ...formData, [name]: value });
  clearFieldError(name);

};
  /** --------------------------------------------------------
      Cargar instalaciones desde REPRODUCTORES
  -------------------------------------------------------- */
  const cargarInstalaciones = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lotes/instalaciones/${granja}`);
      setInstalaciones(res.data);
    } catch (err) {
      console.error("Error cargando instalaciones:", err);
    }
  }, [granja]);

  /** --------------------------------------------------------
      Cargar lotes
  -------------------------------------------------------- */
  const cargarLotes = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lotes/granja/${granja}`);
      setLotes(res.data);
    } catch (err) {
      console.error("Error cargando lotes:", err);
    }
  }, [granja]);

  useEffect(() => {
    cargarInstalaciones();
  }, [cargarInstalaciones]);

  useEffect(() => {
    cargarLotes();
  }, [cargarLotes]);

  /* --------------------------------------------------------
     Registrar lote
  -------------------------------------------------------- */
  const registrarLote = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await axios.post(`${API_URL}/lotes`, {
        fecha: formData.fecha,
        familia: formData.familia,
        fc_instalacion_id: formData.fi_instalacion_id,
        huevos_ml: formData.huevos_ml,
        ovadas: Number(formData.ovadas || 0),
        no_lote: formData.no_lote,
        observacion: formData.observacion,
        fc_granja: granja,
        mortalidad: 0,
        alevines_inicial: Number(formData.alevines_inicial || 0),
      });

      alert("Lote registrado correctamente");
      resetFormulario();
      actualizarTabla();
    } catch (err) {
      console.error(" Error al registrar lote:", err);
      alert("Error al registrar el lote");
    }
  };

  /* --------------------------------------------------------
     Activar edición
  -------------------------------------------------------- */
  const activarEdicion = () => {
    if (!loteSeleccionado) return;
    clearErrors();

    setFormData({
      fecha: loteSeleccionado.fecha.split("T")[0],
      familia: loteSeleccionado.familia,
      fi_instalacion_id: loteSeleccionado.fc_instalacion_id,
      huevos_ml: loteSeleccionado.huevos_ml,
      ovadas: loteSeleccionado.ovadas,
      no_lote: loteSeleccionado.no_lote,
      observacion: loteSeleccionado.observacion || "",
      mortalidad: loteSeleccionado.mortalidad || 0,
      alevines_inicial: loteSeleccionado.alevines_inicial || "",
    });

    setModoEdicion(true);
  };

  /* --------------------------------------------------------
     Guardar cambios de edición
  -------------------------------------------------------- */
  const actualizarLote = async () => {
    if (!validate(formData, requiredFields)) return;
    try {
      await axios.put(`${API_URL}/lotes/${loteSeleccionado.fi_lote_id}`, {
        fecha: formData.fecha,
        familia: formData.familia,
        fc_instalacion_id: formData.fi_instalacion_id,
        huevos_ml: formData.huevos_ml,
        ovadas: Number(formData.ovadas || 0),
        no_lote: formData.no_lote,
        observacion: formData.observacion,
        fc_granja: granja,
        mortalidad: Number(formData.mortalidad || 0),
        alevines_inicial: Number(formData.alevines_inicial || 0),
      });

      alert("Lote actualizado correctamente");

      resetEdicion();
      actualizarTabla();
    } catch (err) {
      console.error(" Error al actualizar lote:", err);
      alert("No se pudo actualizar el lote");
    }
  };

  /* --------------------------------------------------------
     Eliminar lote
  -------------------------------------------------------- */
  const eliminarLote = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este lote?")) return;

    try {
      await axios.delete(`${API_URL}/lotes/${id}`);
      alert("Lote eliminado correctamente");
      actualizarTabla();
      resetEdicion();
    } catch (err) {
      console.error(" Error al eliminar lote:", err);
      alert("No se pudo eliminar");
    }
  };

  /* --------------------------------------------------------
     Helpers
  -------------------------------------------------------- */
  const actualizarTabla = () => {
    cargarLotes();
  };

  const resetFormulario = () => {
    setFormData({
      fecha: "",
      familia: "",
      fi_instalacion_id: "",
      huevos_ml: "",
      ovadas: "",
      no_lote: "",
      observacion: "",
      mortalidad: 0,
      alevines_inicial: 0,
    });
    clearErrors();
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

 const formatNumber = (num) => {
  if (num === null || num === undefined) return "";

  const n = Number(num);

  if (Number.isInteger(n)) {
    return n.toString(); // sin decimales
  }

  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

  return (
    <div style={{ padding: "25px" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: "#004d73" }}>
         Control Reproductivo — Lotes
      </Typography>

      {/* ----------------- BOTONES DE GRANJA ----------------- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size="auto">
          <Button
            variant={granja === "Medellin" ? "contained" : "outlined"}
            onClick={() => setGranja("Medellin")}
            sx={{
              background: granja === "Medellin" ? "#0077b6" : "",
              color: granja === "Medellin" ? "white" : "#0077b6",
              borderColor: "#0077b6",
            }}
          >
             Medellín
          </Button>
        </Grid>

        <Grid size="auto">
          <Button
            variant={granja === "La Ceiba" ? "contained" : "outlined"}
            onClick={() => setGranja("La Ceiba")}
            sx={{
              background: granja === "La Ceiba" ? "#2a9d8f" : "",
              color: granja === "La Ceiba" ? "white" : "#2a9d8f",
              borderColor: "#2a9d8f",
            }}
          >
             La Ceiba
          </Button>
        </Grid>
      </Grid>

      {/* ----------------- FORMULARIO ----------------- */}
      <Card sx={{ mb: 5, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#005f73" }}>
            {modoEdicion ? " Editar Lote" : "Registrar Nuevo Lote"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* FECHA */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Fecha"
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.fecha}
                helperText={errors.fecha}
              />
            </Grid>

            {/* FAMILIA */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Familia"
                name="familia"
                value={formData.familia}
                onChange={handleChange}
                fullWidth
                error={!!errors.familia}
                helperText={errors.familia}
              />
            </Grid>

            {/* INSTALACIÓN */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                select
                label="Instalación"
                name="fi_instalacion_id"
                value={formData.fi_instalacion_id || ""}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_instalacion_id}
                helperText={errors.fi_instalacion_id}
              >
                {instalaciones.map((i) => (
                  <MenuItem key={i.fi_instalacion_id} value={i.fi_instalacion_id}>
                    {i.nombre_instalacion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* HUEVOS ML */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Huevos (ml)"
                name="huevos_ml"
                value={formData.huevos_ml}
                onChange={handleChange}
                fullWidth
                error={!!errors.huevos_ml}
                helperText={errors.huevos_ml}
              />
            </Grid>

            {/* OVADAS */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="Ovadas"
                name="ovadas"
                type="number"
                value={formData.ovadas}
                onChange={handleChange}
                fullWidth
                error={!!errors.ovadas}
                helperText={errors.ovadas}
              />
            </Grid>

            {/* NO LOTE */}
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                label="No. Lote"
                name="no_lote"
                value={formData.no_lote}
                onChange={handleChange}
                fullWidth
                error={!!errors.no_lote}
                helperText={errors.no_lote}
              />
            </Grid>

            {/* OBSERVACIÓN */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Observación"
                name="observacion"
                value={formData.observacion}
                onChange={handleChange}
                fullWidth
                multiline
                error={!!errors.observacion}
                helperText={errors.observacion}
              />
            </Grid>

            {/* BOTÓN REGISTRAR */}
            <Grid size={12}>
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
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ovadas</TableCell>
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
                <TableCell colSpan={10} align="center">
                  No hay registros.
                </TableCell>
              </TableRow>
            ) : (
              lotes.map((l) => (
                <TableRow
                  key={l.fi_lote_id}
                  onClick={() => setLoteSeleccionado(l)}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      loteSeleccionado?.fi_lote_id === l.fi_lote_id ? "#e0f7fa" : "transparent",
                  }}
                >
                  <TableCell>{formatearFecha(l.fecha)}</TableCell>
                  <TableCell>{l.familia}</TableCell>
                  <TableCell>{l.nombre_instalacion}</TableCell>
                 <TableCell>{formatNumber(l.huevos_ml)}</TableCell>
                  <TableCell>{l.ovadas}</TableCell>
                  <TableCell>{formatNumber(l.alevines_inicial || 0)}</TableCell>
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
             Editar Lote
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => eliminarLote(loteSeleccionado.fi_lote_id)}
          >
             Eliminar Lote
          </Button>

          <Button variant="outlined" color="inherit" onClick={resetEdicion}>
             Cerrar
          </Button>
        </div>
      )}
      {ConfirmModal}
    </div>
  );
};

export default LotesRegistro;