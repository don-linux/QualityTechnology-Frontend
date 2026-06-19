import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function FormularioRegistroPanel({
  visible,
  onToggle,
  children,
  label = "+ NUEVO REGISTRO",
  hideLabel = "OCULTAR FORMULARIO",
  soloContenido = false,
  sx,
}) {
  if (soloContenido) {
    return children;
  }

  return (
    <>
      <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end", mb: 2, ...sx }}>
        <Button
          variant="contained"
          color="success"
          sx={{ fontWeight: "bold", px: 4 }}
          onClick={onToggle}
        >
          {visible ? hideLabel : label}
        </Button>
      </Box>
      {visible ? children : null}
    </>
  );
}
