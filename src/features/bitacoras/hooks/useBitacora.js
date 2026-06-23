import { useState, useEffect, useCallback } from "react";
import useFormValidation from "@shared/hooks/useFormValidation";
import useSnackbar from "@shared/hooks/useSnackbar";
import useAuth from "@app/providers/AuthProvider";

/**
 * Generic hook for bitacora CRUD operations.
 *
 * @param {Object}   options
 * @param {Function} options.listFn        - Service fn to list records
 * @param {Function} options.createFn      - Service fn to create a record
 * @param {Function} options.updateFn      - Service fn to update a record (id, data)
 * @param {Object}   options.initialForm   - Default form state (without fi_usuario_id)
 * @param {string[]} options.requiredFields
 * @param {string}   options.idField       - Primary key field name (default: "fi_id")
 * @param {Function} [options.listParams]  - Fn returning params for listFn (e.g. ubicacion)
 * @param {Function} [options.mapEditRow]  - Fn to transform a row into form values when editing
 */
export default function useBitacora({
  listFn,
  createFn,
  updateFn,
  initialForm,
  requiredFields,
  idField = "fi_id",
  listParams,
  mapEditRow,
}) {
  const { usuarioId } = useAuth();
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();

  const buildForm = useCallback(
    (overrides = {}) => ({ ...initialForm, fi_usuario_id: usuarioId, ...overrides }),
    [initialForm, usuarioId],
  );

  const [data, setData] = useState([]);
  const [form, setForm] = useState(() => buildForm());
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const args = listParams ? listParams() : [];
      const res = await listFn(...(Array.isArray(args) ? args : [args]));
      setData(res.data);
    } catch {
      showSnackbar("Error al cargar registros.", "error");
    } finally {
      setLoading(false);
    }
  }, [listFn, listParams, showSnackbar]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleChange = (e) => {
    clearFieldError(e.target.name);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const limpiar = useCallback(
    (keepFields = {}) => {
      setEditId(null);
      setForm(buildForm(keepFields));
      clearErrors();
    },
    [buildForm, clearErrors],
  );

  const guardar = async (keepFieldsOnReset = {}) => {
    if (!validate(form, requiredFields)) return;
    try {
      if (editId) await updateFn(editId, form);
      else await createFn(form);
      limpiar(keepFieldsOnReset);
      cargarDatos();
      showSnackbar(editId ? "Registro actualizado." : "Registro guardado.", "success");
    } catch (err) {
      showSnackbar("Error al guardar: " + (err.message || "ver consola"), "error");
    }
  };

  const editar = (row) => {
    clearErrors();
    setEditId(row[idField]);
    if (mapEditRow) {
      setForm(mapEditRow(row));
    } else {
      const fd = row.fd_fecha ? { fd_fecha: row.fd_fecha.split("T")[0] } : {};
      setForm({ ...row, ...fd });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    data,
    form,
    setForm,
    editId,
    loading,
    errors,
    handleChange,
    cargarDatos,
    guardar,
    editar,
    limpiar,
    clearFieldError,
    validate,
    showSnackbar,
    usuarioId,
  };
}
