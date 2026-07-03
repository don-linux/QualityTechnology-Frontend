import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { toInputDate } from "@shared/utils/formatters";

function FiltroFechas({ valor = { desde: "", hasta: "" }, onChange, config = {} }) {
  const hayFiltro = Boolean(valor.desde || valor.hasta);

  const limpiar = () => {
    onChange?.({ desde: "", hasta: "" });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
      <TextField
        label="Desde"
        type="date"
        size="small"
        value={valor.desde ?? ""}
        onChange={(e) => onChange?.({ ...valor, desde: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 150 }}
      />
      <TextField
        label="Hasta"
        type="date"
        size="small"
        value={valor.hasta ?? ""}
        onChange={(e) => onChange?.({ ...valor, hasta: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ width: 150 }}
      />
      {hayFiltro && (
        <Tooltip title="Limpiar filtro de fechas">
          <IconButton size="small" onClick={limpiar} aria-label="Limpiar filtro de fechas">
            <FilterAltOffIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function aplicarFechas(rows, valor, config) {
  const { desde, hasta } = valor || {};
  if (!desde && !hasta) return rows;

  const campo = config?.campo ?? "fecha";

  return rows.filter((row) => {
    const iso = toInputDate(row[campo]);
    if (!iso) return false;
    if (desde && iso < desde) return false;
    if (hasta && iso > hasta) return false;
    return true;
  });
}

export const filtroFechas = {
  id: "fechas",
  Componente: FiltroFechas,
  valorVacio: { desde: "", hasta: "" },
  estaActivo: ({ desde, hasta } = {}) => Boolean(desde || hasta),
  aplicar: aplicarFechas,
  enExportacion: false,
};
