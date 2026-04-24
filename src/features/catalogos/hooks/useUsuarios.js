import { useState, useEffect, useCallback } from "react";
import {
  listUsuarios,
  listRoles,
  listDepartamentosActivos,
  listPuestosActivos,
  listUnidadesNegocioActivas,
  createUsuario,
  updateUsuario,
  toggleUsuarioActivo,
} from "../services/usuariosService";
import useSnackbar from "@shared/hooks/useSnackbar";

export default function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const showSnackbar = useSnackbar();

  const obtenerUsuarios = useCallback(async () => {
    try {
      const { data } = await listUsuarios();
      setUsuarios(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const obtenerRoles = useCallback(async () => {
    try {
      const { data } = await listRoles();
      setRoles(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const obtenerDepartamentos = useCallback(async () => {
    try {
      const { data } = await listDepartamentosActivos();
      setDepartamentos(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const obtenerPuestos = useCallback(async () => {
    try {
      const { data } = await listPuestosActivos();
      setPuestos(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const obtenerUnidadesNegocio = useCallback(async () => {
    try {
      const { data } = await listUnidadesNegocioActivas();
      setUnidadesNegocio(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    obtenerUsuarios();
    obtenerRoles();
    obtenerDepartamentos();
    obtenerPuestos();
    obtenerUnidadesNegocio();
  }, [obtenerUsuarios, obtenerRoles, obtenerDepartamentos, obtenerPuestos, obtenerUnidadesNegocio]);

  const crearUsuario = useCallback(
    async (form) => {
      try {
        await createUsuario(form);
        showSnackbar("Usuario registrado correctamente", "success");
        obtenerUsuarios();
        return true;
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        showSnackbar("Error al registrar usuario", "error");
        return false;
      }
    },
    [obtenerUsuarios, showSnackbar]
  );

  const actualizarUsuario = useCallback(
    async (id, data) => {
      try {
        await updateUsuario(id, data);
        showSnackbar("Usuario actualizado correctamente", "success");
        obtenerUsuarios();
        return true;
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        showSnackbar("Error al actualizar usuario", "error");
        return false;
      }
    },
    [obtenerUsuarios, showSnackbar]
  );

  const toggleActivo = useCallback(
    async (usuario) => {
      const accion = usuario.fb_activo ? "desactivar" : "activar";
      try {
        await toggleUsuarioActivo(usuario.fi_usuario_id, !usuario.fb_activo);
        obtenerUsuarios();
      } catch (error) {
        console.error(`Error al ${accion} usuario:`, error);
        showSnackbar(`Error al ${accion} usuario`, "error");
      }
    },
    [obtenerUsuarios, showSnackbar]
  );

  return {
    usuarios,
    roles,
    departamentos,
    puestos,
    unidadesNegocio,
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario,
    toggleActivo,
  };
}
