import Box from "@mui/material/Box";
import { REGISTRO_FILTROS } from "./filtros/registroFiltros";

/**
 * Renders active listado filters from the registry.
 */
export default function ListadoFiltros({ filtros = [], config = {}, valores = {}, onFiltro }) {
  if (!filtros.length) return null;

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
      {filtros.map((id) => {
        const def = REGISTRO_FILTROS[id];
        if (!def) return null;

        const { Componente } = def;
        return (
          <Componente
            key={id}
            valor={valores[id]}
            onChange={(valor) => onFiltro?.(id, valor)}
            config={config[id] ?? {}}
          />
        );
      })}
    </Box>
  );
}
