import React, { useState, useEffect, Suspense, lazy } from "react";
import { API_URL } from "../utils/api.js";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import axios from "../utils/axiosInstance.js";
import dayjs from "dayjs";
import "dayjs/locale/es"; //  Importar español
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Clear from "@mui/icons-material/Clear";

const AlevinesChart = lazy(() => import("./AlevinesChart"));


//  Configurar dayjs en español
dayjs.locale("es");

export default function AlevinesRegistro() {
  const [form, setForm] = useState({
    numero_lote: "",
    cantidad_nacidos: "",
    peso_promedio: "",
    observacion: "",
    usuario_id: "3",
    colecta_id: "",
    fi_alevines_id: null,
  });

  const [alevines, setAlevines] = useState([]);
  const [colectas, setColectas] = useState([]);

  //  filtros por año y mes
  const [filtroAnio, setFiltroAnio] = useState("");
  const [filtroMes, setFiltroMes] = useState("");

  useEffect(() => {
    obtenerAlevines();
    obtenerColectas();
  }, []);

  const obtenerAlevines = async () => {
    try {
      const res = await axios.get(`${API_URL}/alevines`);
      setAlevines(res.data);
    } catch (error) {
      console.error("Error al obtener alevines", error);
    }
  };

  const obtenerColectas = async () => {
    try {
      const res = await axios.get(`${API_URL}/colectas`);
      setColectas(res.data);
    } catch (error) {
      console.error("Error al obtener colectas", error);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const limpiarFormulario = () => {
    setForm({
      numero_lote: "",
      cantidad_nacidos: "",
      peso_promedio: "",
      observacion: "",
      usuario_id: "3",
      colecta_id: "",
      fi_alevines_id: null,
    });
  };

  const registrarAlevines = async () => {
    if (
      form.numero_lote.trim() === "" ||
      form.cantidad_nacidos.trim() === "" ||
      form.peso_promedio.trim() === "" ||
      !form.colecta_id
    ) {
      return alert("Llena todos los campos requeridos.");
    }

    const fechaActual = dayjs().format("YYYY-MM-DD");

    try {
      await axios.post(`${API_URL}/alevines`, {
        fc_numero_lote: form.numero_lote,
        fn_peso_promedio: form.peso_promedio,
        fn_cantidad: form.cantidad_nacidos,
        fc_observacion: form.observacion,
        fi_usuario_id: form.usuario_id,
        fi_colecta_id: form.colecta_id,
        fd_fecha_registro: fechaActual,
        fd_fecha_modificacion: fechaActual,
      });
      obtenerAlevines();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al registrar alevines", error);
    }
  };

  const actualizarAlevines = async () => {
    if (!form.fi_alevines_id)
      return alert("Selecciona un registro para actualizar");

    const fechaModificacion = dayjs().format("YYYY-MM-DD");

    try {
      await axios.put(
        `${API_URL}/alevines/${form.fi_alevines_id}`,
        {
          fc_numero_lote: form.numero_lote,
          fn_peso_promedio: form.peso_promedio,
          fn_cantidad: form.cantidad_nacidos,
          fc_observacion: form.observacion,
          fi_usuario_id: form.usuario_id,
          fi_colecta_id: form.colecta_id,
          fd_fecha_modificacion: fechaModificacion,
        }
      );
      obtenerAlevines();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al actualizar alevines", error);
    }
  };

  const eliminarAlevines = async () => {
    if (!form.fi_alevines_id)
      return alert("Selecciona un registro para eliminar");

    try {
      await axios.delete(
        `${API_URL}/alevines/${form.fi_alevines_id}`
      );
      obtenerAlevines();
      limpiarFormulario();
    } catch (error) {
      console.error("Error al eliminar alevines", error);
    }
  };

  const seleccionarAlevines = (a) => {
    setForm({
      fi_alevines_id: a.fi_alevines_id,
      numero_lote: a.fc_numero_lote,
      cantidad_nacidos: a.fn_cantidad,
      peso_promedio: a.fn_peso_promedio,
      observacion: a.fc_observacion,
      usuario_id: a.fi_usuario_id,
      colecta_id: a.fi_colecta_id,
    });
  };

  const getDescripcionColecta = (id) => {
    const colecta = colectas.find((c) => c.fi_colecta_id === id);
    return colecta
      ? `${dayjs(colecta.fd_fecha_colecta).format("DD/MM/YYYY")} - Cant: ${colecta.fn_cantidad_aprox}`
      : id;
  };

  //  Datos para la gráfica (ya filtrados)
  const alevinesFiltrados = alevines.filter((a) => {
    if (!a.fd_fecha_registro) return false;
    const fecha = dayjs(a.fd_fecha_registro);
    const anio = fecha.year().toString();
    const mes = (fecha.month() + 1).toString(); // 0-based
    return (
      (filtroAnio ? anio === filtroAnio : true) &&
      (filtroMes ? mes === filtroMes : true)
    );
  });

  const graficaData = alevinesFiltrados.map((a) => ({
    fecha: a.fd_fecha_registro
      ? dayjs(a.fd_fecha_registro).format("DD/MM/YYYY")
      : "",
    cantidad: a.fn_cantidad,
  }));

  //  Función para exportar a Excel SOLO lo filtrado
  const exportarYLimpiarPantalla = async () => {
    const datos = alevinesFiltrados.map((a) => ({
      "Número Lote": a.fc_numero_lote,
      Cantidad: a.fn_cantidad,
      "Peso Promedio (g)": a.fn_peso_promedio,
      Observación: a.fc_observacion,
      Colecta: getDescripcionColecta(a.fi_colecta_id),
      Usuario: a.fi_usuario_id,
      "Fecha Registro": a.fd_fecha_registro
        ? dayjs(a.fd_fecha_registro).format("DD/MM/YYYY")
        : "",
      "Fecha Modificación": a.fd_fecha_modificacion
        ? dayjs(a.fd_fecha_modificacion).format("DD/MM/YYYY")
        : "",
    }));

    const datosGrafica = graficaData.map((d) => ({
      Fecha: d.fecha,
      Cantidad: d.cantidad,
    }));

    const { default: ExcelJS } = await import("exceljs");
    const { saveAs } = await import("file-saver");
    const wb = new ExcelJS.Workbook();

    const wsTabla = wb.addWorksheet("Registros");
    if (datos.length > 0) {
      wsTabla.columns = Object.keys(datos[0]).map((key) => ({ header: key, key }));
      wsTabla.addRows(datos);
    }

    const wsGrafica = wb.addWorksheet("Gráfica");
    if (datosGrafica.length > 0) {
      wsGrafica.columns = Object.keys(datosGrafica[0]).map((key) => ({ header: key, key }));
      wsGrafica.addRows(datosGrafica);
    }

    const excelBuffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([excelBuffer]), `Alevines_${dayjs().format("YYYY_MM_DD")}.xlsx`);

    setAlevines([]); // limpiar pantalla
    limpiarFormulario();
  };

  //  años disponibles según registros
  const aniosDisponibles = [
    ...new Set(alevines.map((a) => dayjs(a.fd_fecha_registro).year().toString())),
  ];

  return (
    <Container maxWidth="md" sx={{ paddingTop: 3, paddingBottom: 5 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
         Registro de Alevines
      </Typography>

      {/* FORMULARIO */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, marginBottom: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                name="numero_lote"
                label="Número de Lote"
                variant="outlined"
                fullWidth
                size="medium"
                value={form.numero_lote}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                name="cantidad_nacidos"
                label="Cantidad Nacidos"
                type="number"
                variant="outlined"
                fullWidth
                size="medium"
                value={form.cantidad_nacidos}
                onChange={handleChange}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                name="peso_promedio"
                label="Peso Promedio (g)"
                type="number"
                variant="outlined"
                fullWidth
                size="medium"
                value={form.peso_promedio}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={12}>
              <FormControl fullWidth size="medium">
                <InputLabel id="label-colecta">Colecta</InputLabel>
                <Select
                  labelId="label-colecta"
                  name="colecta_id"
                  value={form.colecta_id}
                  onChange={handleChange}
                >
                  {colectas.map((c) => (
                    <MenuItem key={c.fi_colecta_id} value={c.fi_colecta_id}>
                      {dayjs(c.fd_fecha_colecta).format("DD/MM/YYYY")} - Cant:{" "}
                      {c.fn_cantidad_aprox}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                name="observacion"
                label="Observación"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={form.observacion}
                onChange={handleChange}
              />
            </Grid>

            {/* Botones */}
            <Grid size={12}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
                flexWrap="wrap"
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Add />}
                  onClick={registrarAlevines}
                  disabled={!!form.fi_alevines_id}
                  sx={{ minWidth: 140, py: 1.5 }}
                >
                  Registrar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={actualizarAlevines}
                  disabled={!form.fi_alevines_id}
                  sx={{ minWidth: 140, py: 1.5 }}
                >
                  Actualizar
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={eliminarAlevines}
                  disabled={!form.fi_alevines_id}
                  sx={{ minWidth: 140, py: 1.5 }}
                >
                  Eliminar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={limpiarFormulario}
                  sx={{ minWidth: 140, py: 1.5 }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={exportarYLimpiarPantalla}
                  sx={{ minWidth: 180, py: 1.5 }}
                >
                  Exportar y Vaciar Pantalla
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/*  FILTROS */}
      <Typography variant="h6" gutterBottom>
        Filtros de búsqueda
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Año</InputLabel>
          <Select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {aniosDisponibles.map((anio) => (
              <MenuItem key={anio} value={anio}>
                {anio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Mes</InputLabel>
          <Select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={(i + 1).toString()}>
                {dayjs().month(i).format("MMMM")} {/*  Meses ahora en español */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/*  GRÁFICA */}
      <Typography variant="h5" gutterBottom>
        Gráfica de Nacimientos
      </Typography>
      <Box sx={{ width: "100%", height: 400, mb: 4 }}>
        <Suspense fallback={<Typography>Cargando grafica...</Typography>}>
          <AlevinesChart data={graficaData} />
        </Suspense>
      </Box>

      {/* TABLA */}
      <Typography variant="h5" gutterBottom>
        Registros de Alevines
      </Typography>
      <Box sx={{ maxHeight: "600px", overflowY: "auto", borderRadius: 3 }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 2, overflow: "hidden" }}
        >
          <Table stickyHeader>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>Número Lote</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Peso (g)</TableCell>
                <TableCell>Observación</TableCell>
                <TableCell>Colecta</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Fecha Registro</TableCell>
                <TableCell>Fecha Modificación</TableCell>
                <TableCell align="center">Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alevinesFiltrados.map((a) => (
                <TableRow key={a.fi_alevines_id} hover sx={{ cursor: "pointer" }}>
                  <TableCell>{a.fc_numero_lote}</TableCell>
                  <TableCell>{a.fn_cantidad}</TableCell>
                  <TableCell>{a.fn_peso_promedio}</TableCell>
                  <TableCell>{a.fc_observacion}</TableCell>
                  <TableCell>{getDescripcionColecta(a.fi_colecta_id)}</TableCell>
                  <TableCell>{a.fi_usuario_id}</TableCell>
                  <TableCell>
                    {a.fd_fecha_registro ? dayjs(a.fd_fecha_registro).format("DD/MM/YYYY") : ""}
                  </TableCell>
                  <TableCell>
                    {a.fd_fecha_modificacion
                      ? dayjs(a.fd_fecha_modificacion).format("DD/MM/YYYY")
                      : ""}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="medium"
                      sx={{ minWidth: 120, py: 1 }}
                      onClick={() => seleccionarAlevines(a)}
                    >
                      Seleccionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}
