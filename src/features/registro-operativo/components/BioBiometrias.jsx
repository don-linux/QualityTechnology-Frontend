import React, { useEffect, useState } from "react";
import { API_URL } from "../../utils/config.js";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axios from "../../utils/axiosInstance.js";
import useFormValidation from "../../hooks/useFormValidation";
import useConfirm from "../../hooks/useConfirm";

const GRANJA_MAP = {
  Medellin: "Granja Acuícola Medellín",
  "La Ceiba": "Granja Acuícola La Ceiba",
};

const UBICACION_TO_PARAM = {
  Medellin: "med",
  "La Ceiba": "ceiba",
};

export default function BioBiometrias() {
  return <BioBiometriasContent />;
}

function BioBiometriasContent() {
  const usuario_id = localStorage.getItem("usuario_id") || 1;

  const [data, setData] = useState([]);
  const [instalaciones, setInstalaciones] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [editId, setEditId] = useState(null);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const requiredFields = [
    "ubicacion", "fd_fecha", "fi_instalacion_id", "fi_lote_id", "tipo",
    "fn_peso_total_gramos", "fn_organismos_muestreados",
    "fc_encargado", "fc_observaciones",
  ];

  /* FORMULARIO */
  const [form, setForm] = useState({
    ubicacion: "",
    fd_fecha: "",
    fn_peso_total_gramos: "",
    fn_organismos_muestreados: "",
    fn_peso_promedio: "",
    fc_observaciones: "",
    fc_encargado: "",
    fi_instalacion_id: "",
    fi_lote_id: "",
    tipo: "",
    fi_usuario_id: usuario_id,
  });

  /* -----------------------------
      Cargar datos iniciales
  ------------------------------*/
  const cargarDatos = async () => {
    try {
      const res = await axios.get(`${API_URL}/biometrias`);
      setData(res.data);
    } catch {
      alert("Error al cargar biometrías");
    }
  };

  const cargarInstalaciones = async () => {
    if (!form.ubicacion) { setInstalaciones([]); return; }
    try {
      const granja = GRANJA_MAP[form.ubicacion];
      const res = await axios.get(`${API_URL}/instalaciones/granja/${granja}`);
      setInstalaciones(res.data);
    } catch {
      alert("Error al cargar instalaciones");
    }
  };

  const cargarLotes = async (instalacionId) => {
    const res = await axios.get(
      `${API_URL}/lotes/instalacion/${instalacionId}`
    );
    setLotes(res.data);
  };

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    cargarInstalaciones();
  }, [form.ubicacion]);

  /* -----------------------------
      AUTORRELLENADO
  ------------------------------*/
  const cargarInfoInstalacion = async (instalacionId) => {
    try {
      const granjaParam = UBICACION_TO_PARAM[form.ubicacion] || "med";
      const res = await axios.get(
        `${API_URL}/biometrias/info/${granjaParam}/${instalacionId}`
      );

      const d = res.data;

      if (!d.tipo) {
        // No hay registros previos
        setForm((prev) => ({
          ...prev,
          tipo: "",
          fi_lote_id: "",
          fn_organismos_muestreados: "",
          fn_peso_total_gramos: "",
          fn_peso_promedio: "",
        }));
        return;
      }

      // Sí hay datos → autorrellenar
        setForm((prev) => ({
          ...prev,
          tipo: d.tipo.toLowerCase(),
          fi_lote_id: d.fi_lote_id ?? "",
          fn_organismos_muestreados: d.organismos,
          fn_peso_total_gramos: "",
          fn_peso_promedio: "",
        }));
    } catch (err) {
      console.log(" Error cargando info de instalación:", err);
    }
  };

  /* -----------------------------
      HANDLE CHANGE
  ------------------------------*/
  const handleChange = (e) => {
    const { name, value } = e.target;
    clearFieldError(name);

    // Cálculo de peso promedio
    if (
      name === "fn_peso_total_gramos" ||
      name === "fn_organismos_muestreados"
    ) {
      const p =
        name === "fn_peso_total_gramos"
          ? value
          : form.fn_peso_total_gramos;

      const o =
        name === "fn_organismos_muestreados"
          ? value
          : form.fn_organismos_muestreados;

      const prom =
        p > 0 && o > 0 ? (parseFloat(p) / parseFloat(o)).toFixed(2) : "";

      setForm({
        ...form,
        [name]: value,
        fn_peso_promedio: prom,
      });
      return;
    }

    if (name === "ubicacion") {
      setForm({ ...form, ubicacion: value, fi_instalacion_id: "", fi_lote_id: "", tipo: "" });
      setLotes([]);
      return;
    }

    if (name === "fi_instalacion_id") {
      setForm({ ...form, fi_instalacion_id: value });
      cargarLotes(value);
      cargarInfoInstalacion(value);
      return;
    }

    setForm({ ...form, [name]: value });
  };

  /* -----------------------------
      GUARDAR / ACTUALIZAR
  ------------------------------*/
  const guardar = async () => {
    if (!validate(form, requiredFields)) return;
    try {
      const body = {
        ...form,
        tipo: form.tipo?.toLowerCase(),
      };

      if (editId) {
        await axios.put(`${API_URL}/biometrias/${editId}`, body);
        alert("Registro actualizado");
      } else {
        await axios.post(`${API_URL}/biometrias/`, body);
        alert("Registro creado");
      }

      limpiar();
      cargarDatos();
    } catch {
      alert("Error guardando biometría");
    }
  };

  /* -----------------------------
      EDITAR
  ------------------------------*/
  const editar = (row) => {
    clearErrors();
    setEditId(row.fi_id);

    setForm({
      ubicacion: row.ubicacion || "",
      fd_fecha: row.fd_fecha?.split("T")[0],
      fn_peso_total_gramos: row.fn_peso_total_gramos,
      fn_organismos_muestreados: row.fn_organismos_muestreados,
      fn_peso_promedio: row.fn_peso_promedio,
      fc_observaciones: row.fc_observaciones,
      fc_encargado: row.fc_encargado,
      fi_instalacion_id: row.fi_instalacion_id,
      fi_lote_id: row.fi_lote_id ?? "",
      tipo: row.tipo?.toLowerCase(),
      fi_usuario_id: usuario_id,
    });

    cargarLotes(row.fi_instalacion_id);
  };

  /* -----------------------------
      ELIMINAR
  ------------------------------*/
  const eliminar = async (id) => {
    if (!await confirm("¿Eliminar registro?")) return;
    await axios.delete(`${API_URL}/biometrias/${id}`);
    cargarDatos();
  };

  /* -----------------------------
      LIMPIAR FORMULARIO
  ------------------------------*/
  const limpiar = () => {
    clearErrors();
    setEditId(null);
    setForm((prev) => ({
      ubicacion: prev.ubicacion,
      fd_fecha: "",
      fn_peso_total_gramos: "",
      fn_organismos_muestreados: "",
      fn_peso_promedio: "",
      fc_observaciones: "",
      fc_encargado: "",
      fi_instalacion_id: "",
      fi_lote_id: "",
      tipo: "",
      fi_usuario_id: usuario_id,
    }));
  };

  /* ----------------------------- */
  const formatNum = (n) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* -----------------------------
      UI
  ------------------------------*/
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Biometrías
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* UBICACION */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Ubicación"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                fullWidth
                error={!!errors.ubicacion}
                helperText={errors.ubicacion}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Medellin">Medellín</MenuItem>
                <MenuItem value="La Ceiba">La Ceiba</MenuItem>
              </TextField>
            </Grid>

            {/* FECHA */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                type="date"
                label="Fecha"
                name="fd_fecha"
                value={form.fd_fecha}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!errors.fd_fecha}
                helperText={errors.fd_fecha}
              />
            </Grid>

            {/* INSTALACIÓN */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Instalación"
                name="fi_instalacion_id"
                value={form.fi_instalacion_id}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_instalacion_id}
                helperText={errors.fi_instalacion_id}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {instalaciones.map((i) => (
                  <MenuItem key={i.fi_instalacion_id} value={i.fi_instalacion_id}>
                    {i.nombre_instalacion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* LOTE */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Lote"
                name="fi_lote_id"
                value={form.fi_lote_id}
                onChange={handleChange}
                fullWidth
                error={!!errors.fi_lote_id}
                helperText={errors.fi_lote_id}
              >
                <MenuItem value="">Seleccione</MenuItem>
                {lotes.map((l) => (
                  <MenuItem key={l.fi_lote_id} value={l.fi_lote_id}>
                    {l.no_lote}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* TIPO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Tipo"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                fullWidth
                error={!!errors.tipo}
                helperText={errors.tipo}
                slotProps={{
                  input: {
                    readOnly:
                      form.fi_lote_id !== "" &&
                      (form.tipo === "alevinaje" ||
                        form.tipo === "engorda" ||
                        form.tipo === "reproductores"),
                  },
                }}
              >
                <MenuItem value="">Seleccionar</MenuItem>
                <MenuItem value="alevinaje">Alevinaje</MenuItem>
                <MenuItem value="engorda">Engorda</MenuItem>
                <MenuItem value="reproductores">Reproductores</MenuItem>
              </TextField>
            </Grid>

            {/* PESO TOTAL */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Peso Total (g)"
                name="fn_peso_total_gramos"
                type="number"
                value={form.fn_peso_total_gramos}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_peso_total_gramos}
                helperText={errors.fn_peso_total_gramos}
              />
            </Grid>

            {/* ORGANISMOS */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Organismos Muestreados"
                name="fn_organismos_muestreados"
                type="number"
                value={form.fn_organismos_muestreados}
                onChange={handleChange}
                fullWidth
                error={!!errors.fn_organismos_muestreados}
                helperText={errors.fn_organismos_muestreados}
              />
            </Grid>

            {/* PESO PROMEDIO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Peso Promedio (g)"
                name="fn_peso_promedio"
                type="number"
                value={form.fn_peso_promedio}
                slotProps={{ input: { readOnly: true } }}
                fullWidth
              />
            </Grid>

            {/* ENCARGADO */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Encargado"
                name="fc_encargado"
                value={form.fc_encargado}
                onChange={handleChange}
                fullWidth
                error={!!errors.fc_encargado}
                helperText={errors.fc_encargado}
              />
            </Grid>

            {/* OBSERVACIONES */}
            <Grid size={12}>
              <TextField
                label="Observaciones"
                name="fc_observaciones"
                value={form.fc_observaciones}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                error={!!errors.fc_observaciones}
                helperText={errors.fc_observaciones}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? "Actualizar" : "Guardar"}
            </Button>

            <Button
              variant="contained"
              color="error"
              sx={{ ml: 2 }}
              onClick={limpiar}
            >
              Limpiar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* TABLAS POR UBICACION */}
      {[
        { label: "Medellín", rows: data.filter(r => r.ubicacion === "Medellin") },
        { label: "La Ceiba", rows: data.filter(r => r.ubicacion === "La Ceiba") },
      ].map(({ label, rows }) => (
        <Accordion key={label} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{label} ({rows.length})</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Paper>
              <Table>
                <TableHead sx={{ background: "#E8F5E9" }}>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Instalación</TableCell>
                    <TableCell>Lote</TableCell>
                    <TableCell>Peso Total</TableCell>
                    <TableCell>Organismos</TableCell>
                    <TableCell>Peso Promedio</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Encargado</TableCell>
                    <TableCell>Observaciones</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.fi_id}>
                      <TableCell>{row.fd_fecha?.split("T")[0]}</TableCell>
                      <TableCell>{row.instalacion_nombre}</TableCell>
                      <TableCell>{row.no_lote}</TableCell>
                      <TableCell>{formatNum(row.fn_peso_total_gramos)}</TableCell>
                      <TableCell>{row.fn_organismos_muestreados}</TableCell>
                      <TableCell>{formatNum(row.fn_peso_promedio)}</TableCell>
                      <TableCell>{row.tipo}</TableCell>
                      <TableCell>{row.fc_encargado}</TableCell>
                      <TableCell>{row.fc_observaciones}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          color="warning"
                          onClick={() => editar(row)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ ml: 1 }}
                          color="error"
                          onClick={() => eliminar(row.fi_id)}
                        >
                          Eliminar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
      {ConfirmModal}
    </Box>
  );
}
