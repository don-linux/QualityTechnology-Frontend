import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

export default function TopBar({ rolLegible, drawerOpen, onToggleDrawer, onLogout }) {
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
          <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>{rolLegible}</Typography>
          <Avatar
            sx={{ bgcolor: "#004d40", border: "2px solid white", boxShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
          >
            {rolLegible.charAt(0).toUpperCase()}
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
