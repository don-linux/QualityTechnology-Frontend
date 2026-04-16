import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import EmojiPeople from "@mui/icons-material/EmojiPeople";
import AdminPanelSettings from "@mui/icons-material/AdminPanelSettings";
import Business from "@mui/icons-material/Business";

export default function Inicio() {
  const nombre = (localStorage.getItem("nombre") || "Usuario").trim();
  const rolRaw = localStorage.getItem("rol") || "";

  const rol = rolRaw
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  const nombreLower = nombre.toLowerCase();

  let rolLegible = "Usuario";
  if (
    rol.includes("admin") ||
    rol.includes("administrador") ||
    rol.includes("jefedeempresa")
  ) {
    if (nombreLower.includes("jefegam")) {
      rolLegible = "Jefe de Medellín";
    } else if (nombreLower.includes("jefegac")) {
      rolLegible = "Jefe de La Ceiba";
    } else {
      rolLegible = "Administrador";
    }
  }

  const colores = {
    Administrador: { fondo: "#E3F2FD", icono: "#1565C0" },
    "Jefe de Medellín": { fondo: "#E8F5E9", icono: "#2E7D32" },
    "Jefe de La Ceiba": { fondo: "#FFFDE7", icono: "#F9A825" },
    Usuario: { fondo: "#F3E5F5", icono: "#6A1B9A" },
  };

  const color = colores[rolLegible] || colores.Usuario;

  const getIcon = () => {
    if (rolLegible.includes("Administrador"))
      return <AdminPanelSettings sx={{ fontSize: 70, color: color.icono }} />;
    if (rolLegible.includes("Jefe"))
      return <Business sx={{ fontSize: 70, color: color.icono }} />;
    return <EmojiPeople sx={{ fontSize: 70, color: color.icono }} />;
  };

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
          {nombre.charAt(0).toUpperCase()}
        </Avatar>

        {getIcon()}

        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "#0D47A1",
            mt: 2,
          }}
        >
          Bienvenido, {rolLegible}
        </Typography>

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
