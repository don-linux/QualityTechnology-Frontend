import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";

/**
 * Shared listado filters: text search and optional date range.
 * Tables enable only the pieces they need via `mostrarBusqueda` / `mostrarFechas`.
 */
export default function ListadoFiltros({
  busqueda = "",
  onBuscar,
  placeholder = "Buscar...",
  mostrarBusqueda = true,
  fechas = { desde: "", hasta: "" },
  onFechas,
  mostrarFechas = false,
}) {
  const hayFiltroFecha = Boolean(fechas.desde || fechas.hasta);

  const limpiarFechas = () => {
    onFechas?.({ desde: "", hasta: "" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 1.5,
        flex: "1 1 auto",
      }}
    >
      {mostrarBusqueda && (
        <TextField
          value={busqueda}
          onChange={(e) => onBuscar?.(e.target.value)}
          placeholder={placeholder}
          size="small"
          sx={{ flex: "1 1 200px", maxWidth: 360 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      )}

      {mostrarFechas && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={fechas.desde}
            onChange={(e) => onFechas?.({ ...fechas, desde: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={fechas.hasta}
            onChange={(e) => onFechas?.({ ...fechas, hasta: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 150 }}
          />
          {hayFiltroFecha && (
            <Tooltip title="Limpiar filtro de fechas">
              <IconButton size="small" onClick={limpiarFechas} aria-label="Limpiar filtro de fechas">
                <FilterAltOffIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
}
