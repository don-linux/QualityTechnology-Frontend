import React, { useState, useEffect } from "react";
import {
  listRoles,
  listModulos,
  listModulosByRol,
  updateModulosByRol,
} from "../services/seguridadService";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import EditIcon from "@mui/icons-material/Edit";
import useSnackbar from "@shared/hooks/useSnackbar";
import CloseIcon from "@mui/icons-material/Close";
import { ordenarYNumerar } from "@shared/utils/ordenarFilas";

const MENUS_PRINCIPALES = new Set([
  "Bitacoras",
  "Inventarios",
  "Ventas",
  "Finanzas",
  "RRHH",
  "Catálogos",
  "Catalogos",
  "Seguridad",
]);

/** API actual: rol_id / nombre / es_root (antes fi_rol_id / fc_nombre / fb_es_root). */
function getRolId(rol) {
  return rol?.rol_id ?? rol?.fi_rol_id ?? rol?.id ?? null;
}

function getRolNombre(rol) {
  return rol?.nombre ?? rol?.fc_nombre ?? "";
}

function rolEsRoot(rol) {
  return Boolean(rol?.es_root ?? rol?.fb_es_root);
}

function getModuloId(m) {
  return m?.modulo_id ?? m?.fi_modulo_id ?? m?.id;
}

function getModuloNombre(m) {
  return String(m?.nombre ?? m?.fc_nombre ?? "").trim();
}

export default function RolesModulos() {
  const [roles, setRoles] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [rolesModulos, setRolesModulos] = useState({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [modulosSeleccionados, setModulosSeleccionados] = useState([]);
  const showSnackbar = useSnackbar();

  useEffect(() => {
    obtenerRoles();
    obtenerModulos();
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      roles.forEach((rol) => {
        const id = getRolId(rol);
        if (id != null) obtenerModulosRol(id);
      });
    }
  }, [roles]);

  // ================================
  // Obtener roles
  // ================================
  const obtenerRoles = async () => {
    try {
      const { data } = await listRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener roles:", error);
    }
  };

  // ================================
  // Obtener todos los módulos
  // ================================
  const obtenerModulos = async () => {
    try {
      const { data } = await listModulos();
      setModulos(data);
    } catch (error) {
      console.error("Error al obtener módulos:", error);
    }
  };

  // ================================
  // Obtener módulos del rol
  // ================================
  const obtenerModulosRol = async (rolId) => {
    try {
      const { data } = await listModulosByRol(rolId);
      const modulosArr = Array.isArray(data) ? data : (data.modulos || []);
      const ids = modulosArr.map((m) => getModuloId(m)).filter(Boolean);

      setRolesModulos(prev => ({
        ...prev,
        [rolId]: ids
      }));
    } catch (error) {
      console.error("Error al obtener módulos del rol:", error);
    }
  };

  // ================================
  // Abrir drawer para editar
  // ================================
  const abrirEdicion = (rol) => {
    setRolEditando(rol);
    const ids = rolesModulos[getRolId(rol)] || [];
    setModulosSeleccionados(ids.filter((id) => idsPrincipales.has(id)));
    setDrawerOpen(true);
  };

  // ================================
  // Cerrar drawer
  // ================================
  const cerrarDrawer = () => {
    setDrawerOpen(false);
    setRolEditando(null);
    setModulosSeleccionados([]);
  };

  const modulosPrincipales = modulos.filter((m) =>
    MENUS_PRINCIPALES.has(getModuloNombre(m))
  );

  const idsPrincipales = new Set(modulosPrincipales.map((m) => getModuloId(m)));

  const handleCheckbox = (moduloId) => {
    setModulosSeleccionados((prev) =>
      prev.includes(moduloId)
        ? prev.filter((id) => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  // ================================
  // Guardar cambios
  // ================================
  const guardarCambios = async () => {
    if (!rolEditando) return;

    try {
      const editId = getRolId(rolEditando);
      if (editId == null) return;
      await updateModulosByRol(editId, modulosSeleccionados);

      // Actualizar estado local
      setRolesModulos((prev) => ({
        ...prev,
        [editId]: modulosSeleccionados,
      }));

      showSnackbar("Módulos actualizados correctamente", "success");
      cerrarDrawer();
    } catch (error) {
      console.error("Error al actualizar módulos:", error);
      showSnackbar("Error al actualizar módulos", "error");
    }
  };

  const contarModulosActivos = (rolId) => {
    const ids = rolesModulos[rolId] || [];
    return ids.filter((id) => idsPrincipales.has(id)).length;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 4 }}>
        Gestión de Módulos por Rol
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Módulos Activos
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {ordenarYNumerar(roles, ["rol_id", "fi_rol_id", "id"]).map((rol) => (
              <TableRow key={getRolId(rol) ?? String(getRolNombre(rol))} hover>
                <TableCell>{rol._num}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>
                  {getRolNombre(rol)}
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={`${contarModulosActivos(getRolId(rol))} / ${modulosPrincipales.length}`}
                    color={contarModulosActivos(getRolId(rol)) > 0 ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => abrirEdicion(rol)}
                    size="small"
                    disabled={rolEsRoot(rol)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Drawer para editar módulos */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={cerrarDrawer}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            p: 3
          }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Editar Módulos
          </Typography>
          <IconButton onClick={cerrarDrawer} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {rolEditando && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Rol
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {getRolNombre(rolEditando)}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
              Seleccionar Módulos
            </Typography>

            <FormGroup>
              {modulosPrincipales.map((modulo) => (
                <FormControlLabel
                  key={getModuloId(modulo)}
                  control={
                    <Checkbox
                      checked={modulosSeleccionados.includes(getModuloId(modulo))}
                      onChange={() => handleCheckbox(getModuloId(modulo))}
                    />
                  }
                  label={getModuloNombre(modulo)}
                  sx={{ mb: 1 }}
                />
              ))}
            </FormGroup>

            <Box sx={{ mt: 4 }}>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={guardarCambios}
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={cerrarDrawer}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          </>
        )}
      </Drawer>

    </Container>
  );
}