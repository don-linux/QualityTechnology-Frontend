import { useEffect, useMemo, useState } from "react";
import { listUnidadesNegocioActivas } from "../services/unidadesNegocioService";
import {
  isUnidadGranja,
  resolveUnidadByRol,
  toUnidadNegocioOption,
} from "@shared/utils/unidadesNegocio";

export default function useUnidadesNegocioOptions() {
  const [unidadesNegocio, setUnidadesNegocio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function cargarUnidades() {
      try {
        setLoading(true);
        const res = await listUnidadesNegocioActivas();
        if (!mounted) return;
        setUnidadesNegocio(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err);
        setUnidadesNegocio([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    cargarUnidades();

    return () => {
      mounted = false;
    };
  }, []);

  const ubicacionesGenericas = useMemo(
    () => unidadesNegocio.map(toUnidadNegocioOption),
    [unidadesNegocio]
  );

  const ubicacionesGranja = useMemo(
    () => unidadesNegocio.filter(isUnidadGranja).map(toUnidadNegocioOption),
    [unidadesNegocio]
  );

  return {
    unidadesNegocio,
    ubicacionesGenericas,
    ubicacionesGranja,
    loading,
    error,
    resolveUnidadByRol: (rol) => resolveUnidadByRol(unidadesNegocio, rol),
  };
}
