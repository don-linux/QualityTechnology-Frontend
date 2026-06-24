import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import useAuth from "@app/providers/AuthProvider";
import useMiPerfilHeader from "@features/rrhh/hooks/useMiPerfilHeader";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import { HeaderInfoProvider } from "./HeaderInfoContext";

export default function CorporateLayout() {
  const { esAdministrador, logout, hasModulo } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const headerInfo = useMiPerfilHeader(esAdministrador);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar
        headerInfo={headerInfo}
        drawerOpen={drawerOpen}
        onToggleDrawer={() => setDrawerOpen((prev) => !prev)}
        onLogout={logout}
      />
      <Sidebar drawerOpen={drawerOpen} hasModulo={hasModulo} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 3,
          mt: "70px",
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          overflow: "hidden",
        }}
      >
        <HeaderInfoProvider value={headerInfo}>
          <Outlet />
        </HeaderInfoProvider>
      </Box>
    </Box>
  );
}
