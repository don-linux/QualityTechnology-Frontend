import { useCallback, useMemo, useState } from "react";
import {
  aplicarFiltros,
  filtrosExportacion,
  hayFiltroActivo as detectarFiltroActivo,
  valoresIniciales,
} from "./filtros/registroFiltros";

export default function useFiltrosListado({ rows, filtros = [], config = {} }) {
  const [valores, setValores] = useState(() => valoresIniciales(filtros));

  const setFiltro = useCallback((id, valor) => {
    setValores((prev) => ({ ...prev, [id]: valor }));
  }, []);

  const filas = useMemo(
    () => aplicarFiltros(rows, filtros, valores, config),
    [rows, filtros, valores, config],
  );

  const filasExportacion = useMemo(() => {
    const ids = filtrosExportacion(filtros);
    if (!ids.length) return rows;
    return aplicarFiltros(rows, filtros, valores, config, ids);
  }, [rows, filtros, valores, config]);

  const hayFiltroActivo = useMemo(
    () => detectarFiltroActivo(filtros, valores),
    [filtros, valores],
  );

  return {
    valores,
    setFiltro,
    filas,
    filasExportacion,
    hayFiltroActivo,
  };
}
