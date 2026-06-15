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
    fc_nombre: "", fc_apellido_paterno: "", fc_apellido_materno: "",
    fc_genero: "", fd_fecha_nacimiento: "", fc_estado: "",
    fc_ciudad: "", fc_calle: "", fc_codigo_postal: "",
    fc_referencias: "", ft_comentarios_adicionales: "",
    fi_departamento_id: "", fi_puesto_id: "", fi_unidad_negocio_id: "",
    fd_fecha_contratacion: "", fd_fecha_baja: "", fn_uniformes: 0,
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
      fc_nombre: e.fc_nombre || "",
      fc_apellido_paterno: e.fc_apellido_paterno || "",
      fc_apellido_materno: e.fc_apellido_materno || "",
      fc_genero: e.fc_genero || "",
      fd_fecha_nacimiento: e.fd_fecha_nacimiento ? e.fd_fecha_nacimiento.substring(0, 10) : "",
      fc_estado: e.fc_estado || "",
      fc_ciudad: e.fc_ciudad || "",
      fc_calle: e.fc_calle || "",
      fc_codigo_postal: e.fc_codigo_postal || "",
      fc_referencias: e.fc_referencias || "",
      ft_comentarios_adicionales: e.ft_comentarios_adicionales || "",
      fi_departamento_id: e.fi_departamento_id || "",
      fi_puesto_id: e.fi_puesto_id || "",
      fi_unidad_negocio_id: e.fi_unidad_negocio_id || "",
      fd_fecha_contratacion: e.fd_fecha_contratacion ? e.fd_fecha_contratacion.substring(0, 10) : "",
      fd_fecha_baja: e.fd_fecha_baja ? e.fd_fecha_baja.substring(0, 10) : "",
      fn_uniformes: e.fn_uniformes ?? 0,
    });
  };

  const limpiar = () => {
    setSeleccionado(null);
    setForm({
      fc_nombre: "", fc_apellido_paterno: "", fc_apellido_materno: "",
      fc_genero: "", fd_fecha_nacimiento: "", fc_estado: "",
      fc_ciudad: "", fc_calle: "", fc_codigo_postal: "",
      fc_referencias: "", ft_comentarios_adicionales: "",
      fi_departamento_id: "", fi_puesto_id: "", fi_unidad_negocio_id: "",
      fd_fecha_contratacion: "", fd_fecha_baja: "", fn_uniformes: 0,
    });
  };

  const actualizarEmpleado = async () => {
    if (!seleccionado) return;
    try {
      await updateEmpleado(seleccionado.fi_empleado_id, form);
      await cargarDatos();
      limpiar();
    } catch (e) { console.error(e); showSnackbar("Error al actualizar", "error"); }
  };

  const toggleActivo = async (emp) => {
    const accion = emp.fb_activo ? "desactivar" : "activar";
    if (!await confirm(`¿Seguro que deseas ${accion} a ${emp.fc_nombre} ${emp.fc_apellido_paterno}?`)) return;
    try {
      if (emp.fb_activo) {
        const fechaBaja = window.prompt("Fecha de baja (YYYY-MM-DD)", todayString());
        if (fechaBaja === null) return;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaBaja)) {
          return showSnackbar("Fecha de baja invalida", "error");
        }
        await toggleEmpleadoActivo(emp.fi_empleado_id, false, { fd_fecha_baja: fechaBaja });
      } else {
        await toggleEmpleadoActivo(emp.fi_empleado_id, true);
      }
      await cargarDatos();
    } catch (e) { console.error(e); }
  };

  const perfilIncompleto = (e) => !e.fd_fecha_nacimiento || !e.fc_calle || !e.fc_estado;

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
                Editando: {seleccionado.fc_nombre} {seleccionado.fc_apellido_paterno}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_nombre" label="Nombre" fullWidth value={form.fc_nombre} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_apellido_paterno" label="Apellido Paterno" fullWidth value={form.fc_apellido_paterno} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_apellido_materno" label="Apellido Materno" fullWidth value={form.fc_apellido_materno} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="fc_genero" label="Genero" fullWidth value={form.fc_genero} onChange={handleChange}>
                  <MenuItem value="">Sin especificar</MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fd_fecha_nacimiento" label="Fecha Nacimiento" type="date" fullWidth value={form.fd_fecha_nacimiento} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fd_fecha_contratacion" label="Fecha Contratacion" type="date" fullWidth value={form.fd_fecha_contratacion} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fd_fecha_baja" label="Fecha Baja" type="date" fullWidth value={form.fd_fecha_baja} onChange={handleChange} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="fi_departamento_id" label="Departamento" fullWidth value={form.fi_departamento_id} onChange={handleChange}>
                  {departamentos.map((d) => (
                    <MenuItem key={d.fi_departamento_id} value={d.fi_departamento_id}>{d.fc_nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="fi_puesto_id" label="Puesto" fullWidth value={form.fi_puesto_id} onChange={handleChange}>
                  <MenuItem value="">Sin asignar</MenuItem>
                  {puestos.map((p) => (
                    <MenuItem key={p.fi_puesto_id} value={p.fi_puesto_id}>{p.fc_nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="fi_unidad_negocio_id" label="Unidad de Negocio" fullWidth value={form.fi_unidad_negocio_id} onChange={handleChange}>
                  <MenuItem value="">Sin asignar</MenuItem>
                  {unidadesNegocio.map((u) => (
                    <MenuItem key={u.fi_unidad_negocio_id} value={u.fi_unidad_negocio_id}>{u.fc_nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField select name="fn_uniformes" label="Uniformes" fullWidth value={form.fn_uniformes} onChange={handleChange}>
                  <MenuItem value={0}>Sin uniforme</MenuItem>
                  <MenuItem value={1}>Entregado</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_estado" label="Estado" fullWidth value={form.fc_estado} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_ciudad" label="Ciudad" fullWidth value={form.fc_ciudad} onChange={handleChange} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField name="fc_codigo_postal" label="Codigo Postal" fullWidth value={form.fc_codigo_postal} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="fc_calle" label="Calle / Direccion" fullWidth value={form.fc_calle} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="fc_referencias" label="Referencias" fullWidth value={form.fc_referencias} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <TextField name="ft_comentarios_adicionales" label="Comentarios" fullWidth multiline rows={2} value={form.ft_comentarios_adicionales} onChange={handleChange} />
              </Grid>
              <Grid size={12}>
                <Button variant="contained" color="primary" sx={{ mr: 1 }} onClick={actualizarEmpleado}>Guardar</Button>
                <Button variant="outlined" onClick={limpiar}>Cancelar</Button>
              </Grid>
            </Grid>

            {seleccionado && (
              <Box sx={{ mt: 3 }}>
                <DocumentosEmpleado empleadoId={seleccionado.fi_empleado_id} />
                <Divider sx={{ my: 3 }} />
                <ActasAdministrativas empleadoId={seleccionado.fi_empleado_id} />
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
              {ordenarYNumerar(empleados, ["fi_empleado_id"]).map((e) => (
                <TableRow key={e.fi_empleado_id} hover sx={{ opacity: e.fb_activo ? 1 : 0.5 }}>
                  <TableCell>{e._num}</TableCell>
                  <TableCell>{e.fc_nombre} {e.fc_apellido_paterno} {e.fc_apellido_materno}</TableCell>
                  <TableCell>{e.puesto_nombre || "-"}</TableCell>
                  <TableCell>{e.departamento_nombre || "-"}</TableCell>
                  <TableCell>{e.unidad_negocio_nombre || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.fb_activo ? "Activo" : "Inactivo"}
                      color={e.fb_activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(e.fd_fecha_baja)}</TableCell>
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
                      color={e.fb_activo ? "error" : "success"}
                      onClick={() => toggleActivo(e)}
                    >
                      {e.fb_activo ? "Desactivar" : "Activar"}
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
