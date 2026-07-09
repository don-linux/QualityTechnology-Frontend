import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import EmojiPeople from "@mui/icons-material/EmojiPeople";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Business from "@mui/icons-material/Business";
import Work from "@mui/icons-material/Work";
import useHeaderInfo from "@shared/layout/HeaderInfoContext";

const COLORES = {
  admin: { fondo: "#E3F2FD", icono: "#1565C0" },
  empleado: { fondo: "#F3E5F5", icono: "#6A1B9A" },
};

export default function Inicio() {
  const headerInfo = useHeaderInfo();

  if (headerInfo.mode === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = headerInfo.mode === "admin";
  const isEmpleado = headerInfo.mode === "empleado";
  const color = isAdmin ? COLORES.admin : COLORES.empleado;

  const nombreMostrado = isEmpleado
    ? [headerInfo.nombre, headerInfo.apellidoPaterno].filter(Boolean).join(" ") || "Empleado"
    : isAdmin
      ? "Administrador"
      : "Usuario";

  const avatarInitial = headerInfo.avatarInitial || nombreMostrado.charAt(0).toUpperCase();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          maxWidth: 600,
          textAlign: "center",
          borderRadius: 4,
          backgroundColor: color.fondo,
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Avatar
          sx={{
            mx: "auto",
            bgcolor: color.icono,
            width: 90,
            height: 90,
            fontSize: 36,
            color: "white",
            mb: 2,
          }}
        >
          {avatarInitial}
        </Avatar>

        {isAdmin ? (
          <AdminPanelSettings sx={{ fontSize: 70, color: color.icono }} />
        ) : (
          <EmojiPeople sx={{ fontSize: 70, color: color.icono }} />
        )}

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#0D47A1",
            mt: 2,
          }}
        >
          Bienvenido, {nombreMostrado}
        </Typography>

        {isEmpleado && (headerInfo.unidadNegocio || headerInfo.puesto) && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
            {headerInfo.unidadNegocio && (
              <Chip icon={<Business />} label={headerInfo.unidadNegocio} sx={{ fontWeight: 600 }} />
            )}
            {headerInfo.puesto && (
              <Chip icon={<Work />} label={headerInfo.puesto} sx={{ fontWeight: 600 }} />
            )}
          </Stack>
        )}

        <Typography
          variant="body1"
          sx={{
            mt: 3,
            opacity: 0.85,
            fontSize: 17,
            color: "#424242",
          }}
        >
          Selecciona alguno de los módulos del menú izquierdo para comenzar.
        </Typography>
      </Paper>
    </Box>
  );
}
