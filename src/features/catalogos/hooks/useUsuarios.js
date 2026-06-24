import { useState, useEffect, useCallback } from "react";
import {
  listUsuarios,
  listRoles,
  createUsuario,
  updateUsuario,
  toggleUsuarioActivo,
} from "../services/usuariosService";
import { listDepartamentosActivos, listPuestosActivos } from "@features/rrhh/services/empleadosService";
import { listUnidadesNegocioActivas } from "@features/catalogos/services/unidadesNegocioService";
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
        await createUsuario({
          nombre: form.nombre,
          contraseña: form.contraseña,
          rol_id: Number(form.rol_id),
          nombre_empleado: form.nombre_empleado || undefined,
          apellido_paterno: form.apellido_paterno || undefined,
          apellido_materno: form.apellido_materno || undefined,
          departamento_id: form.departamento_id ? Number(form.departamento_id) : undefined,
          puesto_id: form.puesto_id ? Number(form.puesto_id) : undefined,
          unidad_negocio_id: form.unidad_negocio_id ? Number(form.unidad_negocio_id) : undefined,
        });
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
      const id = usuario?.usuario_id ?? usuario?.id;
      const activoNow = usuario?.activo ?? false;
      const accion = activoNow ? "desactivar" : "activar";
      try {
        if (id == null) throw new Error("Usuario sin ID");
        await toggleUsuarioActivo(id, !activoNow);
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
