import React, { useState, useEffect, useCallback } from "react";
import {
  listAlimentos,
  createAlimento,
  removeAlimento,
  listReproductoresByGranja,
  listPiletasByGranja,
  listEngordaByGranja,
} from "../services/alimentosService";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import FormHelperText from "@mui/material/FormHelperText";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import Add from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import Clear from "@mui/icons-material/Clear";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

export default function Alimentos() {
  const auth = useAuth();
  const usuario_id = auth.usuarioId;
  const showSnackbar = useSnackbar();
  const [tab, setTab] = useState("alevinaje");
  const [granjaActiva, setGranjaActiva] = useState("Granja Acuícola Medellin");

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
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const safeNumber = (val, decimals = 2) =>
    !isNaN(Number(val)) ? Number(val).toFixed(decimals) : "—";

  // =======================================
  // Obtener datos
  // =======================================
  const obtenerRegistros = useCallback(async () => {
    try {
      const res = await listAlimentos();
      setRegistros(res.data);
    } catch (error) {
      console.error("Error al obtener alimentos:", error);
      showSnackbar("Error al cargar alimentos", "error");
    }
  }, [showSnackbar]);

  const obtenerReproductores = useCallback(async () => {
    try {
      const granja = encodeURIComponent(granjaActiva);
      const res = await listReproductoresByGranja(granja);
      setReproductores(res.data);
    } catch (error) {
      console.error("Error al obtener reproductores:", error);
      showSnackbar("Error al cargar reproductores", "error");
    }
  }, [granjaActiva, showSnackbar]);

  const obtenerPiletas = useCallback(async () => {
    try {
      const granja = encodeURIComponent(granjaActiva);
      const res = await listPiletasByGranja(granja);
      setPiletas(res.data);
    } catch (error) {
      console.error("Error al obtener piletas:", error);
      showSnackbar("Error al cargar piletas", "error");
    }
  }, [granjaActiva, showSnackbar]);

  const obtenerEngorda = useCallback(async () => {
    try {
      const granja = encodeURIComponent(granjaActiva);
      const res = await listEngordaByGranja(granja);
      setEngorda(res.data);
    } catch (error) {
      console.error("Error al obtener engorda:", error);
      showSnackbar("Error al cargar engorda", "error");
    }
  }, [granjaActiva, showSnackbar]);

  useEffect(() => {
    obtenerRegistros();
    obtenerPiletas();
    obtenerReproductores();
    obtenerEngorda();
  }, [obtenerRegistros, obtenerPiletas, obtenerReproductores, obtenerEngorda]);

  // =======================================
  // Registro y acciones
  // =======================================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiarFormulario = () => {
    setForm({
      fi_alimento_id: null,
      fi_reproductor_id: "",
      fi_pileta_id: "",
      fi_engorda_id: "",
    });
    clearErrors();
  };

  const registrar = async () => {
    if (!usuario_id) return showSnackbar("Vuelve a iniciar sesión.", "error");

    const currentField = tab === "alevinaje" ? "fi_pileta_id"
      : tab === "engorda" ? "fi_engorda_id"
      : "fi_reproductor_id";
    if (!validate(form, [currentField])) return;

    let payload = { fi_usuario_id: Number(usuario_id) };

    if (tab === "alevinaje") payload.fi_pileta_id = form.fi_pileta_id || null;
    if (tab === "engorda") payload.fi_engorda_id = form.fi_engorda_id || null;
    if (tab === "reproductores") payload.fi_reproductor_id = form.fi_reproductor_id || null;

    try {
      await createAlimento(payload);
      showSnackbar("Registro agregado ", "success");
      obtenerRegistros();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar alimento:", error);
      showSnackbar("Error al registrar alimento ", "error");
    }
  };

  const eliminar = async (id) => {
    if (!await confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      await removeAlimento(id);
      obtenerRegistros();
    } catch (error) {
      console.error("Error al eliminar alimento:", error);
      showSnackbar("Error al eliminar el registro", "error");
    }
  };

  const seleccionar = (dato) => {
    clearErrors();
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
         Registro de Alimentación
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
        <Button
          variant={granjaActiva.includes("Medellin") ? "contained" : "outlined"}
          color="primary"
          onClick={() => setGranjaActiva("Granja Acuícola Medellin")}
        >
          Medellín
        </Button>
        <Button
          variant={granjaActiva.includes("Ceiba") ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setGranjaActiva("Granja Acuícola La Ceiba")}
        >
          La Ceiba
        </Button>
      </Stack>

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
        <Tab value="alevinaje" label=" Alevines" />
        <Tab value="engorda" label=" Engorda" />
        <Tab value="reproductores" label=" Reproductores" />
      </Tabs>

      {/* FORMULARIO */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, marginBottom: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            {tab === "alevinaje" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.fi_pileta_id}>
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
                  {errors.fi_pileta_id && <FormHelperText>{errors.fi_pileta_id}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {tab === "engorda" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.fi_engorda_id}>
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
                  {errors.fi_engorda_id && <FormHelperText>{errors.fi_engorda_id}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {tab === "reproductores" && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={!!errors.fi_reproductor_id}>
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
                  {errors.fi_reproductor_id && <FormHelperText>{errors.fi_reproductor_id}</FormHelperText>}
                </FormControl>
              </Grid>
            )}

            {/* BOTONES */}
            <Grid size={12}>
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
      {ConfirmModal}
    </Container>
  );
}
