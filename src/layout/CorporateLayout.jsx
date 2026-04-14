// src/layout/CorporateLayout.jsx
import React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import ListItemIcon from "@mui/material/ListItemIcon";
import Dashboard from "@mui/icons-material/Dashboard";
import Assignment from "@mui/icons-material/Assignment";
import Inventory from "@mui/icons-material/Inventory";
import Store from "@mui/icons-material/Store";
import AccountBalance from "@mui/icons-material/AccountBalance";
import People from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Handyman from "@mui/icons-material/Handyman";
import Science from "@mui/icons-material/Science";
import LocalMall from "@mui/icons-material/LocalMall";
import LocalAtm from "@mui/icons-material/LocalAtm";
import Person from "@mui/icons-material/Person";
import Folder from "@mui/icons-material/Folder";
import Savings from "@mui/icons-material/Savings";
import BugReport from "@mui/icons-material/BugReport";
import ScienceOutlined from "@mui/icons-material/ScienceOutlined";
import LocalHospital from "@mui/icons-material/LocalHospital";
import CleaningServices from "@mui/icons-material/CleaningServices";
import Grass from "@mui/icons-material/Grass";
import Biotech from "@mui/icons-material/Biotech";
import ReceiptLong from "@mui/icons-material/ReceiptLong";
import Work from "@mui/icons-material/Work";
import Badge from "@mui/icons-material/Badge";
import Business from "@mui/icons-material/Business";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";

import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import { Link, useLocation, Outlet } from "react-router-dom";
import { logout } from "../utils/auth";
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
            style={{ marginTop: "10px", transition: "width 0.3s ease" }}
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

          <ListItemButton
            component={Link}
            to="/mi-perfil"
            sx={{
              borderRadius: 1,
              mb: 0.5,
              backgroundColor:
                location.pathname === "/mi-perfil" ? "#388E3C" : "transparent",
              "&:hover": { backgroundColor: "#43A047" },
              justifyContent: drawerOpen ? "flex-start" : "center",
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
              <AccountCircle />
            </ListItemIcon>
            {drawerOpen && <ListItemText primary="Mi Perfil" />}
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

              <ListItemButton component={Link} to="/empleados" sx={{ justifyContent: drawerOpen ? "flex-start" : "center" }}>
                <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                  <Badge />
                </ListItemIcon>
                {drawerOpen && <ListItemText primary="Empleados" />}
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
              to="/departamentos"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/departamentos" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Business />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Departamentos" />}
            </ListItemButton>

            <ListItemButton
              component={Link}
              to="/puestos"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/puestos" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <Work />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Puestos" />}
            </ListItemButton>
          </>
        )}
        {/* ===================== SEGURIDAD ===================== */}
        {modulos.has("Seguridad") && (
          <>
            {drawerOpen && (
              <Typography
                sx={{ fontWeight: "bold", color: "#C8E6C9", ml: 1, mt: 2, mb: 1 }}
              >
                SEGURIDAD
              </Typography>
            )}

            <ListItemButton
              component={Link}
              to="/seguridad/roles-modulos"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor:
                  location.pathname === "/seguridad/roles-modulos" ? "#388E3C" : "transparent",
                "&:hover": { backgroundColor: "#43A047" },
                justifyContent: drawerOpen ? "flex-start" : "center",
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 0, mr: drawerOpen ? 2 : 0 }}>
                <People />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary="Módulos por rol" />}
            </ListItemButton>
          </>
        )}
      </Drawer>
      {/* ===================== CONTENIDO ===================== */}
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