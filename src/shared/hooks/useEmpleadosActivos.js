import { useCallback, useEffect, useState } from "react";
import useSnackbar from "@shared/hooks/useSnackbar";

/**
 * Carga empleados activos para selector de responsable.
 * @param {() => Promise<{ data?: Array }>} fetchEmpleados - Servicio axios del módulo
 * @param {{ errorMessage?: string }} [options]
 */
export default function useEmpleadosActivos(fetchEmpleados, options = {}) {
  const showSnackbar = useSnackbar();
  const errorMessage = options.errorMessage ?? "Error al cargar empleados.";
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);

  const recargar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEmpleados();
      setEmpleados(res.data ?? []);
    } catch {
      showSnackbar(errorMessage, "error");
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  }, [fetchEmpleados, errorMessage, showSnackbar]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { empleados, loading, recargar };
}
