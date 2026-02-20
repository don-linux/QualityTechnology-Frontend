import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Grid,
  Button,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import axios from "axios";
import { Add, Delete, Clear } from "@mui/icons-material";

export default function Alimentos() {
  return <AlimentosContent />;
}

function AlimentosContent() {
  const usuario_id = localStorage.getItem("usuario_id");
  const [tab, setTab] = useState("alevinaje");

  const [form, setForm] = useState({
    fi_alimento_id: null,
    fi_reproductor_id: "",
    fi_pileta_id: "",
    fi_engorda_id: "",
  });

  const [registros, setRegistros] = useState([]);
  const [reproductores, setReproductores] = useState([]);
  const [piletas, setPiletas] = useState([]);
  const [engorda, setEngorda] = useState([]);

  const safeNumber = (val, decimals = 2) =>
    !isNaN(Number(val)) ? Number(val).toFixed(decimals) : "—";

  useEffect(() => {
    if (usuario_id) {
      obtenerRegistros();
      obtenerPiletas();
      obtenerReproductores();
      obtenerEngorda();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario_id]);

  // =======================================
  // Obtener datos
  // =======================================
  const obtenerRegistros = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/alimentos/${usuario_id}`);
      setRegistros(res.data);
    } catch (error) {
      console.error("Error al obtener alimentos:", error);
    }
  };

  const obtenerReproductores = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/reproductores/${usuario_id}`);
      setReproductores(res.data);
    } catch (error) {
      console.error("Error al obtener reproductores:", error);
    }
  };

  const obtenerPiletas = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/piletas/${usuario_id}`);
      setPiletas(res.data);
    } catch (error) {
      console.error("Error al obtener piletas:", error);
    }
  };

  const obtenerEngorda = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/engorda/${usuario_id}`);
      setEngorda(res.data);
    } catch (error) {
      console.error("Error al obtener engorda:", error);
    }
  };

  // =======================================
  // Registro y acciones
  // =======================================
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const limpiarFormulario = () => {
    setForm({
      fi_alimento_id: null,
      fi_reproductor_id: "",
      fi_pileta_id: "",
      fi_engorda_id: "",
    });
  };

  const registrar = async () => {
    if (!usuario_id) return alert("Vuelve a iniciar sesión.");

    let payload = { fi_usuario_id: Number(usuario_id) };

    if (tab === "alevinaje") payload.fi_pileta_id = form.fi_pileta_id || null;
    if (tab === "engorda") payload.fi_engorda_id = form.fi_engorda_id || null;
    if (tab === "reproductores") payload.fi_reproductor_id = form.fi_reproductor_id || null;

    try {
      await axios.post("http://localhost:5000/alimentos", payload);
      alert("Registro agregado ✅");
      obtenerRegistros();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar alimento:", error);
      alert("Error al registrar alimento ❌");
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await axios.delete(`http://localhost:5000/alimentos/${id}`);
      obtenerRegistros();
    } catch (error) {
      console.error("Error al eliminar alimento:", error);
    }
  };

  const seleccionar = (dato) => {
    setForm({
      fi_alimento_id: dato.fi_alimento_id,
      fi_reproductor_id: dato.fi_reproductor_id || "",
      fi_pileta_id: dato.fi_pileta_id || "",
      fi_engorda_id: dato.fi_engorda_id || "",
    });
  };

  // =======================================
  // Totales y filtros
  // =======================================
  const registrosFiltrados = registros.filter((r) => {
    if (tab === "alevinaje") return r.fi_pileta_id;
    if (tab === "engorda") return r.fi_engorda_id;
    if (tab === "reproductores") return r.fi_reproductor_id;
    return false;
  });

  const totalAlimentoDia = registrosFiltrados.reduce(
    (sum, r) => sum + Number(r.alimento_dia || 0),
    0
  );

  const totalGasto = registrosFiltrados.reduce(
    (sum, r) => sum + Number(r.gasto_alimento || 0),
    0
  );

  // =======================================
  // UI
  // =======================================
  return (
    <Container maxWidth="lg" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
        🍲 Registro de Alimentación
      </Typography>

      {/* TABS SUPERIORES */}
      <Tabs
        value={tab}
        onChange={(e, val) => {
          setTab(val);
          limpiarFormulario();
        }}
        centered
        sx={{ marginBottom: 3, backgroundColor: "#f3f3f3", borderRadius: 2 }}
      >
        <Tab value="alevinaje" label="🐟 Alevines" />
        <Tab value="engorda" label="🍖 Engorda" />
        <Tab value="reproductores" label="🧬 Reproductores" />
      </Tabs>

      {/* FORMULARIO */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, marginBottom: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {tab === "alevinaje" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Pileta</InputLabel>
                  <Select
                    name="fi_pileta_id"
                    value={form.fi_pileta_id}
                    label="Pileta"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    {piletas.map((p) => (
                      <MenuItem key={p.fi_pileta_id} value={p.fi_pileta_id}>
                        {p.nombre_instalacion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {tab === "engorda" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Instalación Engorda</InputLabel>
                  <Select
                    name="fi_engorda_id"
                    value={form.fi_engorda_id}
                    label="Engorda"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Ninguna</MenuItem>
                    {engorda.map((e) => (
                      <MenuItem key={e.fi_engorda_id} value={e.fi_engorda_id}>
                        {e.instalacion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {tab === "reproductores" && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Reproductor</InputLabel>
                  <Select
                    name="fi_reproductor_id"
                    value={form.fi_reproductor_id}
                    label="Reproductor"
                    onChange={handleChange}
                  >
                    <MenuItem value="">Ninguno</MenuItem>
                    {reproductores.map((r) => (
                      <MenuItem key={r.fi_reproductor_id} value={r.fi_reproductor_id}>
                        {r.fc_instalacion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* BOTONES */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={registrar}
                >
                  Registrar
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={limpiarFormulario}
                >
                  Limpiar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLA */}
      <Typography variant="h5" gutterBottom>
        Registros de Alimentación ({tab})
      </Typography>

      <Box sx={{ maxHeight: 500, overflowY: "auto", borderRadius: 3 }}>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#b9e4c9" }}>
              <TableRow>
                {tab === "alevinaje" && <TableCell>Pileta</TableCell>}
                {tab === "engorda" && <TableCell>Engorda</TableCell>}
                {tab === "reproductores" && <TableCell>Reproductor</TableCell>}
                <TableCell>Partícula (mm)</TableCell>
                <TableCell>Alimento Día</TableCell>
                <TableCell>Porción</TableCell>
                <TableCell>Gasto ($)</TableCell>
                <TableCell align="center">Acción</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {registrosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay registros
                  </TableCell>
                </TableRow>
              ) : (
                registrosFiltrados.map((r) => (
                  <TableRow key={r.fi_alimento_id} hover>
                    {tab === "alevinaje" && <TableCell>{r.pileta_nombre || "—"}</TableCell>}
                    {tab === "engorda" && <TableCell>{r.engorda_instalacion || "—"}</TableCell>}
                    {tab === "reproductores" && (
                      <TableCell>{r.reproductor_instalacion || "—"}</TableCell>
                    )}
                    <TableCell>{safeNumber(r.particula_mm, 2)}</TableCell>
                    <TableCell>{safeNumber(r.alimento_dia, 3)}</TableCell>
                    <TableCell>{safeNumber(r.porcion, 3)}</TableCell>
                    <TableCell>${safeNumber(r.gasto_alimento, 2)}</TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => seleccionar(r)}
                        >
                          Seleccionar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => eliminar(r.fi_alimento_id)}
                        >
                          Eliminar
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}

              <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                <TableCell
                  colSpan={3}
                  align="right"
                  sx={{ fontWeight: "bold" }}
                >
                  Totales:
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  {safeNumber(totalAlimentoDia, 3)}
                </TableCell>
                <TableCell></TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  ${safeNumber(totalGasto, 2)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
