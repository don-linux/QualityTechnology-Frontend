import React, { useState } from "react";
import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import useAuth from "@app/providers/AuthProvider";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";

export default function CorporateLayout() {
  const { rolLegible, logout, hasModulo } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <Box sx={{ display: "flex" }}>
      <TopBar
        rolLegible={rolLegible}
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
        <Outlet />
      </Box>
    </Box>
  );
}
