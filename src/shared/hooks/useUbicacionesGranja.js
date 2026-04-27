import { useMemo } from "react";
import useUnidadesNegocioOptions from "@features/catalogos/hooks/useUnidadesNegocioOptions";
import {
  getUnidadGranjaColor,
  getUnidadGranjaLogo,
  getUnidadGranjaSlug,
} from "@shared/utils/unidadesNegocio";

export default function useUbicacionesGranja() {
  const { ubicacionesGranja, loading, error, resolveUnidadByRol } = useUnidadesNegocioOptions();

  const defaultUbicacion = ubicacionesGranja[0]?.value || "";

  const helpers = useMemo(() => {
    const getOption = (value) => ubicacionesGranja.find((op) => op.value === value);
    const getLabel = (value) => getOption(value)?.label || value || "";
    const getLogo = (value) => getUnidadGranjaLogo(value);
    const getColor = (value) => getUnidadGranjaColor(value);
    const getSlug = (value) => getUnidadGranjaSlug(value);
    const getGroups = (rows, field = "ubicacion") =>
      ubicacionesGranja.map((op) => ({
        ...op,
        rows: rows.filter((row) => row[field] === op.value),
      }));

    return { getOption, getLabel, getLogo, getColor, getSlug, getGroups };
  }, [ubicacionesGranja]);

  return {
    ubicacionesGranja,
    defaultUbicacion,
    loading,
    error,
    resolveUnidadByRol,
    ...helpers,
  };
}
