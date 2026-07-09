import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

function resolveHeaderText(headerInfo) {
  const mode = headerInfo?.mode;
  if (mode === "empleado") {
    const primary = [headerInfo.nombre, headerInfo.apellidoPaterno].filter(Boolean).join(" ") || "Empleado";
    const secondary = [headerInfo.unidadNegocio, headerInfo.puesto].filter(Boolean).join(" · ");
    return { primary, secondary };
  }
  if (mode === "loading") return { primary: "Cargando…", secondary: "" };
  return { primary: headerInfo?.label || "Usuario", secondary: "" };
}

export default function TopBar({ headerInfo, drawerOpen, onToggleDrawer, onLogout }) {
  const { primary, secondary } = resolveHeaderText(headerInfo);
  const avatarInitial = headerInfo?.avatarInitial || primary.charAt(0).toUpperCase();

  return (
    <AppBar
      position="fixed"
      sx={{
        borderRadius: 0,
        background: "linear-gradient(90deg, #006d52, #3aa87d)",
        color: "white",
        zIndex: 1300,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            onClick={onToggleDrawer}
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            title={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            sx={{
              color: "white",
              fontSize: 22,
              minWidth: 0,
              padding: "6px 10px",
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.1)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
          </Button>
          <Typography variant="h6" noWrap fontWeight="bold">
            Sistema Integral Quality
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Box sx={{ textAlign: "right", minWidth: 0, maxWidth: { xs: 140, sm: 280 } }}>
            <Typography noWrap title={primary} sx={{ fontWeight: "bold", fontSize: "1rem", lineHeight: 1.2 }}>
              {primary}
            </Typography>
            {secondary && (
              <Typography noWrap title={secondary} sx={{ fontSize: "0.78rem", opacity: 0.9, lineHeight: 1.2 }}>
                {secondary}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{ bgcolor: "#004d40", border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
          >
            {avatarInitial}
          </Avatar>
          <Button
            variant="outlined"
            sx={{
              color: "#fff",
              borderColor: "#fff",
              textTransform: "none",
              borderRadius: 3,
              fontWeight: "bold",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
            onClick={onLogout}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
