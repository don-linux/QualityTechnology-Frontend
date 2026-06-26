import { useState, useEffect, useCallback } from "react";
import useFormValidation from "@shared/hooks/useFormValidation";
import useConfirm from "@shared/hooks/useConfirm";
import useSnackbar from "@shared/hooks/useSnackbar";

/**
 * Generic hook for simple catalog CRUD (Departamentos, Puestos, etc.).
 *
 * @param {Object}   options
 * @param {Function} options.listFn       - Fetch all items
 * @param {Function} options.createFn     - Create a new item (name)
 * @param {Function} options.updateFn     - Update an item (id, name)
 * @param {Function} options.deactivateFn - Deactivate an item (id)
 * @param {string}   options.idField      - Primary key field (e.g. "departamento_id")
 * @param {string}   options.nameField    - Name field (e.g. "nombre")
 * @param {string}   options.entityLabel  - Human label (e.g. "departamento")
 */
export default function useCatalogo({
  listFn,
  createFn,
  updateFn,
  deactivateFn,
  idField,
  nameField = "nombre",
  entityLabel,
}) {
  const showSnackbar = useSnackbar();
  const { errors, validate, clearFieldError, clearErrors } = useFormValidation();
  const { confirm, ConfirmModal } = useConfirm();

  const emptyForm = { [idField]: null, [nameField]: "" };
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await listFn();
      setItems(data);
    } catch (e) {
      console.error(e);
      showSnackbar(`Error al cargar ${entityLabel}s`, "error");
    } finally {
      setLoading(false);
    }
  }, [listFn, entityLabel, showSnackbar]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    clearFieldError(e.target.name);
  };

  const limpiar = () => { setForm(emptyForm); clearErrors(); };

  const registrar = async () => {
    if (!validate(form, [nameField])) return;
    try {
      await createFn(form[nameField]);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(`Error al registrar ${entityLabel}`, "error");
    }
  };

  const actualizar = async () => {
    if (!form[idField]) return;
    if (!validate(form, [nameField])) return;
    try {
      await updateFn(form[idField], form[nameField]);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(`Error al actualizar ${entityLabel}`, "error");
    }
  };

  const desactivar = async (id, nombre) => {
    if (!await confirm(`¿Desactivar ${entityLabel} "${nombre}"?`)) return;
    try {
      await deactivateFn(id);
      cargar();
      limpiar();
    } catch (e) {
      console.error(e);
      showSnackbar(`Error al desactivar ${entityLabel}`, "error");
    }
  };

  const seleccionar = (item) => {
    setForm({ [idField]: item[idField], [nameField]: item[nameField] });
    clearErrors();
  };

  return {
    form,
    items,
    loading,
    errors,
    ConfirmModal,
    handleChange,
    limpiar,
    registrar,
    actualizar,
    desactivar,
    seleccionar,
  };
}
