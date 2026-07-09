import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";

function FiltroBusqueda({ valor = "", onChange, config = {} }) {
  return (
    <TextField
      value={valor}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={config.placeholder ?? "Buscar..."}
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
  );
}

function aplicarBusqueda(rows, valor, config) {
  const q = String(valor ?? "").trim().toLowerCase();
  if (!q) return rows;

  const keys = config?.keys;
  if (!keys?.length) return rows;

  return rows.filter((row) =>
    keys.some((key) => String(row[key] ?? "").toLowerCase().includes(q)),
  );
}

export const filtroBusqueda = {
  id: "busqueda",
  Componente: FiltroBusqueda,
  valorVacio: "",
  estaActivo: (valor) => String(valor ?? "").trim().length > 0,
  aplicar: aplicarBusqueda,
  enExportacion: true,
};
