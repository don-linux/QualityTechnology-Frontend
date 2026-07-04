import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ExcelIcon from "../ExcelIcon";

/**
 * Excel and PDF export buttons for listado toolbars.
 */
export default function BotonesExportar({ onExportarExcel, onExportarPDF }) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Button
        size="small"
        variant="outlined"
        color="success"
        startIcon={<ExcelIcon />}
        onClick={onExportarExcel}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        Excel
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<PictureAsPdfRoundedIcon />}
        onClick={onExportarPDF}
        sx={{ textTransform: "none", fontWeight: 600 }}
      >
        PDF
      </Button>
    </Box>
  );
}
