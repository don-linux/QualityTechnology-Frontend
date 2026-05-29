import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const campoFormSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
  },
};

export const botonRegistroInventarioSx = {
  mt: 1,
  py: 1.25,
  px: 3,
  fontWeight: 700,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  borderRadius: 2,
  boxShadow: "0 4px 12px rgba(0, 109, 82, 0.35)",
};

export function TituloSeccionFormulario({ letra, colorFondo, titulo, mt = 2.5 }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, mt }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          bgcolor: colorFondo,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: "0.8rem",
          flexShrink: 0,
        }}
      >
        {letra}
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, letterSpacing: 0.6, color: "text.primary", textTransform: "uppercase" }}
      >
        {titulo}
      </Typography>
    </Box>
  );
}

export function CampoConEtiquetaArriba({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 500 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export function BloqueSeccionGris({ titulo, children }) {
  return (
    <Box
      sx={{
        bgcolor: "#f0f2f4",
        borderRadius: 2,
        px: { xs: 2, sm: 2.5 },
        py: 2,
        mt: 1,
      }}
    >
      {titulo ? (
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", mb: 2 }}
        >
          {titulo}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}
