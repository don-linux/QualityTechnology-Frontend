import React, { useState, useEffect } from "react";
import {
  listRoles,
  createRol,
  updateRol,
  deactivateRol,
  activateRol,
} from "@features/catalogos/services/rolesService";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";
import useFormularioVisible from "@shared/hooks/useFormularioVisible";
import FormularioRegistroPanel from "@shared/components/FormularioRegistroPanel";
import { getRolId, getRolNombre, rolEsRoot, rolActivo } from "@features/catalogos/utils/catalogEntityGetters";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

export default function Roles() {
  const showSnackbar = useSnackbar();
  const [form, setForm] = useState({ fi_rol_id: null, fc_nombre: "" });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();
  const {
    visible: mostrarFormulario,
    abrir: abrirFormulario,
    cerrar: cerrarFormulario,
    toggle: toggleFormulario,
  } = useFormularioVisible();

  useEffect(() => {
    obtenerRoles();
  }, []);

  const obtenerRoles = async () => {
    setLoading(true);
    try {
      const { data } = await listRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener roles", error);
      showSnackbar("Error al cargar roles", "error");
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    clearFieldError(e.target.name);
  };

  const limpiar = () => {
    setForm({ fi_rol_id: null, fc_nombre: "" });
    clearErrors();
    cerrarFormulario();
  };

  const registrar = async () => {
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await createRol(form.fc_nombre.trim());
      showSnackbar("Rol registrado correctamente", "success");
      obtenerRoles();
      limpiar();
    } catch (error) {
      console.error("Error al registrar rol", error);
      showSnackbar(error?.response?.data?.error || "Error al registrar rol", "error");
    }
  };

  const actualizar = async () => {
    if (!form.fi_rol_id) return;
    if (!validate(form, ["fc_nombre"])) return;
    try {
      await updateRol(form.fi_rol_id, form.fc_nombre.trim());
      showSnackbar("Rol actualizado correctamente", "success");
      obtenerRoles();
      limpiar();
    } catch (error) {
      console.error("Error al actualizar rol", error);
      showSnackbar(error?.response?.data?.error || "Error al actualizar rol", "error");
    }
  };

  const seleccionar = (rol) => {
    setForm({
      fi_rol_id: getRolId(rol),
      fc_nombre: getRolNombre(rol),
    });
    clearErrors();
    abrirFormulario();
  };

  const toggleActivo = async (rol) => {
    const activo = rolActivo(rol);
    const nombre = getRolNombre(rol);
    if (!await confirm(activo ? `¿Desactivar el rol "${nombre}"?` : `¿Activar el rol "${nombre}"?`)) return;
    try {
      if (activo) await deactivateRol(getRolId(rol));
      else await activateRol(getRolId(rol));
      showSnackbar(activo ? "Rol desactivado correctamente" : "Rol activado correctamente", "success");
      obtenerRoles();
      if (form.fi_rol_id === getRolId(rol)) limpiar();
    } catch (error) {
      console.error("Error al cambiar el estado del rol", error);
      showSnackbar(error?.response?.data?.error || "Error al cambiar el estado del rol", "error");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Catálogo de Roles
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Administra los roles de acceso del sistema
        </Typography>
      </Box>

      <FormularioRegistroPanel visible={mostrarFormulario} onToggle={toggleFormulario}>
        <Card sx={{ mb: 4, borderRadius: 4, boxShadow: 4, border: "1px solid #eee" }}>
          <CardContent>
            <Typography variant="subtitle1" mb={2} fontWeight="bold">
              {form.fi_rol_id ? "Editando Rol" : "Nuevo Rol"}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  name="fc_nombre"
                  label="Nombre del Rol"
                  fullWidth
                  value={form.fc_nombre}
                  onChange={handleChange}
                  error={!!errors.fc_nombre}
                  helperText={errors.fc_nombre}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mt={1}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={registrar}
                  disabled={!!form.fi_rol_id}
                >
                  Registrar
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={actualizar}
                  disabled={!form.fi_rol_id}
                >
                  Actualizar
                </Button>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Button fullWidth variant="outlined" onClick={limpiar}>
                  Limpiar
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </FormularioRegistroPanel>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordenarYNumerar(roles, ["fi_rol_id", "rol_id"]).map((rol) => {
                  const activo = rolActivo(rol);
                  return (
                  <TableRow key={getRolId(rol) ?? ""} hover sx={{ opacity: activo ? 1 : 0.5 }}>
                    <TableCell>{rol._num}</TableCell>
                    <TableCell>{getRolNombre(rol)}</TableCell>
                    <TableCell>
                      <Chip
                        label={rolEsRoot(rol) ? "Root" : "Estándar"}
                        color={rolEsRoot(rol) ? "warning" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={activo ? "Activo" : "Inactivo"}
                        color={activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        <Button size="small" variant="outlined" onClick={() => seleccionar(rol)}>
                          Editar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color={activo ? "warning" : "success"}
                          onClick={() => toggleActivo(rol)}
                          disabled={rolEsRoot(rol)}
                        >
                          {activo ? "Desactivar" : "Activar"}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {ConfirmModal}
    </Container>
  );
}
