import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getUnidadGranjaSigla } from "@shared/utils/unidadesNegocio";

/**
 * Una tabla (renderTabla) por cada sede/granja, en acordeones (patrón Recambios).
 */
export default function TablasPorUbicacionGranja({
  grupos,
  renderTabla,
  defaultExpanded = false,
  accordionSx,
  detailsSx,
}) {
  if (!grupos?.length) return null;

  return grupos.map(({ value, label, rows, ...restoGrupoProps } = {}) => {
    const grupo = {
      value,
      label,
      siglaGranja: getUnidadGranjaSigla(value || label),
      ...restoGrupoProps,
    };

    return (
      <Accordion
        key={value || label}
        defaultExpanded={defaultExpanded}
        sx={{ mt: 1, mb: 2, ...accordionSx }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">{label}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0, ...detailsSx }}>
          {renderTabla(rows, grupo)}
        </AccordionDetails>
      </Accordion>
    );
  });
}
