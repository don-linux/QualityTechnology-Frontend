// src/layout/CorporateLayout.jsx
import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Avatar,
  Button,
  Collapse,
  ListItemIcon,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  Inventory,
  Store,
  AccountBalance,
  People,
  ExpandLess,
  ExpandMore,
  Handyman,
  Science,
  LocalMall,
  LocalAtm,
  Person,
  Folder,
  Savings,
  BugReport,
  ScienceOutlined,
  LocalHospital,
  CleaningServices,
  Grass,
  Biotech,
  ReceiptLong,
  LocationOn,
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
} from "@mui/icons-material";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { Link, useLocation, Outlet } from "react-router-dom";
import EggAltIcon from "@mui/icons-material/EggAlt";

const drawerWidth = 270;

export default function CorporateLayout() {
  const location = useLocation();
  const [openBitacora, setOpenBitacora] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const nombre = (localStorage.getItem("nombre") || "Usuario").trim();
  const rolRaw = localStorage.getItem("rol") || "";
  const modulosGuardados = JSON.parse(localStorage.getItem("modulos") || "[]");
  const modulos = new Set(
    modulosGuardados.map((m) => m.fc_nombre?.trim())
  );

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

  const mostrarNombre = rolLegible;

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* ===================== TOPBAR ===================== */}
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
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              onClick={toggleDrawer}
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
              Seguimiento de Salud Animal — Sistema
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
              {mostrarNombre}
            </Typography>

            <Avatar
              sx={{
                bgcolor: "#004d40",
                border: "2px solid white",
                boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
              }}
            >
              {mostrarNombre.charAt(0).toUpperCase()}
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
              onClick={logout}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ===================== SIDEBAR ===================== */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : 80,
          "& .MuiDrawer-paper": {
            borderRadius: 0,
            width: drawerOpen ? drawerWidth : 80,
            background: "linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%)",
            color: "white",
            borderRight: "none",
            paddingTop: "70px",
            overflowX: "hidden",
            transition: "width 0.3s ease",
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <img
            src={`${""}/images/quality.png`}
            alt="Logo"
            width={drawerOpen ? "110" : "40"}
            style={{ marginTop: "10px", transition: "all 0.3s ease" }}
          />
        </Box>

        <List sx={{ px: drawerOpen ? 1 : 0 }}>
          {/* DASHBOARD */}
          {drawerOpen && (
            <Typography
              sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mb: 1 }}
            >
              DASHBOARD
            </Typography>
          )}
          <ListItemButton
            component={Link}
            to="/"
            selected={location.pathname === "/"}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              backgroundColor:
                location.pathname === "/" ? "#388E3C" : "transparent",
              "&:hover": { backgroundColor: "#43A047" },
              justifyContent: drawerOpen ? "flex-start" : "center",
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
              <Dashboard />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Inicio" />}
          </ListItemButton>
          {modulos.has("Operaciones") && (
            <>
            {/* OPERACIONES */}
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                OPERACIONES
              </Typography>
            )}

            <ListItemButton
              onClick={() => setOpenBitacora(!openBitacora)}
              sx={{
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Assignment />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Bitácoras" />}
              {drawerOpen && (openBitacora ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            <Collapse in={openBitacora && drawerOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <Typography
                  sx={{
                    ml: 4,
                    mt: 1,
                    mb: 0.5,
                    fontSize: "13px",
                    color: "#61fce7ff",
                  }}
                >
                </Typography>

                <ListItemButton component={Link} to="/registro-operativo/plagas" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <BugReport />
                  </ListItemIcon>
                  <ListItemText primary="Control de Plagas" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/recepcion-insumos" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <ReceiptLong />
                  </ListItemIcon>
                  <ListItemText primary="Recepción de Insumos" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/visitas" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <People />
                  </ListItemIcon>
                  <ListItemText primary="Control de Visitas" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/limpieza-banos" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <CleaningServices />
                  </ListItemIcon>
                  <ListItemText primary="Limpieza de Baños" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/parametros" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <Biotech />
                  </ListItemIcon>
                  <ListItemText primary="Parámetros Físico-Químicos" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/medicamentos" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <LocalHospital />
                  </ListItemIcon>
                  <ListItemText primary="Aplicación de Medicamentos" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/recambios" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <ScienceOutlined />
                  </ListItemIcon>
                  <ListItemText primary="Recambios" />
                </ListItemButton>

                {/* La Ceiba */}
                <Typography
                  sx={{
                    ml: 4,
                    mt: 1,
                    mb: 0.5,
                    fontSize: "13px",
                    color: "#ebf74dff",
                  }}
                >
                </Typography>

                <ListItemButton component={Link} to="/registro-operativo/biometrias" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <Science />
                  </ListItemIcon>
                  <ListItemText primary="Biometrías" />
                </ListItemButton>

                <ListItemButton component={Link} to="/registro-operativo/alimentacion" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <Grass />
                  </ListItemIcon>
                  <ListItemText primary="Alimentación" />
                </ListItemButton>
                
                <ListItemButton component={Link} to="/registro-operativo/insumos" sx={{ pl: 5 }}>
                  <ListItemIcon sx={{ color: "white" }}>
                    <Inventory />
                  </ListItemIcon>
                  <ListItemText primary="Ingresos / Egresos Insumos" />
                </ListItemButton>
              </List>
            </Collapse>
            </>
          )}
          {modulos.has("Inventarios") && (
            <>
              {/* ===================== INVENTARIOS ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  INVENTARIOS
                </Typography>
              )}

              {/*  INVENTARIO DE ORGANISMOS */}
              {drawerOpen && (
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#90cdffff",
                    ml: 2,
                    mt: 1,
                    mb: 0.5,
                    fontSize: "13px",
                  }}
                >
                  Inventario de Organismos
                </Typography>
              )}

              <ListItemButton component={Link} to="/inventarios/lotes" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <EggAltIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Control Reproductivo" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/inventarios/piletas" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Science />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Alevinaje" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/inventarios/reproductores" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Biotech />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Reproductores" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/inventarios/engorda" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Grass />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Engorda" />}
              </ListItemButton>

              {/*  OTROS INVENTARIOS */}
              {drawerOpen && (
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#e3eb72ff",
                    ml: 2,
                    mt: 1.5,
                    mb: 0.5,
                    fontSize: "13px",
                  }}
                >
                  Otros Inventarios
                </Typography>
              )}

              <ListItemButton component={Link} to="/inventarios/instalaciones" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <HomeWorkIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Instalaciones" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/inventarios/alimentos" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <LocalMall />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Alimento e Insumos" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/inventarios/registro-operativo" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Handyman />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Equipo y Herramientas" />}
              </ListItemButton>
            </>
          )}
          {modulos.has("Ventas") && (
            <>
            {/* ===================== VENTAS ===================== */}
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                VENTAS
              </Typography>
            )}

            <ListItemButton component={Link} to="/ventas/lista-espera" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Store />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Próximas Ventas" />}
            </ListItemButton>

            <ListItemButton component={Link} to="/ventas/registro" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <LocalAtm />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Registro de Ventas" />}
            </ListItemButton>

            <ListItemButton component={Link} to="registro/cliente" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Clientes" />}
            </ListItemButton>
            </>
          )}
          {modulos.has("Finanzas") && (
            <>
              {/* ===================== ADMIN Y FINANZAS ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  ADMIN Y FINANZAS
                </Typography>
              )}

              <ListItemButton component={Link} to="/ventas/flujo-caja" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <AccountBalance />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Flujo de Caja" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/ventas/tesoreria" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <AccountBalance />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Tesorería General" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/proveedores" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Store />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Proveedores" />}
              </ListItemButton>
            </>
          )}
          {modulos.has("RRHH") && (
            <>
            {/* ===================== RRHH ===================== */}
              {drawerOpen && (
                <Typography
                  sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
                >
                  RRHH
                </Typography>
              )}

              <ListItemButton component={Link} to="/nomina" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Person />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Nómina" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/expedientes" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Folder />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Expedientes" />}
              </ListItemButton>

              <ListItemButton
                component={Link}
                to="/vacaciones"
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  backgroundColor:
                    location.pathname === "/vacaciones" ? "#388E3C" : "transparent",
                  "&:hover": { backgroundColor: "#43A047" },
                  justifyContent: drawerOpen ? "flex-start" : "center",
                }}
              >
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <EventAvailableIcon />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Vacaciones y Ausencias" />}
              </ListItemButton>

              <ListItemButton component={Link} to="/caja-ahorro" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Savings />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Caja de Ahorro" />}
              </ListItemButton>
            </>
          )}
        </List>
        {/* ===================== CATÁLOGOS ===================== */}
        {modulos.has("Catálogos") && (
          <>
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                CATÁLOGOS
              </Typography>
            )}

            <ListItemButton
              component={Link}
              to="/usuarios"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/usuarios" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Usuarios" />}
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/roles"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/roles" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Assignment />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Roles" />}
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/estados"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/estados" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <LocationOn />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Estados" />}
            </ListItemButton>
          </>
        )}
        {/* ===================== SEGURIDAD ===================== */}
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                SEGURIDAD
              </Typography>
            )}

            <ListItemButton
              component={Link}
              to="/usuarios"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/usuarios" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Módulos por rol" />}
            </ListItemButton>
      </Drawer>
      {/* ===================== CONTENIDO ===================== */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: 4,
          mt: "70px",
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: "95%",
            maxWidth: "1400px",
            backgroundColor: "#fff",
            borderRadius: 3,
            boxShadow: "0px 3px 10px rgba(0,0,0,0.1)",
            p: 4,
            mt: 2,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}