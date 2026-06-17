import { useCallback, useEffect, useState } from "react";
import axios from "@shared/lib/axiosInstance";
import { ENDPOINTS } from "@shared/lib/endpoints";

export default function useAlimentacionInterna(piletaId, etapa = "engorda") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!piletaId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url =
        etapa === "alevinaje"
          ? ENDPOINTS.alevinaje.alimentacionInterna(piletaId)
          : ENDPOINTS.engorda.alimentacionInterna(piletaId);
      const res = await axios.get(url);
      setData(res.data);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [piletaId, etapa]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
