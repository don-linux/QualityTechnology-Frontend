import React, { useState, useEffect } from "react";
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
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowBack from "@mui/icons-material/ArrowBack";
import {
  listEmpleados,
  listDepartamentosActivos,
  listPuestosActivos,
  updateEmpleado,
  toggleEmpleadoActivo,
} from "../services/empleadosService";
import useConfirm from "@shared/hooks/useConfirm";
import DocumentosEmpleado from "./DocumentosEmpleado";
import ActasAdministrativas from "./ActasAdministrativas";
import useSnackbar from "@shared/hooks/useSnackbar";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
import { formatFecha } from "@shared/utils/formatters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

const todayString = () => new Date().toISOString().slice(0, 10);
const formatDate = (value) => formatFecha(value, "-");

export default function Empleados() {
  const showSnackbar = useSnackbar();
  const [empleados, setEmpleados] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmModal } = useConfirm();

  const [form, setForm] = useState({
    nombre: "", apellido_paterno: "", apellido_materno: "",
    genero: "", fecha_nacimiento: "", estado: "",
    ciudad: "", calle: "", codigo_postal: "",
    referencias: "", comentarios_adicionales: "",
    departamento_id: "", puesto_id: "", unidad_negocio_id: "",
    fecha_contratacion: "", fecha_baja: "", uniformes: 0,
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [empRes, depRes, pueRes, udnRes] = await Promise.all([
        listEmpleados(),
        listDepartamentosActivos(),
        listPuestosActivos(),
        listUnidadesNegocioActivas(),
      ]);
      setEmpleados(empRes.data);
      setDepartamentos(depRes.data);
      setPuestos(pueRes.data);
      setUnidadesNegocio(udnRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const seleccionarEmpleado = (e) => {
    setSeleccionado(e);
    setForm({
      nombre: e.nombre || "",
      apellido_paterno: e.apellido_paterno || "",
      apellido_materno: e.apellido_materno || "",
      genero: e.genero || "",
      fecha_nacimiento: e.fecha_nacimiento ? e.fecha_nacimiento.substring(0, 10) : "",
      estado: e.estado || "",
      ciudad: e.ciudad || "",
      calle: e.calle || "",
      codigo_postal: e.codigo_postal || "",
      referencias: e.referencias || "",
      comentarios_adicionales: e.comentarios_adicionales || "",
      departamento_id: e.departamento_id || "",
      puesto_id: e.puesto_id || "",
      unidad_negocio_id: e.unidad_negocio_id || "",
      fecha_contratacion: e.fecha_contratacion ? e.fecha_contratacion.substring(0, 10) : "",
      fecha_baja: e.fecha_baja ? e.fecha_baja.substring(0, 10) : "",
      uniformes: e.uniformes ?? 0,
    });
  };

  const limpiar = () => {
    setSeleccionado(null);
    setForm({
      nombre: "", apellido_paterno: "", apellido_materno: "",
      genero: "", fecha_nacimiento: "", estado: "",
      ciudad: "", calle: "", codigo_postal: "",
      referencias: "", comentarios_adicionales: "",
      departamento_id: "", puesto_id: "", unidad_negocio_id: "",
      fecha_contratacion: "", fecha_baja: "", uniformes: 0,
    });
  };

  const actualizarEmpleado = async () => {
    if (!seleccionado) return;
    try {
      await updateEmpleado(seleccionado.empleado_id, form);
      await cargarDatos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar", "error"); }
  };

  const toggleActivo = async (emp) => {
    const accion = emp.activo ? "desactivar" : "activar";
    if (!await confirm(`¿Seguro que deseas ${accion} a ${emp.nombre} ${emp.apellido_paterno}?`)) return;
    try {
      if (emp.activo) {
        const fechaBaja = window.prompt("Fecha de baja (YYYY-MM-DD)", todayString());
        if (fechaBaja === null) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaBaja)) {
          return showSnackbar("Fecha de baja invalida", "error");
        }
        await toggleEmpleadoActivo(emp.empleado_id, false, { fecha_baja: fechaBaja });
      } else {
        await toggleEmpleadoActivo(emp.empleado_id, true);
      }
      await cargarDatos();
    } catch (e) { console.error(e); }
  };

  const perfilIncompleto = (e) => !e.fecha_nacimiento || !e.calle || !e.estado;

  return (
    <Container maxWidth="lg" sx={{ pt: 2, pb: 4 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Gestion de Empleados</Typography>
        <Typography variant="body2" color="text.secondary">
          Los empleados se crean automaticamente desde Usuarios
        </Typography>
      </Box>

      {seleccionado && (
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Tooltip title="Regresar">
                <IconButton onClick={limpiar} sx={{ mr: 1 }} aria-label="Regresar">
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Typography variant="subtitle1" fontWeight="bold">
                Editando: {seleccionado.nombre} {seleccionado.apellido_paterno}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="nombre" label="Nombre" fullWidth value={form.nombre} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="apellido_paterno" label="Apellido Paterno" fullWidth value={form.apellido_paterno} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="apellido_materno" label="Apellido Materno" fullWidth value={form.apellido_materno} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="genero" label="Genero" fullWidth value={form.genero} onChange={handleChange}>
                  <MenuItem value="">Sin especificar</MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fecha_nacimiento" label="Fecha Nacimiento" type="date" fullWidth value={form.fecha_nacimiento} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fecha_contratacion" label="Fecha Contratacion" type="date" fullWidth value={form.fecha_contratacion} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fecha_baja" label="Fecha Baja" type="date" fullWidth value={form.fecha_baja} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="departamento_id" label="Departamento" fullWidth value={form.departamento_id} onChange={handleChange}>
                  {departamentos.map((d) => (
                    <MenuItem key={d.departamento_id} value={d.departamento_id}>{d.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="puesto_id" label="Puesto" fullWidth value={form.puesto_id} onChange={handleChange}>
                  <MenuItem value="">Sin asignar</MenuItem>
                  {puestos.map((p) => (
                    <MenuItem key={p.puesto_id} value={p.puesto_id}>{p.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="unidad_negocio_id" label="Unidad de Negocio" fullWidth value={form.unidad_negocio_id} onChange={handleChange}>
                  <MenuItem value="">Sin asignar</MenuItem>
                  {unidadesNegocio.map((u) => (
                    <MenuItem key={u.unidad_negocio_id} value={u.unidad_negocio_id}>{u.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="uniformes" label="Uniformes" fullWidth value={form.uniformes} onChange={handleChange}>
                  <MenuItem value={0}>Sin uniforme</MenuItem>
                  <MenuItem value={1}>Entregado</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="estado" label="Estado" fullWidth value={form.estado} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="ciudad" label="Ciudad" fullWidth value={form.ciudad} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="codigo_postal" label="Codigo Postal" fullWidth value={form.codigo_postal} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="calle" label="Calle / Direccion" fullWidth value={form.calle} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="referencias" label="Referencias" fullWidth value={form.referencias} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="comentarios_adicionales" label="Comentarios" fullWidth multiline rows={2} value={form.comentarios_adicionales} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={actualizarEmpleado}>Guardar</Button>
                <Button variant="outlined" onClick={limpiar}>Cancelar</Button>
              </Grid>
            </Grid>

            {seleccionado && (
              <Box sx={{ mt: 3 }}>
                <DocumentosEmpleado empleadoId={seleccionado.empleado_id} />
                <Divider sx={{ my: 3 }} />
                <ActasAdministrativas empleadoId={seleccionado.empleado_id} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Typography textAlign="center">Cargando...</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Puesto</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>UdN</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha Baja</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordenarYNumerar(empleados, ["empleado_id", "id"]).map((e) => (
                <TableRow key={e.empleado_id} hover sx={{ opacity: e.activo ? 1 : 0.5 }}>
                  <TableCell>{e._num}</TableCell>
                  <TableCell>{e.nombre} {e.apellido_paterno} {e.apellido_materno}</TableCell>
                  <TableCell>{e.puesto_nombre || "-"}</TableCell>
                  <TableCell>{e.departamento_nombre || "-"}</TableCell>
                  <TableCell>{e.unidad_negocio_nombre || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.activo ? "Activo" : "Inactivo"}
                      color={e.activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(e.fecha_baja)}</TableCell>
                  <TableCell>
                    {perfilIncompleto(e) && (
                      <Chip label="Incompleto" color="warning" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => seleccionarEmpleado(e)}>
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color={e.activo ? "error" : "success"}
                      onClick={() => toggleActivo(e)}
                    >
                      {e.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {ConfirmModal}
    </Container>
  );
}
