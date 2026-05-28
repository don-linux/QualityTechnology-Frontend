import { useMemo, useState, useEffect, useCallback } from "react";
import useUnidadesNegocioOptions from "@features/catalogos/hooks/useUnidadesNegocioOptions";
import { listUbicacionesActivas } from "@features/catalogos/services/ubicacionesService";
import {
  getUnidadGranjaColor,
  getUnidadGranjaLogo,
  getUnidadGranjaSlug,
  matchUbicacionIdForGranjaLabel,
  rowPerteneceAUbicacionGranja,
} from "@shared/utils/unidadesNegocio";

/**
 * Opciones para el selector «sede / granja» + cruce contra catálogo `ubicacion`
 * (IDs reales para el backend).
 *
 * - `granja`/nombre texto: compatibilidad y etiquetas UI.
 * - `ubicacion_id`: filtro principal en `/piletas`, `/alevinaje`, reproductores, etc.
 *
 * Las piletas «origen» / `origen_pileta_id` no usan este filtro; siguen siendo FK a otra pileta.
 */
export default function useUbicacionesGranja() {
  const { ubicacionesGranja: unidadesGranjaOps, loading, error, resolveUnidadByRol } =
    useUnidadesNegocioOptions();

  const [ubicacionesActivasRows, setUbicacionesActivasRows] = useState([]);
  const [ubicLoading, setUbicLoading] = useState(false);
  const [ubicError, setUbicError] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        setUbicLoading(true);
        const res = await listUbicacionesActivas();
        const rows = Array.isArray(res.data) ? res.data : [];
        if (!cancel) {
          setUbicacionesActivasRows(rows);
          setUbicError(null);
        }
      } catch (e) {
        if (!cancel) {
          setUbicacionesActivasRows([]);
          setUbicError(e);
        }
      } finally {
        if (!cancel) setUbicLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const ubicacionesGranja = useMemo(
    () =>
      unidadesGranjaOps.map((op) => {
        const raw = op.raw ?? {};
        const explicit =
          raw.fi_ubicacion_id ?? raw.ubicacion_id ?? raw.ubicacionId ?? null;
        const mapped = matchUbicacionIdForGranjaLabel(op.value, ubicacionesActivasRows);
        const n =
          explicit != null && explicit !== "" ? Number(explicit) : NaN;
        const fromExplicit = Number.isFinite(n) ? n : null;
        return {
          ...op,
          ubicacion_id: fromExplicit != null ? fromExplicit : mapped,
        };
      }),
    [ubicacionesActivasRows, unidadesGranjaOps],
  );

  const defaultUbicacion = ubicacionesGranja[0]?.value || "";

  /** Objeto para query params (`granja`, `ubicacion_id`) donde aplique ubicación física */
  const resolveFiltroUbicacion = useCallback(
    (value) => {
      const granjaNombre = typeof value === "string" ? value.trim() : "";
      const ubicacion_id =
        ubicacionesGranja.find((o) => o.value === granjaNombre)?.ubicacion_id ?? undefined;
      return { granja: granjaNombre, ubicacion_id };
    },
    [ubicacionesGranja],
  );

  const helpers = useMemo(() => {
    const getOption = (value) => ubicacionesGranja.find((op) => op.value === value);
    const getLabel = (value) => getOption(value)?.label || value || "";
    const getLogo = (value) => getUnidadGranjaLogo(value);
    const getColor = (value) => getUnidadGranjaColor(value);
    const getSlug = (value) => getUnidadGranjaSlug(value);
    const getGroups = (rows, field = "ubicacion") =>
      ubicacionesGranja.map((op) => ({
        ...op,
        rows: rows.filter((row) => rowPerteneceAUbicacionGranja(row, op, field)),
      }));

    return { getOption, getLabel, getLogo, getColor, getSlug, getGroups };
  }, [ubicacionesGranja]);

  return {
    ubicacionesGranja,
    defaultUbicacion,
    loading: loading || ubicLoading,
    error: error || ubicError,
    resolveUnidadByRol,
    resolveFiltroUbicacion,
    ...helpers,
  };
}
