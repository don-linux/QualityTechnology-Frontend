import React, { useState, useEffect } from "react";
import { API_URL } from "../utils/api.js";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  MenuItem,
  Stack,
} from "@mui/material";
import { Add, Edit, Delete, Search, CleaningServices } from "@mui/icons-material";
import axios from "axios";

// =========================================================
//  COMPONENTE PRINCIPAL
// =========================================================
export default function Expedientes() {
  const usuario_id = localStorage.getItem("usuario_id");
  const api = `${API_URL}/expedientes`;

  const [form, setForm] = useState({
    fc_nombre: "",
    fc_id_empleado: "",
    fn_uniformes: "",
    fc_puesto: "",   // <-- añadido al form
    fc_credencial: "NO",
    fc_fotografia: "NO",
    fc_acta_nacimiento: "NO",
    fc_ine: "NO",
    fc_licencia_conducir: "NO",
    fc_comprobante_domicilio: "NO",
    fc_rfc: "NO",
    fc_curp: "NO",
    fc_comprobante_estudios: "NO",
    fc_cv: "NO",
    fc_carta_recomendacion: "NO",
    fc_acuerdo_confidencialidad: "NO",
    fc_codigo_etica: "NO",
    fc_codigo_conducta: "NO",
    fc_solicitud_empleo: "NO",
  });

  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // =========================================================
  //  CARGAR / BUSCAR
  // =========================================================
  const cargarDatos = async (nombre = "") => {
    try {
      const url = nombre ? `${api}?nombre=${nombre}` : api;
      const res = await axios.get(url);
      setData(res.data);
    } catch {
      alert("Error al cargar los expedientes");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // =========================================================
  //  GUARDAR / ACTUALIZAR
  // =========================================================
  const guardar = async () => {
    try {
      if (editId) {
        await axios.put(`${api}/${editId}`, form);
        alert("Expediente actualizado correctamente");
      } else {
        await axios.post(api, { ...form, fi_usuario_id: usuario_id });
        alert("Expediente registrado correctamente");
      }
      limpiar();
      cargarDatos();
    } catch {
      alert("Error al guardar el expediente");
    }
  };

  // =========================================================
  //  EDITAR /  ELIMINAR /  LIMPIAR
  // =========================================================
  const editar = (row) => {
    setEditId(row.fi_expediente_id);
    setForm({ ...row });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar este expediente?")) return;
    await axios.delete(`${api}/${id}`);
    cargarDatos();
  };

  const limpiar = () => {
    setForm({
      fc_nombre: "",
      fc_id_empleado: "",
      fn_uniformes: "",
      fc_puesto: "",
      fc_credencial: "NO",
      fc_fotografia: "NO",
      fc_acta_nacimiento: "NO",
      fc_ine: "NO",
      fc_licencia_conducir: "NO",
      fc_comprobante_domicilio: "NO",
      fc_rfc: "NO",
      fc_curp: "NO",
      fc_comprobante_estudios: "NO",
      fc_cv: "NO",
      fc_carta_recomendacion: "NO",
      fc_acuerdo_confidencialidad: "NO",
      fc_codigo_etica: "NO",
      fc_codigo_conducta: "NO",
      fc_solicitud_empleo: "NO",
    });
    setEditId(null);
  };

  // =========================================================
  //  COLORES SEGÚN ESTADO
  // =========================================================
  const colorCelda = (valor) => {
    if (valor === "SI") return { background: "#53fa59ff" };
    if (valor === "NO") return { background: "#f84e5fff" };
    if (valor === "SUSTITUIR") return { background: "#ffed48ff" };
    return {};
  };

  // =========================================================
  //  UI FINAL
  // =========================================================
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
         Expedientes del Personal
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Nombre completo" name="fc_nombre" value={form.fc_nombre} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="ID Empleado" name="fc_id_empleado" value={form.fc_id_empleado} onChange={handleChange} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField label="Uniformes" name="fn_uniformes" type="number" value={form.fn_uniformes} onChange={handleChange} fullWidth />
            </Grid>

            {/* CAMPO PUESTO */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                select
                label="Puesto"
                name="fc_puesto"
                value={form.fc_puesto || ""}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="GAC">GAC</MenuItem>
                <MenuItem value="GAM">GAM</MenuItem>
                <MenuItem value="CAM">CAM</MenuItem>
                <MenuItem value="CQT">CQT</MenuItem>
                <MenuItem value="Direccion">Dirección</MenuItem>
                <MenuItem value="General">General</MenuItem>
              </TextField>
            </Grid>

            {/* CAMPOS DOCUMENTALES */}
            {[
              "fc_credencial",
              "fc_fotografia",
              "fc_acta_nacimiento",
              "fc_ine",
              "fc_licencia_conducir",
              "fc_comprobante_domicilio",
              "fc_rfc",
              "fc_curp",
              "fc_comprobante_estudios",
              "fc_cv",
              "fc_carta_recomendacion",
              "fc_acuerdo_confidencialidad",
              "fc_codigo_etica",
              "fc_codigo_conducta",
              "fc_solicitud_empleo",
            ].map((campo) => (
              <Grid size={{ xs: 12, md: 3 }} key={campo}>
                <TextField
                  select
                  label={campo.replace("fc_", "").replace(/_/g, " ").toUpperCase()}
                  name={campo}
                  value={form[campo]}
                  onChange={handleChange}
                  fullWidth
                >
                  <MenuItem value="SI">SI</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="SUSTITUIR">SUSTITUIR</MenuItem>
                </TextField>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={guardar}>
              {editId ? <Edit /> : <Add />} {editId ? "Actualizar" : "Guardar"}
            </Button>

            <Button variant="outlined" color="secondary" onClick={limpiar}>
              <CleaningServices /> Limpiar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* BUSCADOR */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TextField
          label="Buscar por nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          fullWidth
        />
        <Button variant="contained" startIcon={<Search />} onClick={() => cargarDatos(busqueda)}>
          Buscar
        </Button>
        <Button variant="outlined" onClick={() => cargarDatos("")}>Mostrar Todos</Button>
      </Box>

      {/* TABLA CON SCROLL */}
      <Paper sx={{ borderRadius: 2, mt: 2, overflowX: "auto" }}>
        <Box sx={{ width: "max-content" }}>
          <Table size="small"
            sx={{
              borderCollapse: "collapse",
              "& td, & th": { border: "1px solid #ccc", textAlign: "center" },
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#000" }}>
                {[
                  "Empleado",
                  "ID",
                  "Puesto",
                  "Uniformes",
                  "Credenciales",
                  "Fotografía",
                  "Acta de Nacimiento",
                  "INE",
                  "Licencia de Conducir",
                  "Comprobante de Domicilio",
                  "RFC",
                  "CURP",
                  "Comprobante de Estudios",
                  "CV",
                  "Carta de Recomendación",
                  "Acuerdo de Confidencialidad",
                  "Código de Ética",
                  "Código de Conducta",
                  "Solicitud de Empleo",
                  "Acciones",
                ].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      minWidth: 130,
                      textAlign: "center",
                    }}
                  >
                    {col}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {data.map((r) => (
                <TableRow key={r.fi_expediente_id}>
                  <TableCell sx={{ fontWeight: "bold", textAlign: "left" }}>{r.fc_nombre}</TableCell>
                  <TableCell>{r.fc_id_empleado}</TableCell>
                  <TableCell>{r.fc_puesto}</TableCell>
                  <TableCell>{r.fn_uniformes}</TableCell>
                  <TableCell sx={colorCelda(r.fc_credencial)}>{r.fc_credencial}</TableCell>
                  <TableCell sx={colorCelda(r.fc_fotografia)}>{r.fc_fotografia}</TableCell>
                  <TableCell sx={colorCelda(r.fc_acta_nacimiento)}>{r.fc_acta_nacimiento}</TableCell>
                  <TableCell sx={colorCelda(r.fc_ine)}>{r.fc_ine}</TableCell>
                  <TableCell sx={colorCelda(r.fc_licencia_conducir)}>{r.fc_licencia_conducir}</TableCell>
                  <TableCell sx={colorCelda(r.fc_comprobante_domicilio)}>{r.fc_comprobante_domicilio}</TableCell>
                  <TableCell sx={colorCelda(r.fc_rfc)}>{r.fc_rfc}</TableCell>
                  <TableCell sx={colorCelda(r.fc_curp)}>{r.fc_curp}</TableCell>
                  <TableCell sx={colorCelda(r.fc_comprobante_estudios)}>{r.fc_comprobante_estudios}</TableCell>
                  <TableCell sx={colorCelda(r.fc_cv)}>{r.fc_cv}</TableCell>
                  <TableCell sx={colorCelda(r.fc_carta_recomendacion)}>{r.fc_carta_recomendacion}</TableCell>
                  <TableCell sx={colorCelda(r.fc_acuerdo_confidencialidad)}>{r.fc_acuerdo_confidencialidad}</TableCell>
                  <TableCell sx={colorCelda(r.fc_codigo_etica)}>{r.fc_codigo_etica}</TableCell>
                  <TableCell sx={colorCelda(r.fc_codigo_conducta)}>{r.fc_codigo_conducta}</TableCell>
                  <TableCell sx={colorCelda(r.fc_solicitud_empleo)}>{r.fc_solicitud_empleo}</TableCell>

                  <TableCell>
                    <Button size="small" color="warning" variant="contained" sx={{ mr: 1 }} onClick={() => editar(r)}>
                      <Edit fontSize="small" />
                    </Button>
                    <Button size="small" color="error" variant="contained" onClick={() => eliminar(r.fi_expediente_id)}>
                      <Delete fontSize="small" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
